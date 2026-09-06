import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eletricistapro.app',
  appName: 'Eletricista Pro',
  webDir: "www",
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#0A0A0A'
  }
};

export default config;
