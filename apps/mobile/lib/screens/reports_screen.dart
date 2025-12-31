import 'package:flutter/material.dart';
import '../services/data_repository.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final DataRepository _repository = DataRepository();
  Map<String, dynamic>? _summary;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchSummary();
  }

  Future<void> _fetchSummary() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final res = await _repository.getReportSummary();
      if (mounted) {
        setState(() {
          _summary = res;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFCFC),
      appBar: AppBar(
        title: const Text('Business Reports', style: TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF1A1A1A),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchSummary,
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSummaryCard(),
                  const SizedBox(height: 32),
                  const Text('Available Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
                  const SizedBox(height: 16),
                  _buildActionTile(Icons.picture_as_pdf, 'Download PDF Report', 'Get a detailed PDF of all transactions'),
                  _buildActionTile(Icons.table_view, 'Export to Excel', 'Export your ledger data to CSV/Excel'),
                ],
              ),
            ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE6E6E6)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStat('Receivable', _summary?['total_credit'] ?? 0, const Color(0xFF16A34A)),
              _buildStat('Payable', _summary?['total_debit'] ?? 0, const Color(0xFFE11D48)),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Divider(color: Color(0xFFE6E6E6)),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Net Balance', style: TextStyle(fontSize: 16, color: Color(0xFF64748B), fontFamily: 'Public Sans')),
              Text(
                '₹ ${_summary?['net_balance'] ?? 0}',
                style: TextStyle(
                  fontSize: 24, 
                  fontWeight: FontWeight.bold, 
                  color: (_summary?['net_balance'] ?? 0) >= 0 ? const Color(0xFF16A34A) : const Color(0xFFE11D48),
                  fontFamily: 'JetBrains Mono'
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStat(String label, dynamic value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontFamily: 'Public Sans')),
        const SizedBox(height: 4),
        Text('₹ $value', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color, fontFamily: 'JetBrains Mono')),
      ],
    );
  }

  Widget _buildActionTile(IconData icon, String title, String sub) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE6E6E6)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: const Color(0xFFF5F5F5), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: const Color(0xFFD91E63)),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, fontFamily: 'Public Sans')),
        subtitle: Text(sub, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1)),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Report generation started...')),
          );
        },
      ),
    );
  }
}
