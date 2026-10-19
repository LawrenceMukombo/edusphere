import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legacyschool.edusphere',
  appName: 'EduSphere',
  webDir: 'out',
  server: {
    // Connects to the verified production deployment for live over-the-air updates
    url: 'https://legacyschool.lamtoninvestments.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
