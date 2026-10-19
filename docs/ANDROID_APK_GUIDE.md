# Legacy School Solwezi — EduSphere SMIS Android APK & Mobile Distribution Guide

This guide provides instructions for building, packaging, and distributing the **EduSphere SMIS Android APK (`.apk` / `.aab`)** and deploying the mobile-compliant web application for Legacy School Solwezi.

---

## 1. Architecture Overview

EduSphere SMIS is engineered as a **mobile-first, responsive, and offline-first PWA**. It supports three deployment pathways for Android devices:

| Pathway | Output | Ideal For | Offline Support | Installation Method |
| :--- | :--- | :--- | :--- | :--- |
| **A. Capacitor Native APK** | `.apk` (Debug/Release) | Staff tablets, biometric terminals, warden phones | Yes (Local Storage & Cache) | Direct APK sideload or MDM |
| **B. Google Play Store TWA** | `.aab` (Android App Bundle) | Parent portal, public distribution | Yes | Google Play Store |
| **C. Instant PWA App** | Web App Icon | Immediate zero-install deployment | Yes (Service Worker) | "Add to Home Screen" prompt |

---

## 2. Option A: Building the Standalone Android APK via Capacitor

### Prerequisites
- Node.js 18+ and npm installed
- Android Studio (Hedgehog 2023.1.1 or newer) with Android SDK API 33+ (Android 13/14)
- Java Development Kit (JDK 17 or JDK 21)

### Step 1: Install Capacitor Android Dependencies
Run in the project root:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize & Sync the Android Project
```bash
npx cap add android
npx cap sync android
```
This creates the native Android Studio project in `./android/` pre-configured with package ID `com.legacyschool.edusphere` pointing to `https://legacyschool.lamtoninvestments.com`.

### Step 3: Open in Android Studio & Build APK
```bash
npx cap open android
```
In Android Studio:
1. Wait for Gradle sync to complete.
2. Select **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once the build completes, find your signed APK at:
   `android/app/build/outputs/apk/debug/app-debug.apk` (or `release/app-release.apk`).
4. Transfer this `.apk` directly to Android phones or school tablets for instant installation.

### Step 4: Command-Line Headless APK Build (No GUI)
If building on a CI/CD server or headless environment:
```bash
cd android
./gradlew assembleDebug
# Resulting APK: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Option B: Building a Trusted Web Activity (TWA) via Bubblewrap

Google Bubblewrap wraps the deployed web application into an official Play Store `.aab` bundle using Chrome's native engine:

```bash
# 1. Install Google Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize from production manifest
bubblewrap init --manifest=https://legacyschool.lamtoninvestments.com/manifest.json

# 3. Build signed Android App Bundle (AAB) & APK
bubblewrap build
```

The resulting `app-release-signed.apk` and `app-release-bundle.aab` can be uploaded directly to the Google Play Console under the developer account for Lamton Investments Ltd.

---

## 4. Option C: Instant Progressive Web App (PWA) Installation

EduSphere includes an active web app manifest (`/manifest.json`) and service worker cache:
1. Open Google Chrome on any Android smartphone or tablet.
2. Navigate to `https://legacyschool.lamtoninvestments.com/`.
3. Tap the browser banner: **"Install Legacy School EduSphere"** (or tap ⋮ > **Add to Home screen**).
4. The app installs with a native icon, launches full-screen without URL bars (`display: standalone`), and operates seamlessly offline.

---

## 5. Mobile & Android Responsive Features Included

- **Safe-Area Insets**: Respects Android system gesture bars, curved display corners, and camera notches.
- **Mobile Bottom Navigation**: 1-tap thumb navigation for Dashboard, Attendance, Boarding, Finance, and All Modules.
- **Responsive Slide-out Drawer**: Full access to all 14 management modules from any screen size (`< 640px`).
- **Touch-Friendly Hit Targets**: Buttons and interactive controls have minimum 44px tap targets.
- **Print & PDF Support**: Allows direct printing to mobile Bluetooth/Wi-Fi receipt printers and PDF exports.
