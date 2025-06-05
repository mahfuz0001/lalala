import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Phone, Heart, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export type EmergencyContact = {
  id: string;
  name: string;
  phone_number: string;
  relationship?: string;
  is_primary: boolean;
};

type EmergencyContactCardProps = {
  contact: EmergencyContact;
  onDelete: (id: string) => void;
  onCall: (phoneNumber: string) => void;
};

export default function EmergencyContactCard({
  contact,
  onDelete,
  onCall,
}: EmergencyContactCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.phone}>{contact.phone_number}</Text>
          {contact.relationship && (
            <View style={styles.relationshipContainer}>
              <Heart size={12} color={Colors.primary[600]} />
              <Text style={styles.relationship}>{contact.relationship}</Text>
            </View>
          )}
          {contact.is_primary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>Primary Contact</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onCall(contact.phone_number)}
          >
            <Phone size={20} color={Colors.primary[600]} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(contact.id)}
          >
            <Trash2 size={20} color={Colors.danger[600]} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  phone: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  relationshipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relationship: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: Colors.neutral[600],
    marginLeft: 4,
  },
  primaryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  primaryText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 12,
    color: Colors.primary[600],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.danger[50],
  },
});