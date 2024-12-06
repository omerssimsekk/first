import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocations = (category) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLocations = async () => {
    try {
      console.log('\n=== Loading Locations ===');
      console.log('Looking for category:', category);
      
      const savedMarkers = await AsyncStorage.getItem('@saved_markers');
      if (!savedMarkers) {
        console.log('❌ No markers found in AsyncStorage');
        setLocations([]);
        return;
      }

      const allLocations = JSON.parse(savedMarkers);
      
      // Clean and validate the data
      const cleanedLocations = allLocations
        .filter(location => {
          // Basic validation
          const isValid = location && 
                         location.id && 
                         location.name && 
                         location.category === category;
          
          if (!isValid) {
            console.log('Filtered out invalid location:', location);
          }
          return isValid;
        })
        .map(location => {
          // Log image data for debugging
          if (location.image) {
            console.log(`Image data exists for ${location.name}`);
          }
          
          return {
            ...location,
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            hasWifi: Boolean(location.hasWifi),
            hasAlcohol: Boolean(location.hasAlcohol),
            musicTypes: Array.isArray(location.musicTypes) ? location.musicTypes : [],
            operatingHours: {
              open: location.operatingHours?.open || '',
              close: location.operatingHours?.close || ''
            }
          };
        });

      console.log(`Found ${cleanedLocations.length} valid locations for category "${category}"`);
      setLocations(cleanedLocations);
      
    } catch (error) {
      console.error('❌ Error loading locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Add category to dependency array to reload when it changes
  useEffect(() => {
    console.log('\n🔄 Category changed to:', category);
    loadLocations();
  }, [category]);

  return {
    locations,
    loading,
    refreshLocations: loadLocations,
    debugStorage: loadLocations // Use loadLocations as debug function
  };
}; 