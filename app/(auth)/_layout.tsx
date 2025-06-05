import { Redirect, Stack } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  // Sync Clerk user to Supabase
  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (!isSignedIn || !user) return;

      const { id, primaryEmailAddress } = user;
      const email = primaryEmailAddress?.emailAddress ?? null;

      const { error } = await supabase
        .from('users')
        .upsert({ id, email }, { onConflict: 'id' });

      if (error) {
        console.error('❌ Failed to sync user to Supabase:', error.message);
      } else {
        console.log('✅ Synced Clerk user to Supabase');
      }
    };

    syncUserToSupabase();
  }, [isSignedIn, user]);

  // Redirect if signed in
  if (isSignedIn) {
    return <Redirect href={'/(tabs)'} />;
  }

  return <Stack />;
}
