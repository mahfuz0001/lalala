import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Shield, MapPin, Bell } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

type Step = {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => Promise<boolean>;
};

type OnboardingFlowProps = {
  onComplete: () => void;
};

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false,
    backgroundLocation: false,
  });

  const steps: Step[] = [
    {
      title: 'Enable Location',
      description:
        'We need your location to show you nearby safety alerts and help others in need.',
      icon: MapPin,
      action: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setPermissions((prev) => ({ ...prev, location: true }));
          await supabase.from('onboarding_status').upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            location_permission: true,
          });
          return true;
        }
        return false;
      },
    },
    {
      title: 'Enable Notifications',
      description: 'Stay informed about safety alerts in your area.',
      icon: Bell,
      action: async () => {
        if (Platform.OS === 'web') {
          setPermissions((prev) => ({ ...prev, notifications: true }));
          await supabase.from('onboarding_status').upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            notification_permission: true,
          });
          return true;
        }
        return true;
      },
    },
    {
      title: 'Background Location',
      description:
        'Allow the app to update your location even when closed to maintain safety coverage.',
      icon: Shield,
      action: async () => {
        if (Platform.OS === 'web') {
          setPermissions((prev) => ({ ...prev, backgroundLocation: true }));
          await supabase.from('onboarding_status').upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            background_location_permission: true,
            onboarding_completed: true,
          });
          return true;
        }
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
          setPermissions((prev) => ({ ...prev, backgroundLocation: true }));
          await supabase.from('onboarding_status').upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            background_location_permission: true,
            onboarding_completed: true,
          });
          return true;
        }
        return false;
      },
    },
  ];

  const handleNextStep = async () => {
    if (currentStep < steps.length) {
      const success = await steps[currentStep].action();
      if (success) {
        if (currentStep === steps.length - 1) {
          onComplete();
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <currentStepData.icon size={48} color={Colors.primary[600]} />
        </View>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: Colors.neutral[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    padding: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  button: {
    backgroundColor: Colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
