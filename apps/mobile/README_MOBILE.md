# Khatabook Flutter Mobile App

## Quick Start

### Prerequisites
- Flutter SDK 3.32.0+
- Android SDK / Emulator OR Physical Android Device

### Building the App

#### Debug Build (Development)
```bash
flutter pub get
flutter run
```

#### Release Build (APK)
```bash
# From project root
./build_flutter_apk.sh

# Or manually
cd apps/mobile
flutter build apk --release
```

#### APK Location
After successful build:
```
build/app/outputs/flutter-apk/app-release.apk
```

### Key Features
- ✅ Offline-first architecture (SQLite database)
- ✅ JWT authentication with backend
- ✅ Party management (customers/suppliers)
- ✅ Transaction tracking with running balance
- ✅ Reminders & notifications
- ✅ Financial reports & summaries
- ✅ Multi-language support
- ✅ Theme customization

### API Endpoints
Backend runs at: `http://localhost:8000`

All app requests go through:
- `/api/auth/*` - Authentication
- `/api/user/*` - User profile
- `/api/parties` - Customers/Suppliers
- `/api/transactions` - Financial records
- `/api/reminders` - Payment reminders
- `/api/reports/*` - Analytics

### Offline Mode
App automatically syncs with backend when online:
1. Local SQLite stores all data
2. Changes queued offline
3. Auto-syncs when connection restored

### Dependencies
```
flutter:
  sdk: flutter

sqflite: ^2.4.2          # Local database
dio: ^5.9.0              # HTTP requests
provider: ^6.1.2         # State management
shared_preferences: ^2.5.3 # Local preferences
path: ^1.9.1             # File paths
cupertino_icons: ^1.0.8  # iOS icons
```

### Testing
```bash
flutter test
```

### Troubleshooting

**Issue: Build fails with dependency errors**
```bash
flutter clean
flutter pub get
flutter build apk --release
```

**Issue: Can't connect to backend**
- Check backend is running: `curl http://localhost:8000/health`
- Check network connectivity
- Verify API endpoints in lib/services/api_service.dart

**Issue: Database locked**
```bash
# Clear app data
flutter run --verbose
# Or uninstall and reinstall
```

### Resources
- [Flutter Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev/guides)
- [SQLite Documentation](https://pub.dev/packages/sqflite)
- [Provider State Management](https://pub.dev/packages/provider)
