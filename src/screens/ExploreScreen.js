import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocation } from '../context/LocationContext';

const { width } = Dimensions.get('window');

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a237e',
  },
  categoriesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default ExploreScreen;
