import 'package:flutter/material.dart';
import '../models/party_model.dart';
import '../models/transaction_model.dart';
import '../services/data_repository.dart';

class AppProvider with ChangeNotifier {
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  List<PartyModel> _parties = [];
  List<PartyModel> get parties => _parties;

  List<TransactionModel> _transactions = [];
  List<TransactionModel> get transactions => _transactions;

  final DataRepository _repository = DataRepository();

  Future<void> fetchInitialData() async {
    _isLoading = true;
    notifyListeners();

    try {
      _parties = (await _repository.getParties()).map((p) => PartyModel.fromJson(p)).toList();
      _transactions = (await _repository.getTransactions()).map((t) => TransactionModel.fromJson(t)).toList();
    } catch (e) {
      debugPrint('Error fetching data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addParty(Map<String, dynamic> data) async {
    await _repository.createParty(data);
    await fetchInitialData();
  }

  Future<void> addTransaction(Map<String, dynamic> data) async {
    await _repository.createTransaction(data);
    await fetchInitialData();
  }

  Future<void> syncData() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _repository.syncOfflineData();
      await fetchInitialData();
    } catch (e) {
      debugPrint('Sync failed: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
