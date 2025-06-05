import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import {
  ArrowLeft,
  TriangleAlert as AlertTriangle,
  MapPin,
  Clock,
  Share2,
} from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { AlertType } from '@/components/SafetyAlert';
import { useMemo } from 'react';

// Mock data
const MOCK_ALERTS: AlertType[] = [
  {
    id: '1',
    message: 'Reports of extortion attempts near Gulshan Avenue',
    severity: 'danger',
    location: 'Gulshan, Dhaka',
    timestamp: '10 mins ago',
  },
  {
    id: '2',
    message: 'Be cautious of suspicious individuals near Mirpur Road bus stops',
    severity: 'warning',
    location: 'Mirpur, Dhaka',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    message: 'Police increased patrols in Uttara Sector 13',
    severity: 'info',
    location: 'Uttara, Dhaka',
    timestamp: '2 hours ago',
  },
];

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();

  const alert = useMemo(() => {
    return MOCK_ALERTS.find((a) => a.id === id) || null;
  }, [id]);

  if (!alert) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Alert Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Alert not found</Text>
          <Pressable
            style={styles.backToAlertsButton}
            onPress={() => router.push('/alerts')}
          >
            <Text style={styles.backToAlertsText}>Back to Alerts</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return Colors.danger[500];
      case 'warning':
        return Colors.warning[500];
      case 'info':
      default:
        return Colors.primary[500];
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'Critical Alert';
      case 'warning':
        return 'Warning';
      case 'info':
      default:
        return 'Information';
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { backgroundColor: getSeverityColor(alert.severity) },
        ]}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {getSeverityText(alert.severity)}
        </Text>
        <Pressable style={styles.shareButton}>
          <Share2 size={24} color={Colors.white} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <AlertTriangle
              size={24}
              color={getSeverityColor(alert.severity)}
              style={styles.alertIcon}
            />
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <MapPin
                size={20}
                color={Colors.neutral[600]}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>{alert.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock
                size={20}
                color={Colors.neutral[600]}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>{alert.timestamp}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Safety Recommendations</Text>
            <View style={styles.recommendation}>
              <Text style={styles.recommendationText}>
                • Avoid traveling alone in this area
              </Text>
            </View>
            <View style={styles.recommendation}>
              <Text style={styles.recommendationText}>
                • Keep valuables hidden and secure
              </Text>
            </View>
            <View style={styles.recommendation}>
              <Text style={styles.recommendationText}>
                • Stay in well-lit and populated areas
              </Text>
            </View>
            <View style={styles.recommendation}>
              <Text style={styles.recommendationText}>
                • Report suspicious activity immediately
              </Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                Report Similar Incident
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/(pages)/resources')}
            >
              <Text style={styles.secondaryButtonText}>
                View Safety Resources
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  alertContent: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertMessage: {
    flex: 1,
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.neutral[700],
  },
  detailsSection: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailsTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  recommendation: {
    marginBottom: 8,
  },
  recommendationText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: Colors.neutral[700],
    lineHeight: 24,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  secondaryButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.primary[600],
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    color: Colors.neutral[700],
    marginBottom: 16,
  },
  backToAlertsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
  },
  backToAlertsText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.white,
  },
});
