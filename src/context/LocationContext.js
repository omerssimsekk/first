import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState('Your City');

  const updateLocation = async () => {
    try {
      console.log('Updating location from context...');
      const locationStr = await AsyncStorage.getItem('userLocation');
      console.log('Location data from storage:', locationStr);
      
      if (locationStr) {
        const location = JSON.parse(locationStr);
        console.log('Parsed location:', location);
        
        if (location.placeInfo && location.placeInfo.city) {
          console.log('Setting city from placeInfo:', location.placeInfo.city);
          setCurrentCity(location.placeInfo.city);
        } else {
          console.log('No placeInfo, getting from coordinates...');
          const response = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          
          if (response[0]) {
            const city = response[0].city || response[0].region || 'Your City';
            console.log('Setting city from geocoding:', city);
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
    <LocationContext.Provider value={{ currentCity, setCurrentCity, updateLocation, updateCity }}>
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
