import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";

// Google AdMob Credentials for 食材カメラ献立ナビ
export const ADMOB_CONFIG = {
  PUBLISHER_ID: "pub-5492036901030821",
  IOS_APP_ID: "ca-app-pub-5492036901030821~9671711467",
  IOS_BANNER_AD_UNIT_ID: "ca-app-pub-5492036901030821/9661596468",
  ANDROID_APP_ID: "ca-app-pub-5492036901030821~3509627790",
  ANDROID_BANNER_AD_UNIT_ID: "ca-app-pub-5492036901030821/6210978607",
  
  // Official Google Test Ad Unit IDs (protects AdMob account from invalid traffic during development & testing)
  TEST_IOS_BANNER_ID: "ca-app-pub-3940256099942544/2934735716",
  TEST_ANDROID_BANNER_ID: "ca-app-pub-3940256099942544/6300978111",
};

class AdMobManager {
  private isInitialized = false;
  private isBannerVisible = false;

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  public getPlatform(): string {
    return Capacitor.getPlatform();
  }

  public async initialize(): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      const isDev = Boolean((import.meta as any)?.env?.DEV);

      // On iOS 14+, request App Tracking Transparency if available
      try {
        if (this.getPlatform() === "ios") {
          await AdMob.requestTrackingAuthorization();
        }
      } catch (attErr) {
        console.log("[AdMob] ATT prompt skipped or unavailable:", attErr);
      }

      await AdMob.initialize({
        initializeForTesting: isDev,
      });

      // Attach event listeners for debugging & analytics
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        this.isBannerVisible = true;
        console.log("[AdMob] Banner loaded successfully");
      });

      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
        this.isBannerVisible = false;
        console.warn("[AdMob] Banner failed to load:", error);
      });

      AdMob.addListener(BannerAdPluginEvents.Opened, () => {
        console.log("[AdMob] Banner opened");
      });

      AdMob.addListener(BannerAdPluginEvents.Closed, () => {
        console.log("[AdMob] Banner closed");
      });

      this.isInitialized = true;
      console.log("[AdMob] Initialized successfully on", this.getPlatform());
    } catch (err) {
      console.warn("[AdMob] Initialization failed:", err);
    }
  }

  public async showBanner(forceProduction = false): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const isDev = Boolean((import.meta as any)?.env?.DEV);
      const isProd = forceProduction || !isDev;
      const platform = this.getPlatform();

      let adId = ADMOB_CONFIG.TEST_IOS_BANNER_ID;
      if (platform === "ios") {
        adId = isProd ? ADMOB_CONFIG.IOS_BANNER_AD_UNIT_ID : ADMOB_CONFIG.TEST_IOS_BANNER_ID;
      } else if (platform === "android") {
        adId = isProd ? ADMOB_CONFIG.ANDROID_BANNER_AD_UNIT_ID : ADMOB_CONFIG.TEST_ANDROID_BANNER_ID;
      }

      await AdMob.showBanner({
        adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !isProd,
      });

      this.isBannerVisible = true;
    } catch (err) {
      console.warn("[AdMob] Could not show banner:", err);
    }
  }

  public async hideBanner(): Promise<void> {
    if (!this.isNative() || !this.isBannerVisible) {
      return;
    }

    try {
      await AdMob.hideBanner();
      this.isBannerVisible = false;
    } catch (err) {
      console.warn("[AdMob] Could not hide banner:", err);
    }
  }

  public async resumeBanner(): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    try {
      await AdMob.resumeBanner();
      this.isBannerVisible = true;
    } catch (err) {
      console.warn("[AdMob] Could not resume banner:", err);
    }
  }

  public async removeBanner(): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    try {
      await AdMob.removeBanner();
      this.isBannerVisible = false;
    } catch (err) {
      console.warn("[AdMob] Could not remove banner:", err);
    }
  }
}

export const adMobManager = new AdMobManager();
