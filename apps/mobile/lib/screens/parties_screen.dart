import 'package:flutter/material.dart';
import '../services/data_repository.dart';
import '../widgets/animated_screen.dart';
import '../widgets/party_details_sheet.dart';
import '../widgets/bottom_nav_layout.dart';

class PartiesScreen extends StatefulWidget {
  final bool isSupplier;
  const PartiesScreen({super.key, this.isSupplier = false});

  @override
  State<PartiesScreen> createState() => _PartiesScreenState();
}

class _PartiesScreenState extends State<PartiesScreen> {
  final TextEditingController _searchController = TextEditingController();
  final DataRepository _repository = DataRepository();
  List<Map<String, dynamic>> _parties = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final parties = await _repository.getParties();
    if (mounted) {
      setState(() {
        _parties = parties.where((p) => p['party_type'] == (widget.isSupplier ? 'SUPPLIER' : 'CUSTOMER')).toList();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.isSupplier ? 'Suppliers' : 'Customers';
    final primaryColor = const Color(0xFFD91E63);

    return BottomNavLayout(
      currentIndex: 1,
      body: AnimatedScreen(
        child: Scaffold(
          backgroundColor: const Color(0xFFFCFCFC),
          appBar: AppBar(
            title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
            backgroundColor: Colors.white,
            elevation: 0,
            foregroundColor: const Color(0xFF1A1A1A),
          ),
          body: RefreshIndicator(
            onRefresh: _loadData,
            child: Column(
              children: [
                _buildSearchBar(),
                Expanded(
                  child: _isLoading 
                    ? const Center(child: CircularProgressIndicator())
                    : _buildPartyList(primaryColor)
                ),
              ],
            ),
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: () => _showAddPartyDialog(context),
            backgroundColor: primaryColor,
            child: const Icon(Icons.add, color: Colors.white),
          ),
        ),
      ),
    );
  }

  void _showAddPartyDialog(BuildContext context) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add ${widget.isSupplier ? 'Supplier' : 'Customer'}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone'), keyboardType: TextInputType.phone),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty) {
                await _repository.createParty({
                  'name': nameController.text,
                  'phone': phoneController.text,
                  'party_type': widget.isSupplier ? 'SUPPLIER' : 'CUSTOMER',
                  'balance': 0.0,
                  'created_at': DateTime.now().toIso8601String(),
                });
                if (mounted) {
                  Navigator.pop(context);
                  _loadData();
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          // Implement client-side search filtering
          setState(() {});
        },
        decoration: InputDecoration(
          hintText: 'Search by name or phone...',
          prefixIcon: const Icon(Icons.search),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE6E6E6)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE6E6E6)),
          ),
        ),
      ),
    );
  }

  Widget _buildPartyList(Color primary) {
    final filteredParties = _parties.where((p) {
      final query = _searchController.text.toLowerCase();
      final name = (p['name'] ?? '').toString().toLowerCase();
      final phone = (p['phone'] ?? '').toString().toLowerCase();
      return name.contains(query) || phone.contains(query);
    }).toList();

    if (filteredParties.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 100),
          Center(child: Text('No parties found', style: TextStyle(color: Color(0xFF64748B)))),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: filteredParties.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final party = filteredParties[index];
        final balance = (party['balance'] ?? 0.0).toDouble();
        final color = balance >= 0 ? const Color(0xFF16A34A) : const Color(0xFFE11D48);
        
        return GestureDetector(
          onTap: () {
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (context) => PartyDetailSheet(
                partyName: party['name'] ?? 'Unknown',
                balance: balance,
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE6E6E6)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: const Color(0xFFF5F5F5),
                  child: Text(
                    (party['name'] ?? 'U')[0].toUpperCase(), 
                    style: TextStyle(color: primary, fontWeight: FontWeight.bold)
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(party['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(party['phone'] ?? 'No phone', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '₹ ${balance.abs().toStringAsFixed(0)}',
                      style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16, fontFamily: 'JetBrains Mono'),
                    ),
                    Text(
                      balance >= 0 ? 'Receivable' : 'Payable',
                      style: TextStyle(color: color.withValues(alpha: 0.8), fontSize: 10),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
