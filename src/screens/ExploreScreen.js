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
      <Ionicons name={icon} size={32} color="#FFFFFF" />
      <Text style={styles.cardTitle}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const NearbyEventCard = ({ title, time, distance }) => (
  <TouchableOpacity style={styles.nearbyEventCard}>
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
    {
      id: '1',
      title: 'Restaurants',
      icon: 'restaurant-outline',
    },
    {
      id: '2',
      title: 'Cafes',
      icon: 'cafe-outline',
    },
    {
      id: '3',
      title: 'Nightlife',
      icon: 'wine-outline',
    },
    {
      id: '4',
      title: 'Pubs & Bars',
      icon: 'beer-outline',
    },
    {
      id: '5',
      title: 'Activities',
      icon: 'bicycle-outline',
    },
    {
      id: '6',
      title: 'Street Food',
      icon: 'fast-food-outline',
    },
  ]);
  const [nearbyEvents, setNearbyEvents] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Discover the City</Text>
            <Text style={styles.subtitleText}>Explore food and local experiences</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
            />
          ))}
        </View>

        <View style={styles.nearbyEventsSection}>
          <Text style={styles.sectionTitle}>Near You</Text>
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
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    width: '100%',
    paddingHorizontal: 0,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  headerContent: {
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  categoryCard: {
    width: (width - 48) / 2,
    height: 100,
    marginBottom: 16,
    borderRadius: 25,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  cardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  nearbyEventsSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 16,
    marginBottom: 12,
  },
  nearbyEventsScrollContent: {
    paddingHorizontal: 8,
  },
  nearbyEventCard: {
    width: 220,
    height: 120,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  nearbyEventGradient: {
    flex: 1,
    padding: 16,
  },
  nearbyEventContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nearbyEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyEventTime: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  nearbyEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  nearbyEventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyEventDistance: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
});

export default ExploreScreen;
