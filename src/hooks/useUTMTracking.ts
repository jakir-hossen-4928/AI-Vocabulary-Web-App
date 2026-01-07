import { useUTM } from '@/contexts/UTMContext';

/**
 * Hook to track events with UTM context
 * This is a convenience wrapper around useUTM().trackEvent
 */
export function useTrackEvent() {
    const { trackEvent } = useUTM();
    return trackEvent;
}

/**
 * Hook to get UTM-enhanced links
 * This is a convenience wrapper around useUTM().getUTMLink
 */
export function useUTMLink() {
    const { getUTMLink } = useUTM();
    return getUTMLink;
}

/**
 * Hook to get current UTM parameters
 */
export function useUTMParams() {
    const { utmParams } = useUTM();
    return utmParams;
}
