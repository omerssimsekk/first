import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const CategoryCard = ({ title, icon }) => (
  <TouchableOpacity style={styles.categoryCard}>
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.cardIconContainer}>
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const NearbyEventCard = ({ title, time, distance, image }) => (
  <TouchableOpacity style={styles.nearbyEventCard}>
    <Image source={{ uri: image }} style={styles.eventImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.nearbyEventGradient}
    >
      <View style={styles.nearbyEventContent}>
        <View style={styles.nearbyEventHeader}>
          <Ionicons name="time-outline" size={16} color="#FFFFFF" />
          <Text style={styles.nearbyEventTime}>{time}</Text>
        </View>
        <Text style={styles.nearbyEventTitle}>{title}</Text>
        <View style={styles.nearbyEventFooter}>
          <Ionicons name="location-outline" size={14} color="#FFFFFF" />
          <Text style={styles.nearbyEventDistance}>{distance}</Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const ExploreScreen = () => {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([
    { id: '1', title: 'Restaurants', icon: 'restaurant-outline' },
    { id: '2', title: 'Cafes', icon: 'cafe-outline' },
    { id: '3', title: 'Nightlife', icon: 'wine-outline' },
    { id: '4', title: 'Pubs & Bars', icon: 'beer-outline' },
    { id: '5', title: 'Activities', icon: 'bicycle-outline' },
    { id: '6', title: 'Street Food', icon: 'fast-food-outline' },
  ]);
  
  const [nearbyEvents] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#111827', '#1f2937']}
        style={[styles.mainContainer, { paddingTop: insets.top }]}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Discover the City</Text>
              <Text style={styles.subtitleText}>Explore food and local experiences</Text>
            </View>
          </View>
          
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  icon={category.icon}
                />
              ))}
            </View>
          </View>

          <View style={styles.nearbyEventsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nearbyEventsScrollContent}
            >
              {nearbyEvents.map((event) => (
                <NearbyEventCard
                  key={event.id}
                  title={event.title}
                  time={event.time}
                  distance={event.distance}
                  image={event.image}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 16,
  },
  seeAllButton: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  nearbyEventsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  nearbyEventsScrollContent: {
    paddingRight: 20,
  },
  nearbyEventCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  nearbyEventGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  nearbyEventContent: {
    justifyContent: 'flex-end',
  },
  nearbyEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nearbyEventTime: {
    fontSize: 14,
    color: '#f3f4f6',
    marginLeft: 6,
    fontWeight: '500',
  },
  nearbyEventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  nearbyEventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyEventDistance: {
    fontSize: 14,
    color: '#f3f4f6',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default ExploreScreen;
