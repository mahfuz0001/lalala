import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '@/hooks/useLocation';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { MapPin, TriangleAlert as AlertTriangle, Users } from 'lucide-react-native';

type User = {
  user_id: string;
  location_lat: number;
  location_lng: number;
  last_updated: string;
};

type DistressSignal = {
  id: string;
  location_lat: number;
  location_lng: number;
  status: string;
  created_at: string;
};

export default function LiveMap() {
  const { location } = useLocation();
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [activeSignals, setActiveSignals] = useState<DistressSignal[]>([]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!location) return;

    // Subscribe to nearby users
    const usersChannel = supabase
      .channel('nearby-users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations',
        },
        (payload) => {
          setNearbyUsers((current) => {
            const filtered = current.filter(u => u.user_id !== payload.new.user_id);
            return [...filtered, payload.new as User];
          });
        }
      )
      .subscribe();

    // Subscribe to distress signals
    const signalsChannel = supabase
      .channel('distress-signals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'distress_signals',
        },
        (payload) => {
          setActiveSignals((current) => {
            const filtered = current.filter(s => s.id !== payload.new.id);
            return [...filtered, payload.new as DistressSignal];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(signalsChannel);
    };
  }, [location]);

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {/* Nearby Users */}
      {nearbyUsers.map((user) => (
        <Marker
          key={user.user_id}
          coordinate={{
            latitude: user.location_lat,
            longitude: user.location_lng,
          }}
        >
          <View style={styles.userMarker}>
            <Users size={16} color={Colors.primary[600]} />
          </View>
        </Marker>
      ))}

      {/* Active Distress Signals */}
      {activeSignals.map((signal) => (
        <React.Fragment key={signal.id}>
          <Marker
            coordinate={{
              latitude: signal.location_lat,
              longitude: signal.location_lng,
            }}
          >
            <View style={styles.distressMarker}>
              <AlertTriangle size={16} color={Colors.white} />
            </View>
          </Marker>
          <Circle
            center={{
              latitude: signal.location_lat,
              longitude: signal.location_lng,
            }}
            radius={100}
            fillColor={`${Colors.danger[500]}20`}
            strokeColor={Colors.danger[500]}
            strokeWidth={1}
          />
        </React.Fragment>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  userMarker: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  distressMarker: {
    backgroundColor: Colors.danger[600],
    padding: 8,
    borderRadius: 8,
  },
});