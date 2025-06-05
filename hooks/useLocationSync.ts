// hooks/useLocationSync.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from './useLocation';

export function useLocationSync(userId: string | null) {
  const { location } = useLocation();

  useEffect(() => {
    if (!userId || !location) return;

    const upsertLocation = async () => {
      await supabase.from('user_locations').upsert({
        user_id: userId,
        location_lat: location.coords.latitude,
        location_lng: location.coords.longitude,
        last_updated: new Date().toISOString(),
      });
    };

    console.log(
      `Upserting location for user ${userId}: ${location.coords.latitude}, ${location.coords.longitude}`
    );

    // Upsert immediately and then every 15 seconds
    upsertLocation();
    const interval = setInterval(upsertLocation, 15000);

    return () => clearInterval(interval);
  }, [location, userId]);
}
