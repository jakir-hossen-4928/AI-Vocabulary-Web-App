import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFcm = () => {
    const [token, setToken] = useState<string | null>(null);
    const { user } = useAuth();
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        Notification.permission
    );

    useEffect(() => {
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                setNotificationPermission(permission);

                if (permission === 'granted' && user) {
                    // Get FCM token
                    // Note: You might need a VAPID key here if not using the default one
                    // const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
                    const currentToken = await getToken(messaging, {
                        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                    });
                    if (currentToken) {
                        console.log('FCM Token:', currentToken);
                        setToken(currentToken);
                        // TODO: Send this token to your server to subscribe the user
                        // Save token to user profile
                        const userRef = doc(db, 'users', user.uid);
                        await setDoc(userRef, {
                            fcmToken: currentToken,
                            lastSeen: new Date().toISOString()
                        }, { merge: true });
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                }
            } catch (error) {
                console.error('Error retrieving token:', error);
            }
        };

        if (user) {
            requestPermission();
        }
    }, [user]);

    useEffect(() => {
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('Message received:', payload);
                toast(payload.notification?.title || 'New Message', {
                    description: payload.notification?.body,
                });
            });

            return () => unsubscribe();
        }
    }, []);

    return { token, notificationPermission };
};
