import React, { useState } from 'react';
import { useSignIn, useUser } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { user } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });

        // ✅ Sync user to Supabase
        if (user) {
          const email = user.primaryEmailAddress?.emailAddress ?? null;

          const { error } = await supabase
            .from('users')
            .upsert({ id: user.id, email }, { onConflict: 'id' });

          if (error) {
            console.error('Supabase sync error:', error.message);
          } else {
            console.log('✅ Clerk user synced to Supabase');
          }
        }

        router.replace('/(tabs)');
      } else {
        console.warn('Sign-in incomplete:', signInAttempt);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login failed', err.errors?.[0]?.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        placeholder="Email"
        keyboardType="email-address"
        value={emailAddress}
        onChangeText={setEmailAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>
          {loading ? 'Signing in...' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <Link href="/sign-up">
          <Text style={styles.footerLink}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    color: Colors.primary[600],
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: Colors.neutral[600],
  },
  input: {
    height: 50,
    borderColor: Colors.neutral[300],
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: Colors.neutral[100],
  },
  button: {
    backgroundColor: Colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.neutral[500],
  },
  footerLink: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
});
