# Android Build Fix for Flutter APK

## The Issue
Flutter is detecting deprecated Android v1 embedding files in your project. This is a compatibility issue with the Android project structure.

## Quick Fix (Choose One)

### Option 1: Rebuild from Scratch (Recommended)
Delete android directory and regenerate:
```bash
cd apps/mobile
rm -rf android/
flutter create --android .
flutter pub get
flutter build apk --release
```

### Option 2: Manual Fix
Update the package name in build.gradle to match AndroidManifest:
```bash
cd apps/mobile/android/app
# Edit build.gradle and change namespace to match package name
sed -i 's/com.khatabook.khatabook_flutter_app/com.khatabook.pro/g' build.gradle
```

Then rebuild:
```bash
cd apps/mobile
flutter build apk --release
```

### Option 3: Use Flutter Channel Update
```bash
flutter channel stable
flutter upgrade
flutter pub get
flutter build apk --release
```

## Expected Output
When successful, you'll see:
```
✓ Built build/app/outputs/flutter-apk/app-release.apk (XX.X MB)
```

## Troubleshooting
If still fails:
1. Clean completely: `flutter clean && rm -rf build .dart_tool`
2. Get dependencies: `flutter pub get`
3. Rebuild: `flutter build apk --release`

If that doesn't work, use Option 1 (rebuild from scratch).
