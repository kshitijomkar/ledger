import 'package:flutter/material.dart';
import '../services/data_repository.dart';
import '../widgets/bottom_nav_layout.dart';
import '../widgets/animated_screen.dart';

class RemindersScreen extends StatefulWidget {
  const RemindersScreen({super.key});

  @override
  State<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends State<RemindersScreen> {
  final DataRepository _repository = DataRepository();
  List<Map<String, dynamic>> _reminders = [];
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
      final data = await _repository.getReminders();
      if (mounted) {
        setState(() {
          _reminders = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFD91E63);

    return BottomNavLayout(
      currentIndex: 3,
      body: AnimatedScreen(
        child: Scaffold(
          backgroundColor: const Color(0xFFFCFCFC),
          appBar: AppBar(
            title: const Text('Reminders', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
            backgroundColor: Colors.white,
            elevation: 0,
            foregroundColor: const Color(0xFF1A1A1A),
          ),
          body: RefreshIndicator(
            onRefresh: _loadData,
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _reminders.isEmpty
                ? const Center(child: Text('No reminders found'))
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      if (_reminders.any((r) => r['status'] == 'overdue')) ...[
                        _buildSectionHeader('Overdue', Colors.red),
                        ..._reminders.where((r) => r['status'] == 'overdue').map((r) => _buildReminderCard(r['party_name'], '₹ ${r['amount']}', r['due_date'], true)),
                        const SizedBox(height: 24),
                      ],
                      _buildSectionHeader('Upcoming', Colors.orange),
                      ..._reminders.where((r) => r['status'] == 'pending').map((r) => _buildReminderCard(r['party_name'], '₹ ${r['amount']}', r['due_date'], false)),
                    ],
                  ),
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () {},
            backgroundColor: primaryColor,
            child: const Icon(Icons.add, color: Colors.white),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(width: 4, height: 20, color: color),
          const SizedBox(width: 8),
          Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildReminderCard(String name, String amount, String date, bool isOverdue) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isOverdue ? const Color(0xFFFFF1F2) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isOverdue ? const Color(0xFFFECDD3) : const Color(0xFFE6E6E6)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('Due: $date', style: TextStyle(color: isOverdue ? Colors.red : const Color(0xFF64748B), fontSize: 12)),
              ],
            ),
          ),
          Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'JetBrains Mono')),
          const SizedBox(width: 12),
          IconButton(icon: const Icon(Icons.check_circle_outline, color: Colors.green), onPressed: () {}),
        ],
      ),
    );
  }
}
