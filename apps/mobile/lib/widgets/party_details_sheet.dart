import 'package:flutter/material.dart';
import 'transaction_dialog.dart';

class PartyDetailSheet extends StatelessWidget {
  final String partyName;
  final String? partyId;
  final double balance;
  const PartyDetailSheet({super.key, required this.partyName, this.partyId, required this.balance});

  @override
  Widget build(BuildContext context) {
    final color = balance >= 0 ? const Color(0xFF16A34A) : const Color(0xFFE11D48);
    
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      decoration: const BoxDecoration(
        color: Color(0xFFFCFCFC),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(partyName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
                  const Text('Customer', style: TextStyle(color: Color(0xFF64748B), fontFamily: 'Public Sans')),
                ],
              ),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE6E6E6)),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Net Balance', style: TextStyle(fontSize: 16, color: Color(0xFF64748B))),
                Text(
                  '₹ ${balance.abs().toStringAsFixed(2)}',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color, fontFamily: 'JetBrains Mono'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          const Text('Transaction History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
          const SizedBox(height: 12),
          const Expanded(
            child: Center(child: Text('Coming soon...', style: TextStyle(color: Color(0xFF64748B)))),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _showTransactionDialog(context, false),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE11D48),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  ),
                  child: const Text('GIVE', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _showTransactionDialog(context, true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF16A34A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  ),
                  child: const Text('GET', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showTransactionDialog(BuildContext context, bool isCredit) {
    showDialog(
      context: context,
      builder: (context) => TransactionDialog(isCredit: isCredit, partyId: partyId),
    );
  }
}
