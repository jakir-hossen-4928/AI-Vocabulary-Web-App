// OneSignal is initialized in index.html via script tag
// This file provides helper functions to interact with the global OneSignal instance

declare global {
    interface Window {
        OneSignal: any;
        OneSignalDeferred: any[];
    }
}

/**
 * Helper to execute OneSignal commands safely
 */
const OneSignal = {
    async push(callback: (os: any) => Promise<void> | void) {
        if (window.OneSignal) {
            await callback(window.OneSignal);
        } else {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(callback);
        }
    }
};

/**
 * Initialize OneSignal (No-op as it's done in index.html)
 * Kept for compatibility with existing code
 */
export async function initOneSignal() {
    console.log("OneSignal initialized via index.html script");
    return Promise.resolve();
}

/**
 * Check if OneSignal is initialized
 */
export function isInitialized() {
    return !!(window.OneSignal && window.OneSignal.initialized);
}

/**
 * Show the native browser permission prompt
 */
export async function requestNotificationPermission() {
    return new Promise<void>((resolve, reject) => {
        OneSignal.push(async (os) => {
            try {
                // This method requests permission AND registers the user in one step
                // It is more robust than just requestPermission()
                await os.User.PushSubscription.optIn();
                resolve();
            } catch (error) {
                console.error("Failed to opt-in:", error);
                reject(error);
            }
        });
    });
}

/**
 * Check if user is subscribed to notifications
 */
export async function isUserSubscribed(): Promise<boolean> {
    return new Promise((resolve) => {
        OneSignal.push(async (os) => {
            try {
                // Check if the user is opted in to push notifications
                const optedIn = await os.User.PushSubscription.optedIn;
                // Also check if permission is granted (double check)
                const permission = await os.Notifications.permission;

                resolve(optedIn && permission === "granted");
            } catch (error) {
                console.error("Failed to check subscription status:", error);
                resolve(false);
            }
        });
    });
}

/**
 * Get the user's OneSignal player ID
 */
export async function getUserId(): Promise<string | null> {
    return new Promise((resolve) => {
        OneSignal.push(async (os) => {
            try {
                const id = await os.User.PushSubscription.id;
                resolve(id || null);
            } catch (error) {
                console.error("Failed to get user ID:", error);
                resolve(null);
            }
        });
    });
}

/**
 * Send a tag to OneSignal for user segmentation
 */
export async function sendTag(key: string, value: string) {
    OneSignal.push(async (os) => {
        try {
            await os.User.addTag(key, value);
        } catch (error) {
            console.error("Failed to send tag:", error);
        }
    });
}

/**
 * Send multiple tags at once
 */
export async function sendTags(tags: Record<string, string>) {
    OneSignal.push(async (os) => {
        try {
            await os.User.addTags(tags);
        } catch (error) {
            console.error("Failed to send tags:", error);
        }
    });
}
