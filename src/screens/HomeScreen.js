import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LocationsScreen from './LocationsScreen';
import ProfileScreen from './ProfileScreen';
import EventsScreen from './EventsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocation } from '../context/LocationContext';

const Tab = createBottomTabNavigator();

const CategoryCard = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <Ionicons name={icon} size={32} color="#1a237e" />
    <Text style={styles.categoryTitle}>{title}</Text>
  </TouchableOpacity>
);

const ExploreScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { currentCity, updateCity } = useLocation();

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        if (location.placeInfo && location.placeInfo.city) {
          updateCity(location.placeInfo.city);
        } else {
          // Get city name from coordinates
          const response = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          
          if (response[0]) {
            updateCity(response[0].city || response[0].region || 'your city');
          }
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: '1', title: 'Restaurants', icon: 'restaurant' },
    { id: '2', title: 'Bars', icon: 'beer' },
    { id: '3', title: 'Clubs', icon: 'wine' },
    { id: '4', title: 'Cafes', icon: 'cafe' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.welcomeTitle}>Hello, {currentCity}!</Text>
      
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              onPress={() => navigation.navigate('Locations', { category: category.title })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#e94560',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          paddingHorizontal: 5,
          paddingTop: 0,
          backgroundColor: '#fff',
          position: 'absolute',
          borderTopWidth: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Locations') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Locations" 
        component={LocationsScreen}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    padding: 20,
    paddingTop: 60,
  },
  categoriesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
  },
});

export default HomeScreen;
