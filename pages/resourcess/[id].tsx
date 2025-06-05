import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { ArrowLeft, Share2, BookOpen } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ResourceType } from '@/components/ResourceCard';
import { useMemo } from 'react';

// Mock data
const MOCK_RESOURCES: ResourceType[] = [
  {
    id: '1',
    title: 'How to Identify Extortion Attempts',
    description:
      'Learn the common signs and tactics used in extortion attempts and how to respond safely.',
    imageUrl:
      'https://images.pexels.com/photos/6964140/pexels-photo-6964140.jpeg',
    category: 'Education',
  },
  {
    id: '2',
    title: 'Legal Rights When Facing Extortion',
    description:
      'Know your legal rights and the laws in Bangladesh that protect you from extortion.',
    imageUrl:
      'https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg',
    category: 'Legal',
  },
];

// Mock content for resources
const RESOURCE_CONTENT = {
  '1': {
    content: [
      {
        type: 'paragraph',
        text: 'Extortion attempts in Bangladesh often follow recognizable patterns. Being able to identify these patterns is the first step in protecting yourself and your community.',
      },
      {
        type: 'heading',
        text: 'Common Extortion Tactics',
      },
      {
        type: 'bullet',
        items: [
          'Demands for "protection money" from businesses',
          'Threats against transportation workers at terminals or stations',
          'Fraudulent claims about your family members being in trouble',
          'Intimidation at construction sites or new businesses',
          'Threats via phone or messaging apps demanding immediate payment',
        ],
      },
      {
        type: 'heading',
        text: 'Warning Signs',
      },
      {
        type: 'paragraph',
        text: 'Pay attention to these warning signs that may indicate you are being targeted:',
      },
      {
        type: 'bullet',
        items: [
          'Repeated visits by the same individuals asking for "contributions"',
          'Vague threats about "consequences" if you don\'t comply',
          'References to local gangs or criminal organizations',
          'Surveillance of your business or home',
          'Escalating demands over time',
        ],
      },
      {
        type: 'heading',
        text: 'How to Respond',
      },
      {
        type: 'paragraph',
        text: 'If you believe you are facing an extortion attempt:',
      },
      {
        type: 'bullet',
        items: [
          'Stay calm and do not react aggressively',
          'Do not agree to demands immediately',
          'If possible, safely document the interaction',
          'Report the incident through proper channels',
          'Connect with community support networks',
          'Consider temporary changes to your routine if necessary for safety',
        ],
      },
    ],
  },
  '2': {
    content: [
      {
        type: 'paragraph',
        text: 'Understanding your legal rights is essential when facing extortion threats in Bangladesh. The legal system provides various protections against such criminal activities.',
      },
      {
        type: 'heading',
        text: 'Key Laws Against Extortion',
      },
      {
        type: 'bullet',
        items: [
          'The Penal Code of Bangladesh, Section 383-389 defines extortion as a criminal offense',
          'The Prevention of Money Laundering Act covers extortion-related financial crimes',
          'The Digital Security Act addresses digital forms of extortion and threats',
        ],
      },
      {
        type: 'heading',
        text: 'Your Legal Rights',
      },
      {
        type: 'paragraph',
        text: 'As a citizen or resident of Bangladesh, you have the following rights:',
      },
      {
        type: 'bullet',
        items: [
          'Right to report crimes without fear of retaliation',
          'Right to police protection if facing credible threats',
          'Right to anonymity when reporting sensitive cases',
          'Right to legal counsel during the reporting process',
          'Right to pursue civil damages in addition to criminal charges',
        ],
      },
      {
        type: 'heading',
        text: 'Reporting Process',
      },
      {
        type: 'paragraph',
        text: 'The legal process for reporting extortion in Bangladesh involves:',
      },
      {
        type: 'bullet',
        items: [
          'Filing a First Information Report (FIR) at your local police station',
          'Providing a detailed statement to investigating officers',
          'Preserving and submitting any evidence you may have',
          'Following up with authorities on the status of your case',
          'Seeking witness protection if necessary',
        ],
      },
    ],
  },
};

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams();

  const resource = useMemo(() => {
    return MOCK_RESOURCES.find((r) => r.id === id) || null;
  }, [id]);

  const content = useMemo(() => {
    return RESOURCE_CONTENT[id as keyof typeof RESOURCE_CONTENT]?.content || [];
  }, [id]);

  if (!resource) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Resource Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Resource not found</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push('/(pages)/resources')}
          >
            <Text style={styles.backButtonText}>Back to Resources</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{resource.category}</Text>
        <Pressable style={styles.shareButton}>
          <Share2 size={24} color={Colors.white} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        {resource.imageUrl && (
          <Image
            source={{ uri: resource.imageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentContainer}>
          <View style={styles.resourceHeader}>
            <BookOpen
              size={24}
              color={Colors.primary[600]}
              style={styles.titleIcon}
            />
            <Text style={styles.title}>{resource.title}</Text>
          </View>

          <Text style={styles.description}>{resource.description}</Text>

          <View style={styles.divider} />

          {content.map((item, index) => {
            if (item.type === 'paragraph') {
              return (
                <Text key={index} style={styles.paragraph}>
                  {item.text}
                </Text>
              );
            } else if (item.type === 'heading') {
              return (
                <Text key={index} style={styles.heading}>
                  {item.text}
                </Text>
              );
            } else if (item.type === 'bullet') {
              return (
                <View key={index} style={styles.bulletList}>
                  {Array.isArray(item.items) &&
                    item.items.map((bulletItem, bulletIndex) => (
                      <View key={bulletIndex} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bulletItem}</Text>
                      </View>
                    ))}
                </View>
              );
            }
            return null;
          })}

          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/report')}
            >
              <Text style={styles.actionButtonText}>Report an Incident</Text>
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
    backgroundColor: Colors.primary[700],
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
  coverImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  title: {
    flex: 1,
    fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: Colors.neutral[800],
    lineHeight: 28,
  },
  description: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 16,
  },
  paragraph: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 16,
    lineHeight: 24,
  },
  heading: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: Colors.neutral[800],
    marginTop: 8,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: Colors.primary[600],
    marginRight: 8,
    width: 16,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: Colors.neutral[800],
    lineHeight: 24,
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 40,
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
  backButtonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: Colors.white,
  },
});
