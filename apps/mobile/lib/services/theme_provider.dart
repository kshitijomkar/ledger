import 'package:flutter/material.dart';

class ThemeProvider extends ChangeNotifier {
  Color primary = const Color(0xFFD91E63);
  Color background = const Color(0xFFFCFCFC);
  Color card = const Color(0xFFFFFFFF);
  Color foreground = const Color(0xFF1A1A1A);
  
  void setTheme(int index) {
    if (index == 0) { // Classic
      primary = const Color(0xFFD91E63);
      background = const Color(0xFFFCFCFC);
      card = const Color(0xFFFFFFFF);
      foreground = const Color(0xFF1A1A1A);
    } else if (index == 1) { // Ocean
      primary = const Color(0xFF3B82F6);
      background = const Color(0xFFF0F8FF);
      card = const Color(0xFFFFFFFF);
      foreground = const Color(0xFF1C2E47);
    } else { // Midnight
      primary = const Color(0xFFE85D75);
      background = const Color(0xFF0A0E27);
      card = const Color(0xFF0F1729);
      foreground = const Color(0xFFF7F7F7);
    }
    notifyListeners();
  }
}
