import 'package:flutter/material.dart';
import '../services/data_repository.dart';
import '../widgets/bottom_nav_layout.dart';
import '../widgets/animated_screen.dart';
import '../widgets/transaction_dialog.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final DataRepository _repository = DataRepository();
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final txs = await _repository.getTransactions();
    if (mounted) {
      setState(() {
        _transactions = txs;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFD91E63);

    return BottomNavLayout(
      currentIndex: 2,
      body: AnimatedScreen(
        child: Scaffold(
          backgroundColor: const Color(0xFFFCFCFC),
          appBar: AppBar(
            title: const Text('Transactions', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
            backgroundColor: Colors.white,
            elevation: 0,
            foregroundColor: const Color(0xFF1A1A1A),
            actions: [
              IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: _loadData,
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _buildTransactionList(),
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () async {
              await showDialog(
                context: context,
                builder: (context) => const TransactionDialog(isCredit: true),
              );
              _loadData();
            },
            backgroundColor: primaryColor,
            child: const Icon(Icons.add, color: Colors.white),
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionList() {
    if (_transactions.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 100),
          Center(child: Text('No transactions found', style: TextStyle(color: Color(0xFF64748B)))),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _transactions.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final tx = _transactions[index];
        final type = tx['type'] ?? 'GIVE';
        final isCredit = type == 'GET';
        final color = isCredit ? const Color(0xFF16A34A) : const Color(0xFFE11D48);

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE6E6E6)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(isCredit ? Icons.arrow_downward : Icons.arrow_upward, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tx['party_name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('${tx['date']?.split('T')[0] ?? ''} • ${tx['category'] ?? 'General'}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  ],
                ),
              ),
              Text(
                '${isCredit ? "+" : "-"} ₹ ${tx['amount'] ?? 0}',
                style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16, fontFamily: 'JetBrains Mono'),
              ),
            ],
          ),
        );
      },
    );
  }
}
