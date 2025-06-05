import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Location update function
export async function updateUserLocation(latitude: number, longitude: number) {
  return await supabase.rpc('upsert_user_location', {
    p_lat: latitude,
    p_lng: longitude,
  });
}

// Send distress signal
export async function sendDistressSignal(
  latitude: number, 
  longitude: number, 
  description?: string,
  isAnonymous?: boolean
) {
  return await supabase.rpc('send_distress_signal', {
    p_lat: latitude,
    p_lng: longitude,
    p_description: description,
    p_is_anonymous: isAnonymous
  });
}

// Respond to distress signal
export async function respondToSignal(signalId: string) {
  return await supabase.rpc('respond_to_signal', {
    p_signal_id: signalId
  });
}

// Mark arrival at distress location
export async function markArrival(responseId: string, distanceTraveled: number) {
  return await supabase.rpc('mark_arrival_at_signal', {
    p_response_id: responseId,
    p_distance_traveled: distanceTraveled
  });
}

// Get nearby users
export async function getNearbyUsers(latitude: number, longitude: number) {
  return await supabase.rpc('nearby_users', {
    lat: latitude,
    lng: longitude,
  });
}

// Get user stats
export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
}

// Get emergency contacts
export async function getEmergencyContacts(userId: string) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });
  
  return { data, error };
}

// Add emergency contact
export async function addEmergencyContact(
  name: string,
  phoneNumber: string,
  relationship?: string,
  isPrimary?: boolean
) {
  return await supabase
    .from('emergency_contacts')
    .insert({
      name,
      phone_number: phoneNumber,
      relationship,
      is_primary: isPrimary
    });
}