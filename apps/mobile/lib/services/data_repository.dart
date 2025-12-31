import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../database/database.dart';

class DataRepository {
  final ApiService _api = ApiService();
  final DatabaseHelper _db = DatabaseHelper.instance;

  // Transactions
  Future<List<Map<String, dynamic>>> getTransactions() async {
    try {
      final response = await _api.getTransactions();
      final List<dynamic> transactions = response.data;
      
      for (var tx in transactions) {
        await _db.insert('transactions', Map<String, dynamic>.from(tx));
      }
      return List<Map<String, dynamic>>.from(transactions);
    } catch (e) {
      return await _db.queryAll('transactions');
    }
  }

  // Parties
  Future<List<Map<String, dynamic>>> getParties() async {
    try {
      final response = await _api.getParties();
      final List<dynamic> parties = response.data;
      
      // Update local cache
      for (var party in parties) {
        await _db.insert('parties', Map<String, dynamic>.from(party));
      }
      return List<Map<String, dynamic>>.from(parties);
    } catch (e) {
      // Offline: Fallback to local DB
      return await _db.queryAll('parties');
    }
  }

  // Reminders
  Future<List<Map<String, dynamic>>> getReminders() async {
    try {
      final response = await _api.getReminders();
      final List<dynamic> reminders = response.data;
      for (var r in reminders) {
        await _db.insert('reminders', Map<String, dynamic>.from(r));
      }
      return List<Map<String, dynamic>>.from(reminders);
    } catch (e) {
      return await _db.queryAll('reminders');
    }
  }

  // Reports
  Future<Map<String, dynamic>> getReportSummary() async {
    try {
      final response = await _api.getReportSummary();
      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      return {};
    }
  }

  Future<void> syncOfflineData() async {
    final queue = await _db.queryAll('sync_queue');
    if (queue.isEmpty) return;

    for (var item in queue) {
      try {
        final data = jsonDecode(item['data']);
        if (item['table_name'] == 'parties') {
          if (item['action'] == 'CREATE') {
            await _api.createParty(data);
          }
        } else if (item['table_name'] == 'transactions') {
          if (item['action'] == 'CREATE') {
            await _api.createTransaction(data);
          }
        }
        await _db.delete('sync_queue', item['id'].toString());
      } catch (e) {
        debugPrint('Error syncing item ${item['id']}: $e');
      }
    }
  }

  Future<void> createParty(Map<String, dynamic> data) async {
    try {
      await _api.createParty(data);
      await _db.insert('parties', {...data, 'is_synced': 1});
    } catch (e) {
      await _db.insert('parties', {...data, 'is_synced': 0});
      await _db.insert('sync_queue', {
        'table_name': 'parties',
        'action': 'CREATE',
        'data': jsonEncode(data),
        'created_at': DateTime.now().toIso8601String(),
      });
    }
  }

  Future<void> createTransaction(Map<String, dynamic> data) async {
    try {
      await _api.createTransaction(data);
      await _db.insert('transactions', {...data, 'is_synced': 1});
    } catch (e) {
      await _db.insert('transactions', {...data, 'is_synced': 0});
      await _db.insert('sync_queue', {
        'table_name': 'transactions',
        'action': 'CREATE',
        'data': jsonEncode(data),
        'created_at': DateTime.now().toIso8601String(),
      });
    }
  }
}
