import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocation } from '../context/LocationContext';

const EventsScreen = () => {
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    } catch (error) {
      console.error('Error loading location:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events in {currentCity}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.comingSoonText}>Events coming soon!</Text>
      </View>
    </ScrollView>
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
});

export default EventsScreen;
