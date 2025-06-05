import { StyleSheet, Pressable, View, Text, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Shield, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { sendDistressSignal } from '@/lib/supabase';
import { useLocation } from '@/hooks/useLocation';

type DistressButtonProps = {
  onSignalSent: () => void;
};

export default function DistressButton({ onSignalSent }: DistressButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const { location } = useLocation();

  useEffect(() => {
    if (isPressed) {
      // Start progress interval
      progressInterval.current = setInterval(() => {
        setLongPressProgress((prev) => {
          const newValue = prev + 0.033; // 3% increase every 100ms
          if (newValue >= 1) {
            clearInterval(progressInterval.current!);
            triggerDistressSignal();
            return 1;
          }
          return newValue;
        });
      }, 100);

      // Animate scale down
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000, // 3 second hold to activate
        useNativeDriver: false,
      }).start();
    } else {
      // Clear interval if button is released
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }

      // Reset progress
      setLongPressProgress(0);
      progressAnim.setValue(0);

      // Animate scale back up
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPressed, scaleAnim, progressAnim]);

  const triggerDistressSignal = async () => {
    if (!location) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await sendDistressSignal(
        location.coords.latitude,
        location.coords.longitude
      );
      onSignalSent();
    } catch (error) {
      console.error('Failed to send distress signal:', error);
    }

    setIsPressed(false);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hold for Emergency Signal</Text>
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          style={[styles.button, isPressed && styles.buttonPressed]}
          onPressIn={() => {
            setIsPressed(true);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          }}
          onPressOut={() => {
            setIsPressed(false);
          }}
        >
          <View style={styles.iconContainer}>
            {isPressed ? (
              <AlertTriangle size={32} color={Colors.white} />
            ) : (
              <Shield size={32} color={Colors.white} />
            )}
          </View>
        </Pressable>
        {isPressed && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        )}
      </Animated.View>
      <Text style={styles.hintText}>
        {longPressProgress > 0 
          ? `Sending SOS ${Math.floor(longPressProgress * 100)}%` 
          : 'Emergency services will be notified'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  label: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.danger[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    backgroundColor: Colors.danger[700],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.danger[600],
  },
  hintText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 8,
    textAlign: 'center',
  },
});