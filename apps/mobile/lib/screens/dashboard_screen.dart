import 'package:flutter/material.dart';
import '../services/data_repository.dart';
import '../widgets/animated_screen.dart';
import '../widgets/transaction_dialog.dart';
import '../widgets/bottom_nav_layout.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final DataRepository _repository = DataRepository();
  List<Map<String, dynamic>> _recentTransactions = [];
  Map<String, dynamic>? _summary;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final txs = await _repository.getTransactions();
      final summaryRes = await _repository.getReportSummary();
      
      if (mounted) {
        setState(() {
          _recentTransactions = txs.take(5).toList();
          _summary = summaryRes;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavLayout(
      currentIndex: 0,
      body: AnimatedScreen(
        child: Scaffold(
          backgroundColor: const Color(0xFFFCFCFC),
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 24),
                    _buildSummaryGrid(),
                    const SizedBox(height: 32),
                    _buildSectionTitle('Recent Transactions'),
                    const SizedBox(height: 12),
                    _isLoading 
                      ? const Center(child: CircularProgressIndicator())
                      : _buildTransactionList(),
                  ],
                ),
              ),
            ),
          ),
          floatingActionButton: _buildFAB(context),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Khatabook Pro', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF1A1A1A), fontFamily: 'Manrope')),
        Text('Financial Overview', style: TextStyle(fontSize: 14, color: Color(0xFF64748B), fontFamily: 'Public Sans')),
      ],
    );
  }

  Widget _buildSummaryGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _buildStatCard('Receivable', '₹ ${_summary?['total_credit'] ?? 0}', const Color(0xFF16A34A), Icons.arrow_downward),
        _buildStatCard('Payable', '₹ ${_summary?['total_debit'] ?? 0}', const Color(0xFFE11D48), Icons.arrow_upward),
        _buildStatCard('Net Balance', '₹ ${_summary?['net_balance'] ?? 0}', const Color(0xFFD91E63), Icons.account_balance_wallet),
        _buildStatCard('Pending', '${_summary?['pending_reminders'] ?? 0}', const Color(0xFF475569), Icons.notifications_none),
      ],
    );
  }

  Widget _buildStatCard(String label, String amount, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE6E6E6)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontFamily: 'Public Sans')),
              Icon(icon, size: 14, color: color),
            ],
          ),
          Text(amount, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: color, fontFamily: 'JetBrains Mono')),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1A1A1A), fontFamily: 'Manrope')),
        const Text('View All', style: TextStyle(fontSize: 14, color: Color(0xFFD91E63), fontWeight: FontWeight.w600, fontFamily: 'Public Sans')),
      ],
    );
  }

  Widget _buildTransactionList() {
    if (_recentTransactions.isEmpty) {
      return const Center(child: Text('No transactions yet', style: TextStyle(color: Color(0xFF64748B))));
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _recentTransactions.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final tx = _recentTransactions[index];
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
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: const Color(0xFFF5F5F5), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.person, color: Color(0xFFD91E63), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tx['party_name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, fontFamily: 'Public Sans')),
                    Text('${tx['date']?.split('T')[0] ?? ''} • ${tx['category'] ?? 'General'}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontFamily: 'Public Sans')),
                  ],
                ),
              ),
              Text('${isCredit ? '+' : '-'} ₹ ${tx['amount'] ?? 0}', style: TextStyle(fontWeight: FontWeight.w700, color: color, fontSize: 16, fontFamily: 'JetBrains Mono')),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFAB(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD91E63).withValues(alpha: 0.4),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: FloatingActionButton(
        onPressed: () async {
          await showDialog(
            context: context,
            builder: (context) => const TransactionDialog(isCredit: true),
          );
          _loadData();
        },
        backgroundColor: const Color(0xFFD91E63),
        elevation: 0,
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: Colors.white, size: 32),
      ),
    );
  }
}
