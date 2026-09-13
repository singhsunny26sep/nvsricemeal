import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
  hasPermission,
  onMessage,
  getInitialNotification,
  AuthorizationStatus,
  type Messaging,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { apiService } from './apiService';

export const FCM_STORAGE_KEY = 'fcmToken';

let messagingInstance: Messaging | null = null;

const getMessagingInstance = (): Messaging | null => {
  if (messagingInstance) {
    return messagingInstance;
  }
  try {
    messagingInstance = getMessaging();
    return messagingInstance;
  } catch (error) {
    console.log('FCM: Firebase app not configured (missing GoogleService-Info.plist on iOS?)', error);
    return null;
  }
};

export type NotificationPermissionStatus =
  | 'authorized'
  | 'denied'
  | 'blocked'
  | 'unavailable';

const POST_NOTIFICATIONS_PERMISSION = 'android.permission.POST_NOTIFICATIONS';

const getAndroidNotificationPermissionStatus = async (): Promise<NotificationPermissionStatus> => {
  try {
    const status = await PermissionsAndroid.check(POST_NOTIFICATIONS_PERMISSION);
    if (status) {
      return 'authorized';
    }
    const granted = await PermissionsAndroid.request(POST_NOTIFICATIONS_PERMISSION);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return 'authorized';
    }
    if (granted === PermissionsAndroid.RESULTS.DENIED) {
      return 'denied';
    }
    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'blocked';
    }
    return 'unavailable';
  } catch (error) {
    console.log('FCM: Android notification permission error', error);
    return 'unavailable';
  }
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Note: retrieving the FCM token does not require POST_NOTIFICATIONS.
    // That permission only governs displaying notifications, so we attempt
    // to request it on Android 13+ but never block token retrieval on it.
    if (Platform.Version >= 33) {
      await getAndroidNotificationPermissionStatus();
    }
    return true;
  }

  const instance = getMessagingInstance();
  if (!instance) {
    return false;
  }

  const status = await hasPermission(instance);
  if (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const newStatus = await requestPermission(instance, {
    badge: true,
    sound: true,
    alert: true,
    carPlay: true,
    criticalAlert: true,
  });
  return newStatus === AuthorizationStatus.AUTHORIZED || newStatus === AuthorizationStatus.PROVISIONAL;
}

export async function getPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      return getAndroidNotificationPermissionStatus();
    }
    return 'authorized';
  }
  const instance = getMessagingInstance();
  if (!instance) {
    return 'unavailable';
  }
  const status = await hasPermission(instance);
  if (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  ) {
    return 'authorized';
  }
  if (status === AuthorizationStatus.DENIED) {
    return 'denied';
  }
  return 'unavailable';
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const cachedToken = await AsyncStorage.getItem(FCM_STORAGE_KEY);
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.log('FCM: Notification permission not granted');
      return cachedToken;
    }

    const instance = getMessagingInstance();
    if (!instance) {
      return cachedToken;
    }

    const token = await getToken(instance);
    if (token) {
      console.log('🔑 FCM TOKEN:', token);
      await AsyncStorage.setItem(FCM_STORAGE_KEY, token);
      await sendTokenToServer(token);
      return token;
    }

    if (cachedToken) {
      console.log('🔑 FCM TOKEN (cached):', cachedToken);
      return cachedToken;
    }

    console.log('FCM: No token available');
    return null;
  } catch (error) {
    console.log('Failed to get FCM token:', error);
    return await AsyncStorage.getItem(FCM_STORAGE_KEY);
  }
}

export async function sendTokenToServer(token: string): Promise<void> {
  try {
    const existingUserToken = await AsyncStorage.getItem('userToken');
    if (!existingUserToken) {
      return;
    }
    await apiService.updateFcmToken(token);
  } catch (error) {
    console.log('FCM: Failed to send token to server', error);
  }
}

export async function initializeFCM(): Promise<string | null> {
  try {
    const instance = getMessagingInstance();

    const token = await getFcmToken();
    if (token) {
      console.log('🚀 FCM INITIALIZED — token:', token);
    } else {
      console.log('⚠️ FCM: token not available on this device yet');
    }

    if (instance) {
      onTokenRefresh(instance, (refreshedToken: string) => {
        console.log('FCM: Token refreshed', refreshedToken);
        AsyncStorage.setItem(FCM_STORAGE_KEY, refreshedToken).catch(() => {});
        sendTokenToServer(refreshedToken).catch(() => {});
      });

      onMessage(instance, (remoteMessage: RemoteMessage) => {
        console.log('FCM: Foreground message received', remoteMessage);
      });

      const initialNotification = await getInitialNotification(instance);
      if (initialNotification) {
        console.log('FCM: App opened from a notification', initialNotification);
      }
    }

    return token;
  } catch (error) {
    console.log('FCM initialization error:', error);
    return await AsyncStorage.getItem(FCM_STORAGE_KEY);
  }
}

export async function deleteFcmToken(): Promise<void> {
  try {
    const { deleteToken } = await import('@react-native-firebase/messaging');
    const instance = getMessagingInstance();
    if (instance) {
      await deleteToken(instance);
    }
    await AsyncStorage.removeItem(FCM_STORAGE_KEY);
  } catch (error) {
    console.log('FCM: Failed to delete token', error);
  }
}
