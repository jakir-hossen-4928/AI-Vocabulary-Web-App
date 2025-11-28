import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { requestNotificationPermission, isUserSubscribed, isInitialized } from "@/lib/onesignal";
import { toast } from "sonner";

export const NotificationSettings = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkSubscriptionStatus();

        // Listen for subscription changes
        const handleChange = (change: any) => {
            console.log("Subscription changed:", change);
            checkSubscriptionStatus();
        };

        // We need to access the global OneSignal object to add the listener
        if (window.OneSignalDeferred) {
            window.OneSignalDeferred.push((os: any) => {
                os.User.PushSubscription.addEventListener("change", handleChange);
            });
        }

        return () => {
            // Cleanup listener if possible (OneSignal API for removing listeners varies, usually not strictly necessary for top-level components)
        };
    }, []);

    const checkSubscriptionStatus = async () => {
        // Wait a moment for init to complete if it's running
        if (!isInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const subscribed = await isUserSubscribed();
        console.log("Is subscribed:", subscribed);
        setIsSubscribed(subscribed);
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            // Show instruction immediately
            toast.info("Please allow notifications in the browser prompt that appears.");

            await requestNotificationPermission();

            // Wait a bit for the permission to be processed
            setTimeout(async () => {
                const subscribed = await isUserSubscribed();
                setIsSubscribed(subscribed);

                if (subscribed) {
                    toast.success("Notifications enabled! You'll receive daily vocabulary updates.");
                } else {
                    // Check if permission was denied
                    if (Notification.permission === 'denied') {
                        toast.error("Notifications are blocked. Please enable them in your browser settings.");
                    }
                }
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Failed to enable notifications:", error);
            toast.error("Failed to enable notifications. Please try again.");
            setIsLoading(false);
        }
    };

    if (isSubscribed) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    {isSubscribed ? (
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                    ) : (
                        <div className="p-2 bg-muted rounded-lg">
                            <BellOff className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    <div>
                        <CardTitle>Push Notifications</CardTitle>
                        <CardDescription>
                            {isSubscribed
                                ? "You're subscribed to daily vocabulary updates"
                                : "Get daily word notifications and learning reminders"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">What you'll receive:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 📚 Word of the Day with meaning and examples</li>
                        <li>• 🎯 Daily vocabulary learning reminders</li>
                        <li>• 💡 Example sentences and usage tips</li>
                        <li>• 🔔 Personalized learning notifications</li>
                    </ul>
                </div>

                {!isSubscribed && (
                    <Button
                        onClick={handleEnableNotifications}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        {isLoading ? "Enabling..." : "Enable Notifications"}
                    </Button>
                )}

                {isSubscribed && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Notifications are enabled
                        </p>
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    You can manage notification preferences in your browser settings at any time.
                </p>
            </CardContent>
        </Card>
    );
};
