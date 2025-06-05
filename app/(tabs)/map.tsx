import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import {
  Shield,
  TriangleAlert as AlertTriangle,
  Users,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

type Incident = {
  id: string;
  type: string;
  severity: string;
  location_lat: number;
  location_lng: number;
  created_at: string;
};

type ActiveUser = {
  id: string;
  location_lat: number;
  location_lng: number;
  last_active: string;
};

const DHAKA_REGION = {
  latitude: 23.8103,
  longitude: 90.4125,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Initial fetch of incidents and active users
      fetchNearbyIncidents(location.coords.latitude, location.coords.longitude);
      fetchActiveUsers(location.coords.latitude, location.coords.longitude);

      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    // Set up real-time subscription for new incidents
    const channel = supabase
      .channel('incidents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          setIncidents((current) => [...current, payload.new as Incident]);
        }
      )
      .subscribe();

    // Update active users every 30 seconds
    const interval = setInterval(() => {
      if (location) {
        fetchActiveUsers(location.coords.latitude, location.coords.longitude);
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [location]);

  const fetchNearbyIncidents = async (lat: number, lng: number) => {
    const { data, error } = await supabase.rpc('nearby_incidents', {
      lat,
      lng,
      radius_meters: 5000, // Increased radius to see more incidents
    });

    if (data) {
      setIncidents(data);
    }
  };

  const fetchActiveUsers = async (lat: number, lng: number) => {
    const { data, error } = await supabase.rpc('nearby_active_users', {
      lat,
      lng,
      radius_meters: 5000,
    });

    if (data) {
      setActiveUsers(data);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return Colors.danger[500];
      case 'medium':
        return Colors.warning[500];
      case 'low':
        return Colors.success[500];
      default:
        return Colors.neutral[500];
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : DHAKA_REGION
        }
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        {incidents.map((incident) => (
          <React.Fragment key={incident.id}>
            <Marker
              coordinate={{
                latitude: incident.location_lat,
                longitude: incident.location_lng,
              }}
              // onPress={() => router.push(`/incidents/${incident.id}`)}
            >
              <View
                style={[
                  styles.marker,
                  { backgroundColor: getSeverityColor(incident.severity) },
                ]}
              >
                <AlertTriangle size={16} color={Colors.white} />
              </View>
            </Marker>
            <Circle
              center={{
                latitude: incident.location_lat,
                longitude: incident.location_lng,
              }}
              radius={100}
              fillColor={`${getSeverityColor(incident.severity)}20`}
              strokeColor={getSeverityColor(incident.severity)}
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        {activeUsers.map((user) => (
          <Marker
            key={user.id}
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
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{incidents.length}</Text>
            <Text style={styles.statLabel}>Incidents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeUsers.length}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.reportButton}
        onPress={() => router.push('/report')}
      >
        <Shield size={24} color={Colors.white} />
        <Text style={styles.reportButtonText}>Report Incident</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: Colors.primary[600],
  },
  statLabel: {
    fontFamily: 'Roboto-Medium',
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 4,
  },
  marker: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: Colors.primary[600],
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  reportButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
});
