import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.staysync.app',
  appName: 'StaySync',
  webDir: 'out',
  plugins: {
    StatusBar: {
      overlay: true,
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;
