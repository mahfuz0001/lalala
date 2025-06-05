import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import {
  MapPin,
  TriangleAlert as AlertTriangle,
  Info,
  BookOpen,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import EmergencyButton from '@/components/EmergencyButton';
import SafetyAlert, { AlertType } from '@/components/SafetyAlert';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch alerts:', error.message);
      Alert.alert('Error', 'Could not load alerts. Please try again.');
    } else {
      setAlerts(data);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts().finally(() => setRefreshing(false));
  }, []);

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Triggered',
      'Emergency services notified. Stay safe.'
    );
    // Here you might send a signal to Supabase or a webhook.
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const viewAlertDetails = (alert: AlertType) => {
    router.push(`/alerts/${alert.id}`);
  };

  const { user } = useUser();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>SafeStreets</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.primary[600]} />
              <Text style={styles.location}>Dhaka, Bangladesh</Text>
            </View>
            {/* <Text>Hello {user?.emailAddresses[0].emailAddress}</Text> */}
          </View>
          <View style={styles.safetyIndicator}>
            <AlertTriangle size={16} color={Colors.danger[500]} />
            <Text style={styles.safetyText}>High Alert</Text>
          </View>
        </View>

        <EmergencyButton onTrigger={handleEmergency} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Alerts</Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push('/alerts')}
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : {})}
            >
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <SafetyAlert
                key={alert.id}
                alert={alert}
                onDismiss={dismissAlert}
                onPress={viewAlertDetails}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Info size={24} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>No current alerts</Text>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/report')}
            >
              <View style={styles.actionIcon}>
                <AlertTriangle size={24} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Report Incident</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/(pages)/resources')}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: Colors.primary[600] },
                ]}
              >
                <BookOpen size={24} color={Colors.white} />
              </View>
              <Text style={styles.actionText}>Safety Resources</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[100] },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: Colors.primary[800],
    marginBottom: 4,
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  location: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginLeft: 4,
  },
  safetyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.danger[200],
  },
  safetyText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 12,
    color: Colors.danger[700],
    marginLeft: 4,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
  },
  seeAll: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: Colors.primary[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.neutral[500],
    marginTop: 8,
  },
  quickActions: { marginBottom: 16 },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.danger[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: Colors.neutral[800],
    textAlign: 'center',
  },
});
