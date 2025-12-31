import 'package:flutter/material.dart';
import '../screens/dashboard_screen.dart';
import '../screens/parties_screen.dart';
import '../screens/transactions_screen.dart';
import '../screens/reminders_screen.dart';
import '../screens/settings_screen.dart';

class BottomNavLayout extends StatefulWidget {
  final Widget body;
  final int currentIndex;

  const BottomNavLayout({
    super.key,
    required this.body,
    required this.currentIndex,
  });

  @override
  State<BottomNavLayout> createState() => _BottomNavLayoutState();
}

class _BottomNavLayoutState extends State<BottomNavLayout> {
  void _onItemTapped(int index) {
    if (index == widget.currentIndex) return;

    Widget nextScreen;
    switch (index) {
      case 0:
        nextScreen = const DashboardScreen();
        break;
      case 1:
        nextScreen = const PartiesScreen();
        break;
      case 2:
        nextScreen = const TransactionsScreen();
        break;
      case 3:
        nextScreen = const RemindersScreen();
        break;
      case 4:
        nextScreen = const SettingsScreen();
        break;
      default:
        return;
    }

    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation1, animation2) => nextScreen,
        transitionDuration: Duration.zero,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.body,
      bottomNavigationBar: Container(
        height: 72,
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE6E6E6))),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(
              icon: Icons.dashboard,
              label: 'Home',
              isActive: widget.currentIndex == 0,
              onTap: () => _onItemTapped(0),
            ),
            _NavItem(
              icon: Icons.people,
              label: 'Parties',
              isActive: widget.currentIndex == 1,
              onTap: () => _onItemTapped(1),
            ),
            _NavItem(
              icon: Icons.history,
              label: 'History',
              isActive: widget.currentIndex == 2,
              onTap: () => _onItemTapped(2),
            ),
            _NavItem(
              icon: Icons.notifications,
              label: 'Reminders',
              isActive: widget.currentIndex == 3,
              onTap: () => _onItemTapped(3),
            ),
            _NavItem(
              icon: Icons.settings,
              label: 'More',
              isActive: widget.currentIndex == 4,
              onTap: () => _onItemTapped(4),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? const Color(0xFFD91E63) : const Color(0xFF64748B);
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}
