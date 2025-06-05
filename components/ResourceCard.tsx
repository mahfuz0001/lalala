import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Colors } from '@/constants/Colors';
import { BookOpen } from 'lucide-react-native';

export type ResourceType = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
};

type ResourceCardProps = {
  resource: ResourceType;
  onPress: (resource: ResourceType) => void;
};

export default function ResourceCard({ resource, onPress }: ResourceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(resource)}
    >
      <View style={styles.imageContainer}>
        {resource.imageUrl ? (
          <Image
            source={{ uri: resource.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <BookOpen size={24} color={Colors.primary[500]} />
          </View>
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{resource.category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {resource.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {resource.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    height: 120,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: Colors.neutral[50],
  },
  imageContainer: {
    width: 120,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  category: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: Colors.primary[600],
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: Colors.neutral[800],
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: Colors.neutral[600],
    lineHeight: 20,
  },
});
