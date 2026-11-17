import { api } from './api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async (userType: string, userId?: string, userEmail?: string) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by the browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration.scope);

    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BG3qS2NmwV9ZorBs2uwF98rpWn2eTlg7XoEuigT2QWVhSP5fAdfMYwd4zFFgDM17DkpsNGontjMOQfCwqwc9U-E';
    if (!publicVapidKey) {
      console.error('VITE_VAPID_PUBLIC_KEY is missing');
      return;
    }

    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }

    // Send subscription to backend
    await api.post('/notifications/subscribe', {
      subscription,
      user_type: userType,
      user_id: userId,
      user_email: userEmail
    });

    console.log('Push notification subscription successful.');
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
  }
};
