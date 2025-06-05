import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { MapPin, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import SafetyAlert, { AlertType } from '@/components/SafetyAlert';
import { supabase } from '@/lib/supabase';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    const { data, error } = await supabase.from('alerts').select('*');
    // .eq('is_active', true)
    // .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', 'Failed to load alerts');
      console.error('Error fetching alerts:', error.message);
      return;
    }

    const formatted = data.map((alert) => ({
      id: alert.id,
      message: alert.message,
      severity: alert.severity,
      location: alert.location_address || 'Unknown location',
      latitude: alert.location_lat,
      longitude: alert.location_lng,
      radius: alert.radius || 0,
      expires_at: alert.expires_at || null,
      created_at: timeAgo(alert.created_at),
      is_active: true,
    }));

    setAlerts(formatted);
  };

  // console.log('Alertss:', alerts);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts().finally(() => setRefreshing(false));
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const viewAlertDetails = (alert: AlertType) => {
    router.push(`/alerts/${alert.id}`);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Safety Alerts</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.primary[600]} />
            <Text style={styles.location}>Dhaka, Bangladesh</Text>
          </View>
        </View>
        <View style={styles.filterButton}>
          <Filter size={20} color={Colors.primary[600]} />
        </View>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SafetyAlert
            alert={item}
            onDismiss={dismissAlert}
            onPress={viewAlertDetails}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: Colors.primary[800],
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginLeft: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
});

// Relative time display
function timeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(dateString).toLocaleDateString();
}
