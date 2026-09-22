import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.amakara.kondatenavi",
  appName: "食材カメラ献立ナビ",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    contentInset: "always",
    preferredContentMode: "mobile",
    scheme: "App",
  },
  plugins: {
    // Optional plugin configurations
  },
};

export default config;
