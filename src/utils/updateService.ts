import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { APP_VERSION, APP_UPDATE_ENDPOINT, buildUrl, UPDATE_REMIND_LATER_KEY, PLAY_STORE_URL } from '../constants/config';

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  isForced: boolean;
  message?: string;
  playStoreUrl: string;
}

const REMIND_LATER_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  return 0;
}

export class UpdateService {
  private async fetchLatestVersion(): Promise<{ version: string; message?: string; forceUpdate?: boolean } | null> {
    try {
      const endpoint = APP_UPDATE_ENDPOINT;
      const url = buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.log('UpdateService: Server responded with status', response.status);
        return null;
      }

      const text = await response.text();
      const data = JSON.parse(text);

      const appSettings = data?.data || data;
      if (appSettings && appSettings.appVersion) {
        return {
          version: appSettings.appVersion,
          message: appSettings.updateMessage,
          forceUpdate: appSettings.forceUpdate === true,
        };
      }

      if (appSettings && appSettings.latestVersion) {
        return {
          version: appSettings.latestVersion,
          message: appSettings.updateMessage,
          forceUpdate: appSettings.forceUpdate === true,
        };
      }

      console.log('UpdateService: No version field found in response', data);
      return null;
    } catch (error) {
      console.log('UpdateService: Failed to fetch latest version', error);
      return null;
    }
  }

  async checkForUpdate(): Promise<UpdateInfo> {
    const latest = await this.fetchLatestVersion();

    const baseInfo = {
      currentVersion: APP_VERSION,
      playStoreUrl: PLAY_STORE_URL,
      latestVersion: latest?.version || APP_VERSION,
      isForced: latest?.forceUpdate || false,
      message: latest?.message,
      hasUpdate: false,
    };

    if (!latest) {
      return baseInfo;
    }

    const comparison = compareVersions(latest.version, APP_VERSION);
    const hasUpdate = comparison > 0;

    if (hasUpdate) {
      const shouldRemindLater = await this.shouldRemindLater();
      if (shouldRemindLater && !latest.forceUpdate) {
        return { ...baseInfo, hasUpdate: false };
      }
    }

    return {
      ...baseInfo,
      hasUpdate,
      latestVersion: latest.version,
      isForced: latest.forceUpdate || false,
      message: latest.message,
    };
  }

  async shouldRemindLater(): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem(UPDATE_REMIND_LATER_KEY);
      if (!timestamp) return false;
      const elapsed = Date.now() - parseInt(timestamp, 10);
      return elapsed < REMIND_LATER_DURATION;
    } catch {
      return false;
    }
  }

  async setRemindLater(): Promise<void> {
    try {
      await AsyncStorage.setItem(UPDATE_REMIND_LATER_KEY, Date.now().toString());
    } catch (error) {
      console.log('UpdateService: Failed to set remind later', error);
    }
  }

  async clearRemindLater(): Promise<void> {
    try {
      await AsyncStorage.removeItem(UPDATE_REMIND_LATER_KEY);
    } catch (error) {
      console.log('UpdateService: Failed to clear remind later', error);
    }
  }

  openPlayStore(): void {
    Linking.openURL(PLAY_STORE_URL).catch((error) => {
      console.log('UpdateService: Failed to open Play Store link', error);
    });
  }
}

export const updateService = new UpdateService();
export default updateService;
