import 'package:flutter/material.dart';
import '../services/data_repository.dart';

class TransactionDialog extends StatefulWidget {
  final bool isCredit;
  final String? partyId;
  const TransactionDialog({super.key, required this.isCredit, this.partyId});

  @override
  State<TransactionDialog> createState() => _TransactionDialogState();
}

class _TransactionDialogState extends State<TransactionDialog> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final DataRepository _repository = DataRepository();
  String? _selectedPartyId;
  List<Map<String, dynamic>> _parties = [];
  bool _isLoadingParties = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _selectedPartyId = widget.partyId;
    _loadParties();
  }

  Future<void> _loadParties() async {
    final parties = await _repository.getParties();
    setState(() {
      _parties = parties;
      _isLoadingParties = false;
    });
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedPartyId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a party')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final data = {
      'party_id': _selectedPartyId,
      'amount': amount,
      'type': widget.isCredit ? 'GET' : 'GIVE',
      'description': _descriptionController.text,
      'date': DateTime.now().toIso8601String(),
      'category': 'General',
    };

    try {
      await _repository.createTransaction(data);
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.isCredit ? const Color(0xFF16A34A) : const Color(0xFFE11D48);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.isCredit ? 'Add Payment Received' : 'Add Payment Made',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'Manrope'),
              ),
              const SizedBox(height: 24),
              if (_isLoadingParties)
                const Center(child: CircularProgressIndicator())
              else
                DropdownButtonFormField<String>(
                  value: _selectedPartyId,
                  decoration: const InputDecoration(labelText: 'Select Party'),
                  items: _parties.map((p) {
                    return DropdownMenuItem(
                      value: p['id'].toString(),
                      child: Text(p['name'] ?? 'Unknown'),
                    );
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedPartyId = val),
                  validator: (val) => val == null ? 'Required' : null,
                ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                decoration: InputDecoration(
                  labelText: 'Amount (₹)',
                  hintText: '0.00',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                keyboardType: TextInputType.number,
                validator: (val) => (val == null || val.isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description (Optional)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: _isSaving ? null : () => Navigator.pop(context), 
                    child: const Text('Cancel')
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _isSaving ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: color,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                    child: _isSaving 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('SAVE'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
