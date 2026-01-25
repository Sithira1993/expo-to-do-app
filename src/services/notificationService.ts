/**
 * NotificationService - Firebase Cloud Messaging (FCM)
 *
 * Handles push notification registration and handling.
 * Uses expo-notifications for local notification handling
 * and expo-device for device detection.
 */

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * NotificationService object containing all notification-related operations
 */
export const NotificationService = {
  /**
   * Register for push notifications
   * @returns The Expo push token if successful, null otherwise
   */
  async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    // Check and request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    // Get the Expo push token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (projectId) {
        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        token = pushToken.data;
      } else {
        // Fallback for development without EAS
        const pushToken = await Notifications.getExpoPushTokenAsync();
        token = pushToken.data;
      }
      
      console.log("Push token:", token);
    } catch (error) {
      console.error("Error getting push token:", error);
    }

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3B82F6",
      });
    }

    return token;
  },

  /**
   * Schedule a local notification
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   * @param seconds - Delay in seconds (default: 1)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>,
    seconds: number = 1
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });

    return identifier;
  },

  /**
   * Send an immediate local notification
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Immediate delivery
    });

    return identifier;
  },

  /**
   * Cancel a scheduled notification
   * @param identifier - The notification identifier
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get the current badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Set the badge count
   * @param count - The badge count to set
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Add a listener for received notifications (foreground)
   * @param callback - Function to call when notification is received
   * @returns Subscription object (call .remove() to unsubscribe)
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Add a listener for notification responses (user interaction)
   * @param callback - Function to call when user interacts with notification
   * @returns Subscription object (call .remove() to unsubscribe)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
