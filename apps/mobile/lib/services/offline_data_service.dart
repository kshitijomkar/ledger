import 'package:dio/dio.dart';
import '../models/party_model.dart';
import '../models/transaction_model.dart';
import '../database/database.dart';
import 'api_service.dart';
import 'dart:convert';

class OfflineDataService {
  final ApiService _api = ApiService();
  final DatabaseHelper _db = DatabaseHelper.instance;

  // Sync logic - Full reconciliation
  Future<void> fullSync() async {
    try {
      // 1. Push local changes
      await _pushLocalChanges();
      
      // 2. Pull remote changes
      await _pullRemoteChanges();
    } catch (e) {
      print('Full sync failed: $e');
    }
  }

  Future<void> _pushLocalChanges() async {
    final queue = await _db.queryAll('sync_queue');
    if (queue.isEmpty) return;

    for (var item in queue) {
      try {
        final data = jsonDecode(item['data']);
        if (item['table_name'] == 'parties') {
          if (item['action'] == 'CREATE') await _api.createParty(data);
          else if (item['action'] == 'UPDATE') await _api.updateParty(data['id'], data);
          else if (item['action'] == 'DELETE') await _api.deleteParty(data['id']);
        } else if (item['table_name'] == 'transactions') {
          if (item['action'] == 'CREATE') await _api.createTransaction(data);
          else if (item['action'] == 'DELETE') await _api.deleteTransaction(data['id']);
        }
        await _db.delete('sync_queue', item['id'].toString());
      } catch (e) {
        print('Error pushing item ${item['id']}: $e');
      }
    }
  }

  Future<void> _pullRemoteChanges() async {
    // Sync parties
    final partyRes = await _api.getParties();
    for (var party in partyRes.data) {
      await _db.insert('parties', Map<String, dynamic>.from(party));
    }

    // Sync transactions
    final txRes = await _api.getTransactions();
    for (var tx in txRes.data) {
      await _db.insert('transactions', Map<String, dynamic>.from(tx));
    }
  }

  // Parties
  Future<List<PartyModel>> getParties() async {
    try {
      final response = await _api.getParties();
      final List<dynamic> data = response.data;
      final parties = data.map((json) => PartyModel.fromJson(json)).toList();
      
      for (var party in data) {
        await _db.insert('parties', Map<String, dynamic>.from(party));
      }
      return parties;
    } catch (e) {
      final localData = await _db.queryAll('parties');
      return localData.map((json) => PartyModel.fromJson(json)).toList();
    }
  }

  Future<void> createParty(Map<String, dynamic> data) async {
    try {
      await _api.createParty(data);
      await _db.insert('parties', data);
    } catch (e) {
      await _db.insert('parties', data);
      await _db.insert('sync_queue', {
        'table_name': 'parties',
        'action': 'CREATE',
        'data': jsonEncode(data),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  // Transactions
  Future<List<TransactionModel>> getTransactions() async {
    try {
      final response = await _api.getTransactions();
      final List<dynamic> data = response.data;
      final transactions = data.map((json) => TransactionModel.fromJson(json)).toList();
      
      for (var tx in data) {
        await _db.insert('transactions', Map<String, dynamic>.from(tx));
      }
      return transactions;
    } catch (e) {
      final localData = await _db.queryAll('transactions');
      return localData.map((json) => TransactionModel.fromJson(json)).toList();
    }
  }

  Future<void> createTransaction(Map<String, dynamic> data) async {
    try {
      await _api.createTransaction(data);
      await _db.insert('transactions', data);
    } catch (e) {
      await _db.insert('transactions', data);
      await _db.insert('sync_queue', {
        'table_name': 'transactions',
        'action': 'CREATE',
        'data': jsonEncode(data),
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }
}
