export interface UTMParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

const UTM_STORAGE_KEY = 'ai_vocab_utm_params';
const UTM_EXPIRY_KEY = 'ai_vocab_utm_expiry';
const UTM_EXPIRY_DAYS = 30; // UTM parameters expire after 30 days

/**
 * Extract UTM parameters from URL search params
 */
export function extractUTMParams(searchParams: URLSearchParams): UTMParams {
    const utmParams: UTMParams = {};

    const utmKeys: (keyof UTMParams)[] = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content'
    ];

    utmKeys.forEach(key => {
        const value = searchParams.get(key);
        if (value) {
            utmParams[key] = value;
        }
    });

    return utmParams;
}

/**
 * Persist UTM parameters to localStorage with expiry
 */
export function persistUTMParams(params: UTMParams): void {
    if (Object.keys(params).length === 0) return;

    try {
        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));

        // Set expiry timestamp
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + UTM_EXPIRY_DAYS);
        localStorage.setItem(UTM_EXPIRY_KEY, expiryDate.toISOString());

        console.log('[UTM] Persisted UTM parameters:', params);
    } catch (error) {
        console.error('[UTM] Failed to persist UTM parameters:', error);
    }
}

/**
 * Retrieve stored UTM parameters from localStorage
 * Returns null if expired or not found
 */
export function getStoredUTMParams(): UTMParams | null {
    try {
        const stored = localStorage.getItem(UTM_STORAGE_KEY);
        const expiry = localStorage.getItem(UTM_EXPIRY_KEY);

        if (!stored) return null;

        // Check if expired
        if (expiry) {
            const expiryDate = new Date(expiry);
            if (new Date() > expiryDate) {
                clearUTMParams();
                console.log('[UTM] UTM parameters expired');
                return null;
            }
        }

        return JSON.parse(stored);
    } catch (error) {
        console.error('[UTM] Failed to retrieve UTM parameters:', error);
        return null;
    }
}

/**
 * Clear stored UTM parameters
 */
export function clearUTMParams(): void {
    try {
        localStorage.removeItem(UTM_STORAGE_KEY);
        localStorage.removeItem(UTM_EXPIRY_KEY);
        console.log('[UTM] Cleared UTM parameters');
    } catch (error) {
        console.error('[UTM] Failed to clear UTM parameters:', error);
    }
}

/**
 * Track an event with UTM context
 */
export function trackEvent(eventName: string, utmParams: UTMParams | null, additionalData?: Record<string, any>): void {
    const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        utm: utmParams,
        ...additionalData
    };

    console.log('[UTM Event]', eventData);

    // Here you can integrate with analytics services like Google Analytics, Mixpanel, etc.
    // Example: window.gtag?.('event', eventName, eventData);
}

/**
 * Append UTM parameters to a URL
 */
export function appendUTMToUrl(url: string, utmParams: UTMParams | null): string {
    if (!utmParams || Object.keys(utmParams).length === 0) {
        return url;
    }

    try {
        const urlObj = new URL(url, window.location.origin);

        Object.entries(utmParams).forEach(([key, value]) => {
            if (value) {
                urlObj.searchParams.set(key, value);
            }
        });

        return urlObj.toString();
    } catch (error) {
        console.error('[UTM] Failed to append UTM to URL:', error);
        return url;
    }
}

/**
 * Get UTM parameters as a query string
 */
export function getUTMQueryString(utmParams: UTMParams | null): string {
    if (!utmParams || Object.keys(utmParams).length === 0) {
        return '';
    }

    const params = new URLSearchParams();
    Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}
