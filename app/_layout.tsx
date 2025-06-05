import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFontResources } from '@/hooks/useFontResources';

export default function RootLayout() {
  useFrameworkReady(); // Always called
  const { isReady, fontError } = useFontResources(); // Always called

  // Always called
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  // Now we can return conditionally AFTER all hooks
  if (!isReady && !fontError) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>
        <ExpoStatusBar style="auto" />
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
