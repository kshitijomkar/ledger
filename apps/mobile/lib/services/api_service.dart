import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  late final Dio _dio;
  late String baseUrl;

  ApiService() {
    // Initialize Dio after setting baseUrl dynamically
    _initializeBaseUrl();
    _setupDio();
  }

  /// Get the API base URL dynamically
  /// Uses dart-define at build time to set API_URL
  /// Example: flutter build apk --release --dart-define=API_URL=https://your-backend.com/api
  String getApiBaseUrl() {
    const String apiUrl = String.fromEnvironment(
      'API_URL',
      defaultValue: 'https://api.khatabook.com/api', // Default production URL
    );
    return apiUrl;
  }

  void _initializeBaseUrl() {
    baseUrl = getApiBaseUrl();
  }

  void _setupDio() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      contentType: 'application/json',
    ));

    // Add interceptor for JWT token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Handle 401 Unauthorized
        if (error.response?.statusCode == 401) {
          // Clear token and redirect to login
          SharedPreferences.getInstance().then((prefs) {
            prefs.remove('jwt_token');
          });
        }
        return handler.next(error);
      },
    ));
  }

  // ============== AUTH ENDPOINTS ==============
  Future<Response> login(String email, String password) async {
    return await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register(Map<String, dynamic> userData) async {
    return await _dio.post('/auth/register', data: userData);
  }

  Future<Response> logout() async {
    return await _dio.post('/auth/logout');
  }

  // ============== USER ENDPOINTS ==============
  Future<Response> getUserProfile() async {
    return await _dio.get('/user/profile');
  }

  Future<Response> updateUserProfile(Map<String, dynamic> data) async {
    return await _dio.put('/user/profile', data: data);
  }

  Future<Response> getUserSettings() async {
    return await _dio.get('/user/settings');
  }

  // ============== PARTY ENDPOINTS ==============
  Future<Response> getParties() async {
    return await _dio.get('/parties');
  }

  Future<Response> getPartyById(String id) async {
    return await _dio.get('/parties/$id');
  }

  Future<Response> createParty(Map<String, dynamic> data) async {
    return await _dio.post('/parties', data: data);
  }

  Future<Response> updateParty(String id, Map<String, dynamic> data) async {
    return await _dio.put('/parties/$id', data: data);
  }

  Future<Response> deleteParty(String id) async {
    return await _dio.delete('/parties/$id');
  }

  // ============== TRANSACTION ENDPOINTS ==============
  Future<Response> getTransactions() async {
    return await _dio.get('/transactions');
  }

  Future<Response> getTransactionById(String id) async {
    return await _dio.get('/transactions/$id');
  }

  Future<Response> createTransaction(Map<String, dynamic> data) async {
    return await _dio.post('/transactions', data: data);
  }

  Future<Response> updateTransaction(String id, Map<String, dynamic> data) async {
    return await _dio.put('/transactions/$id', data: data);
  }

  // ============== REMINDER ENDPOINTS ==============
  Future<Response> getReminders() async {
    return await _dio.get('/reminders');
  }

  Future<Response> getReminderById(String id) async {
    return await _dio.get('/reminders/$id');
  }

  Future<Response> createReminder(Map<String, dynamic> data) async {
    return await _dio.post('/reminders', data: data);
  }

  Future<Response> updateReminder(String id, Map<String, dynamic> data) async {
    return await _dio.put('/reminders/$id', data: data);
  }

  Future<Response> deleteReminder(String id) async {
    return await _dio.delete('/reminders/$id');
  }

  // ============== SYNC ENDPOINTS ==============
  Future<Response> sync(Map<String, dynamic> data) async {
    return await _dio.post('/sync', data: data);
  }

  Future<Response> getSyncStatus() async {
    return await _dio.get('/sync-status');
  }

  // ============== REPORT ENDPOINTS ==============
  Future<Response> getReportSummary() async {
    return await _dio.get('/reports/summary');
  }

  Future<Response> getReportDaily({int days = 7}) async {
    return await _dio.get('/reports/daily', queryParameters: {'days': days});
  }

  Future<Response> getReportPartyWise() async {
    return await _dio.get('/reports/party-wise');
  }

  // ============== TRANSACTION DELETE ==============
  Future<Response> deleteTransaction(String id) async {
    return await _dio.delete('/transactions/$id');
  }

  // ============== REMINDER STATUS UPDATE ==============
  Future<Response> updateReminderStatus(String id, String status) async {
    return await _dio.put('/reminders/$id/status', queryParameters: {'status': status});
  }
}
