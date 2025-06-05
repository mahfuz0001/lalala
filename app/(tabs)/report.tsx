import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import {
  Camera,
  MapPin,
  Shield,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const INCIDENT_TYPES = [
  {
    id: 'extortion',
    label: 'Cash Extortion',
    icon: AlertTriangle,
    color: Colors.danger[600],
  },
  {
    id: 'threat',
    label: 'Threat',
    icon: Shield,
    color: Colors.warning[600],
  },
  {
    id: 'business',
    label: 'Business',
    icon: AlertTriangle,
    color: Colors.primary[600],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: AlertTriangle,
    color: Colors.success[600],
  },
];

export default function ReportScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address[0]) {
          const { street, city, region } = address[0];
          setLocation(`${street}, ${city}, ${region}`);
        }
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!selectedType) {
      alert('Please select an incident type');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/map');
      alert('Report submitted successfully');
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Incident</Text>
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.primary[100]} />
              <Text style={styles.location}>{location}</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.sectionTitle}>What type of incident?</Text>

          <View style={styles.typeGrid}>
            {INCIDENT_TYPES.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.selectedType,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: type.color },
                  ]}
                >
                  <type.icon size={24} color={Colors.white} />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>
              Add Photos/Videos (Optional)
            </Text>
            <View style={styles.mediaButtons}>
              <Pressable
                style={styles.mediaButton}
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    const { status } =
                      await ImagePicker.requestCameraPermissionsAsync();
                    if (status === 'granted') {
                      const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.All,
                        quality: 1,
                      });
                      if (!result.canceled) {
                        // Handle image
                      }
                    }
                  }
                }}
              >
                <Camera size={24} color={Colors.primary[600]} />
                <Text style={styles.mediaButtonText}>Take Photo</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Shield size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.primary[600],
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 28,
    color: Colors.white,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.primary[100],
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  typeCard: {
    width: '50%',
    padding: 8,
  },
  selectedType: {
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaButtons: {
    flexDirection: 'row',
  },
  mediaButton: {
    flex: 1,
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
  },
  mediaButtonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: Colors.primary[600],
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
});
