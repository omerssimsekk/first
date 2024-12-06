import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState('Your City');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Get city name from coordinates
      const response = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (response[0]) {
        const city = response[0].city || response[0].region || 'Your City';
        setCurrentCity(city);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const updateLocation = async (locationData) => {
    try {
      console.log('Updating location from context...', locationData);
      if (locationData) {
        setCurrentLocation(locationData);
        if (locationData.placeInfo && locationData.placeInfo.city) {
          setCurrentCity(locationData.placeInfo.city);
        } else {
          const response = await Location.reverseGeocodeAsync({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
          
          if (response[0]) {
            const city = response[0].city || response[0].region || 'Your City';
            setCurrentCity(city);
          }
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setCurrentCity('Your City');
    }
  };

  const updateCity = async (city) => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        const updatedLocation = {
          ...location,
          placeInfo: {
            ...location.placeInfo,
            city: city
          }
        };
        await AsyncStorage.setItem('userLocation', JSON.stringify(updatedLocation));
      }
      setCurrentCity(city);
    } catch (error) {
      console.error('Error updating city:', error);
    }
  };

  return (
    <LocationContext.Provider value={{ 
      currentCity, 
      setCurrentCity, 
      updateLocation, 
      updateCity,
      currentLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
