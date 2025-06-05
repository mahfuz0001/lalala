import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { updateUserLocation } from '@/lib/supabase';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Update location in Supabase
      await updateUserLocation(
        location.coords.latitude,
        location.coords.longitude
      );

      // Watch position changes
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000, // Update every 15 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        async (newLocation) => {
          setLocation(newLocation);
          await updateUserLocation(
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );
        }
      );
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { location, error };
}