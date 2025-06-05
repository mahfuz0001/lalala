import { router, Tabs } from 'expo-router';
import {
  View,
  Platform,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Bell, MapPin, Shield, User, Home } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useUser } from '@clerk/clerk-expo';

export default function SlickBottomTabs() {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  const TabIcon = ({
    Icon,
    color,
    focused,
  }: {
    Icon: typeof Home;
    color: string;
    focused: boolean;
  }) => {
    const animatedScale = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

    useEffect(() => {
      Animated.spring(animatedScale, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }, [focused]);

    return (
      <Animated.View
        style={[styles.iconWrapper, { transform: [{ scale: animatedScale }] }]}
      >
        {focused && (
          <>
            <View style={styles.glowEffect} />
            <View style={styles.activeIndicator} />
          </>
        )}
        <View style={styles.iconInner}>
          <Icon size={22} color={color} style={{ marginBottom: 1 }} />
        </View>
      </Animated.View>
    );
  };

  const FloatingMapButton = ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: (event: any) => void;
  }) => {
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.floatingButtonWrapper}
      >
        <Animated.View
          style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.floatingButtonGradient}>{children}</View>
          <View style={styles.floatingButtonShadow} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FF6B6B',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            position: 'absolute',
            bottom: insets.bottom + 16,
            marginHorizontal: 16,
            left: 20,
            paddingTop: 15,
            right: 20,
            height: 72,
            borderRadius: 50,
            backgroundColor:
              Platform.OS === 'ios'
                ? 'rgba(28, 28, 30, 0.8)'
                : 'rgba(18, 18, 18, 0.9)',
            borderTopWidth: 0,
            paddingBottom: 10,
            paddingHorizontal: 8,
            shadowColor: '#000',
            // shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Bell} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarButton: (props) => <FloatingMapButton {...props} />,
            tabBarIcon: ({ color }) => (
              <MapPin size={28} color="#FFFFFF" strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Report',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={Shield} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  iconInner: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingTop: 1, // 👈 this nudges the icon up slightly
  },

  activeIndicator: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    zIndex: 1,
  },

  glowEffect: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    zIndex: 0,
  },

  floatingButtonWrapper: {
    top: -28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatingButtonGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  floatingButtonShadow: {
    position: 'absolute',
    bottom: -8,
    width: 64,
    height: 16,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    zIndex: -1,
  },
});
