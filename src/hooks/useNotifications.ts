/**
 * useNotifications Hook - Push notification management
 *
 * Handles push notification setup, registration, and event listeners.
 */

import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/notificationService";

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registerForNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Register for push notifications on mount
    registerForNotifications();

    // Set up notification listeners
    notificationListener.current =
      NotificationService.addNotificationReceivedListener((notification) => {
        setNotification(notification);
        console.log("Notification received:", notification);
      });

    responseListener.current =
      NotificationService.addNotificationResponseListener((response) => {
        console.log("Notification response:", response);
        // Handle notification tap - navigate to relevant screen
        const data = response.notification.request.content.data;
        if (data?.todoId) {
          // You can use router.push here to navigate to the todo
          console.log("Navigate to todo:", data.todoId);
        }
      });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForNotifications = async () => {
    const token = await NotificationService.registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      // Here you could save the token to your backend/Firestore
      // for sending targeted push notifications
    }
  };

  const sendTestNotification = async () => {
    await NotificationService.sendImmediateNotification(
      "Todo Reminder",
      "Don't forget to check your pending tasks!",
      { type: "reminder" }
    );
  };

  return {
    expoPushToken,
    notification,
    registerForNotifications,
    sendTestNotification,
  };
}
