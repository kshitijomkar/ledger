import 'package:flutter/material.dart';
import '../widgets/bottom_nav_layout.dart';
import '../widgets/animated_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BottomNavLayout(
      currentIndex: 4,
      body: AnimatedScreen(
        child: Scaffold(
          backgroundColor: const Color(0xFFFCFCFC),
          appBar: AppBar(
            title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold, fontFamily: 'Manrope')),
            backgroundColor: Colors.white,
            elevation: 0,
            foregroundColor: const Color(0xFF1A1A1A),
          ),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSection('Application Settings'),
              _buildSettingItem(Icons.language, 'Language', 'English'),
              _buildSettingItem(Icons.palette, 'Theme', 'Classic Ledger'),
              _buildSettingItem(Icons.text_fields, 'Font Size', 'Medium'),
              const SizedBox(height: 24),
              _buildSection('Account'),
              _buildSettingItem(Icons.person_outline, 'Profile', ''),
              _buildSettingItem(Icons.security, 'Security', ''),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                ),
                child: const Text('Logout', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
    );
  }

  Widget _buildSettingItem(IconData icon, String title, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE6E6E6)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFFD91E63), size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.w500))),
          if (value.isNotEmpty) Text(value, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const Icon(Icons.chevron_right, color: Color(0xFFCBD5E1), size: 20),
        ],
      ),
    );
  }
}
