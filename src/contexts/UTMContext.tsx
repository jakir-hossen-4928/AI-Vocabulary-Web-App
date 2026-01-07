import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    UTMParams,
    extractUTMParams,
    persistUTMParams,
    getStoredUTMParams,
    trackEvent as trackUTMEvent,
    appendUTMToUrl,
    getUTMQueryString
} from '@/utils/utmTracking';

interface UTMContextType {
    utmParams: UTMParams | null;
    trackEvent: (eventName: string, additionalData?: Record<string, any>) => void;
    getUTMLink: (url: string) => string;
    getUTMQuery: () => string;
}

const UTMContext = createContext<UTMContextType | undefined>(undefined);

export function UTMProvider({ children }: { children: React.ReactNode }) {
    const [utmParams, setUtmParams] = useState<UTMParams | null>(null);
    const location = useLocation();

    // Initialize UTM parameters on mount and when location changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlUTMParams = extractUTMParams(searchParams);

        // If URL has UTM parameters, use them and persist
        if (Object.keys(urlUTMParams).length > 0) {
            setUtmParams(urlUTMParams);
            persistUTMParams(urlUTMParams);
            console.log('[UTM] Captured UTM parameters from URL:', urlUTMParams);
        } else {
            // Otherwise, try to load from storage
            const storedParams = getStoredUTMParams();
            if (storedParams) {
                setUtmParams(storedParams);
                console.log('[UTM] Loaded UTM parameters from storage:', storedParams);
            }
        }
    }, [location.search]);

    // Track page views automatically
    useEffect(() => {
        trackUTMEvent('page_view', utmParams, {
            path: location.pathname,
            search: location.search
        });
    }, [location.pathname, location.search, utmParams]);

    // Track event with current UTM context
    const trackEvent = useCallback((eventName: string, additionalData?: Record<string, any>) => {
        trackUTMEvent(eventName, utmParams, additionalData);
    }, [utmParams]);

    // Get URL with UTM parameters appended
    const getUTMLink = useCallback((url: string) => {
        return appendUTMToUrl(url, utmParams);
    }, [utmParams]);

    // Get UTM query string
    const getUTMQuery = useCallback(() => {
        return getUTMQueryString(utmParams);
    }, [utmParams]);

    const value: UTMContextType = {
        utmParams,
        trackEvent,
        getUTMLink,
        getUTMQuery
    };

    return (
        <UTMContext.Provider value={value}>
            {children}
        </UTMContext.Provider>
    );
}

export function useUTM() {
    const context = useContext(UTMContext);
    if (context === undefined) {
        throw new Error('useUTM must be used within a UTMProvider');
    }
    return context;
}
