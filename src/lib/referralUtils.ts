import { supabase } from "@/integrations/supabase/client";

/**
 * Slugify email name for public referral links
 */
const slugifyEmailName = (email: string): string => {
  const namePart = email.split('@')[0];
  return namePart.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

/**
 * Check if user is a verified host (required for referral eligibility)
 */
export const checkReferralEligibility = async (): Promise<{
  isEligible: boolean;
  reason: string | null;
}> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isEligible: false, reason: 'You must be logged in to use referrals.' };
  }

  // Check host verification status
  const { data: verification, error } = await supabase
    .from('host_verifications')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error checking host verification:', error);
    return { isEligible: false, reason: 'Failed to verify host status.' };
  }

  if (!verification) {
    return { isEligible: false, reason: 'You must be a verified host to use the referral program.' };
  }

  if (verification.status !== 'approved') {
    return { 
      isEligible: false, 
      reason: verification.status === 'pending' 
        ? 'Your host verification is pending. Referrals will be enabled once approved.'
        : 'Your host verification was rejected. Please resubmit to use referrals.'
    };
  }

  return { isEligible: true, reason: null };
};

/**
 * Generate referral link based on user status
 * - Guests: Clean base URL only
 * - Verified hosts: Base URL + ?ref={slugified-email-name}
 * - Non-verified users: Clean base URL only (referrals disabled)
 */
/**
 * Shorten a UUID to first 8 chars for display purposes
 */
export const shortenId = (id: string): string => {
  if (id && id.length > 8 && id.includes('-')) {
    return id.substring(0, 8);
  }
  return id;
};

export const generateReferralLink = async (
  itemId: string,
  itemType: string,
  itemSlug?: string
): Promise<string> => {
  const baseUrl = window.location.origin;
  let path = "";
  
  switch (itemType) {
    case "trip":
      path = `/trip/${itemSlug || itemId}`;
      break;
    case "event":
      path = `/event/${itemSlug || itemId}`;
      break;
    case "hotel":
      path = `/hotel/${itemSlug || itemId}`;
      break;
    case "adventure":
    case "adventure_place":
      path = `/adventure/${itemSlug || itemId}`;
      break;
    case "attraction":
      path = `/attraction/${itemSlug || itemId}`;
      break;
    default:
      path = `/`;
  }
  
  const cleanUrl = `${baseUrl}${path}`;
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    // Guest user - return clean URL without referral parameter
    return cleanUrl;
  }

  // Check referral eligibility (must be verified host)
  const { isEligible } = await checkReferralEligibility();
  
  if (!isEligible) {
    // Not a verified host - return clean URL without referral parameter
    return cleanUrl;
  }
  
  // Verified host - append slugified email name as ref parameter
  const refSlug = slugifyEmailName(user.email);
  return `${cleanUrl}?ref=${refSlug}`;
};

/**
 * Track referral click using slugified email name from URL
 * Looks up user by email slug, retrieves internal_referral_id_digits for tracking
 */
export const trackReferralClick = async (
  refSlug: string,
  itemId?: string,
  itemType?: string,
  referralType: "booking" | "host" = "booking"
) => {
  try {
    console.log('[ReferralUtils] trackReferralClick called with:', { refSlug, itemId, itemType, referralType });
    
    // Check if item_id is provided first
    if (!itemId) {
      console.log('[ReferralUtils] Skipping - no item_id provided');
      return null;
    }

    if (!refSlug) {
      console.log('[ReferralUtils] Skipping - no refSlug provided');
      return null;
    }

    // Check if we already have a tracking record for this in session
    const existingTrackingId = sessionStorage.getItem("referral_tracking_id");
    if (existingTrackingId) {
      console.log('[ReferralUtils] Already have tracking ID in session:', existingTrackingId);
      return { id: existingTrackingId };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use edge function to track referral (bypasses RLS for profile lookup)
    const { data, error } = await supabase.functions.invoke('track-referral-click', {
      body: {
        refSlug,
        itemId,
        itemType: itemType || 'unknown',
        referralType,
        userId: user?.id || null,
      },
    });

    if (error) {
      console.error('[ReferralUtils] Error calling track-referral-click:', error);
      return null;
    }

    if (!data?.success) {
      console.log('[ReferralUtils] Tracking failed:', data?.error);
      return null;
    }
    
    // Store tracking ID and internal digit ID in session storage
    if (data.data?.trackingId) {
      sessionStorage.setItem("referral_tracking_id", data.data.trackingId);
      if (data.data.internalReferralId) {
        sessionStorage.setItem("referral_internal_id", data.data.internalReferralId);
      }
      console.log('[ReferralUtils] Successfully stored tracking ID in session:', data.data.trackingId);
    }
    
    return { id: data.data?.trackingId };
  } catch (error) {
    console.error("[ReferralUtils] Error tracking referral:", error);
    return null;
  }
};

export const getReferralTrackingId = (): string | null => {
  const trackingId = sessionStorage.getItem("referral_tracking_id");
  console.log('[ReferralUtils] getReferralTrackingId:', trackingId);
  return trackingId;
};

export const clearReferralTracking = () => {
  sessionStorage.removeItem("referral_tracking_id");
};

// Commission calculation is handled server-side by the `award_referral_commission` DB trigger.
// No client-side commission logic needed — the trigger fires on booking payment_status='completed'.
