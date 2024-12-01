import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocation } from '../context/LocationContext';

const LocationsScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const category = route.params?.category || 'All Places';
  const { currentCity, updateCity } = useLocation();

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        setSelectedLocation(location);
        if (location.placeInfo && location.placeInfo.city) {
          updateCity(location.placeInfo.city);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading location:', error);
      setLoading(false);
    }
  };

  const updateCityName = async (location) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (response[0]) {
        const city = response[0].city || response[0].region || 'your city';
        updateCity(city);
      }
    } catch (error) {
      console.error('Error getting city name:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(newLocation);
      await AsyncStorage.setItem('userLocation', JSON.stringify(newLocation));
      await updateCityName(newLocation);
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event) => {
    const newLocation = event.nativeEvent.coordinate;
    
    Alert.alert(
      'Change Location',
      'Do you want to change your location to this point?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setSelectedLocation(newLocation);
            await AsyncStorage.setItem('userLocation', JSON.stringify(newLocation));
            await updateCityName(newLocation);
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>Welcome to {currentCity}</Text>
        <Text style={styles.categoryTitle}>{category}</Text>
      </View>
      {selectedLocation && (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              ...selectedLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={selectedLocation}
              title="Your Location"
            >
              <View style={styles.customMarker}>
                <Ionicons name="person" size={18} color="#1a237e" />
              </View>
            </Marker>
          </MapView>
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="#1a237e" />
          </TouchableOpacity>
        </>
      )}
    </View>
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
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#1a237e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
});

export default LocationsScreen;