import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Search, BookOpen } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import ResourceCard, { ResourceType } from '@/components/ResourceCard';
import { router } from 'expo-router';

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
  {
    id: '3',
    title: 'Community Support Networks',
    description:
      'Connect with local support networks that can help you if you face extortion threats.',
    imageUrl:
      'https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg',
    category: 'Community',
  },
  {
    id: '4',
    title: 'Safely Documenting Extortion',
    description:
      'Learn how to safely document extortion attempts to report to authorities.',
    imageUrl:
      'https://images.pexels.com/photos/3760809/pexels-photo-3760809.jpeg',
    category: 'Safety',
  },
  {
    id: '5',
    title: 'Business Protection Strategies',
    description:
      'Strategies for business owners to protect themselves from systematic extortion.',
    imageUrl:
      'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    category: 'Business',
  },
  {
    id: '6',
    title: 'Emergency Contact Directory',
    description:
      'A comprehensive directory of emergency contacts and resources across Bangladesh.',
    imageUrl:
      'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg',
    category: 'Directory',
  },
];

export default function ResourcesScreen() {
  const [resources, setResources] = useState<ResourceType[]>(MOCK_RESOURCES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredResources = searchQuery
    ? resources.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          resource.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetch delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleResourcePress = (resource: ResourceType) => {
    // In a real app, navigate to resource details
    router.push(`/resources/${resource.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BookOpen
            size={24}
            color={Colors.primary[700]}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>Safety Resources</Text>
        </View>
        <Text style={styles.subtitle}>
          Educational materials to help prevent extortion
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search
          size={20}
          color={Colors.neutral[400]}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredResources}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResourceCard resource={item} onPress={handleResourcePress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No resources found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or check back later for more resources.
            </Text>
          </View>
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
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: Colors.neutral[800],
  },
  subtitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: Colors.neutral[800],
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: Colors.primary[600],
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    color: Colors.neutral[700],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
});
