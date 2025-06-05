import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  User,
  Shield,
  MapPin,
  Heart,
  Phone,
  Plus,
  LogOut,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import EmergencyContactCard, { EmergencyContact } from '@/components/EmergencyContactCard';
import { useNotifications } from '@/hooks/useNotifications';

type UserStats = {
  signals_sent: number;
  signals_responded: number;
  people_helped: number;
  distance_traveled: number;
  is_verified: boolean;
};

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  // Initialize notifications
  useNotifications();

  useEffect(() => {
    loadUserData();
    loadEmergencyContacts();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserProfile(user);
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setStats(statsData);
    }
  };

  const loadEmergencyContacts = async () => {
    const { data } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('is_primary', { ascending: false });
    if (data) {
      setContacts(data);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    const { error } = await supabase.from('emergency_contacts').insert({
      name: newContact.name,
      phone_number: newContact.phone,
      relationship: newContact.relationship || null,
      is_primary: contacts.length === 0, // First contact is primary
    });

    if (error) {
      Alert.alert('Error', 'Failed to add contact');
      return;
    }

    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddContact(false);
    loadEmergencyContacts();
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      loadEmergencyContacts();
    }
  };

  const handleCallContact = (phoneNumber: string) => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={32} color={Colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userProfile?.user_metadata?.full_name || 'Anonymous User'}</Text>
            <Text style={styles.email}>{userProfile?.email}</Text>
            {stats?.is_verified && (
              <View style={styles.verifiedBadge}>
                <Shield size={12} color={Colors.primary[600]} />
                <Text style={styles.verifiedText}>Verified User</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Shield size={24} color={Colors.primary[600]} />
          <Text style={styles.statValue}>{stats?.signals_sent || 0}</Text>
          <Text style={styles.statLabel}>Signals Sent</Text>
        </View>

        <View style={styles.statCard}>
          <Heart size={24} color={Colors.primary[600]} />
          <Text style={styles.statValue}>{stats?.people_helped || 0}</Text>
          <Text style={styles.statLabel}>People Helped</Text>
        </View>

        <View style={styles.statCard}>
          <MapPin size={24} color={Colors.primary[600]} />
          <Text style={styles.statValue}>
            {Math.round((stats?.distance_traveled || 0) / 1000)}km
          </Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => setShowAddContact(true)}
          >
            <Plus size={20} color={Colors.primary[600]} />
          </Pressable>
        </View>

        {showAddContact && (
          <View style={styles.addContactForm}>
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={newContact.name}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={newContact.phone}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship (optional)"
              value={newContact.relationship}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, relationship: text }))}
            />
            <View style={styles.formButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddContact(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleAddContact}
              >
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </Pressable>
            </View>
          </View>
        )}

        {contacts.map((contact) => (
          <EmergencyContactCard
            key={contact.id}
            contact={contact}
            onDelete={handleDeleteContact}
            onCall={handleCallContact}
          />
        ))}
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color={Colors.danger[600]} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
  },
  header: {
    backgroundColor: Colors.primary[600],
    padding: 20,
    paddingTop: 60,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: Colors.white,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.primary[100],
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 12,
    color: Colors.primary[600],
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: Colors.neutral[800],
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContactForm: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral[100],
  },
  saveButton: {
    backgroundColor: Colors.primary[600],
  },
  cancelButtonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
  },
  saveButtonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  signOutText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.danger[600],
    marginLeft: 8,
  },
});