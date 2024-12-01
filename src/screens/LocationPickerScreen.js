import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const LocationPickerScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();
  const { updateLocation } = useLocation();

  useEffect(() => {
    loadSavedLocation();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const loadSavedLocation = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        setSelectedLocation(location);
        if (location.placeInfo) {
          setSelectedPlace(location.placeInfo);
        } else {
          const placeInfo = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          if (placeInfo[0]) {
            setSelectedPlace(placeInfo[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      let results = [];
      const searchQueries = [
        query,
        `${query}, Turkey`,
        `${query} Province, Turkey`,
        `${query} City, Turkey`,
        `${query} Turkey`
      ];

      for (const searchQuery of searchQueries) {
        if (results.length === 0) {
          const queryResults = await Location.geocodeAsync(searchQuery);
          results = [...results, ...queryResults];
        }
      }

      const detailedResults = await Promise.all(
        results.map(async (result) => {
          try {
            const placeInfo = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            return {
              ...result,
              placeInfo: placeInfo[0],
            };
          } catch (error) {
            console.error('Error getting place info:', error);
            return null;
          }
        })
      );

      // Filter out null results and duplicates
      const uniqueResults = detailedResults
        .filter(result => result !== null)
        .filter((result, index, self) =>
          index === self.findIndex((r) => (
            r.latitude === result.latitude && r.longitude === result.longitude
          ))
        )
        .map(result => ({
          ...result,
          displayName: formatPlaceName(result.placeInfo)
        }));

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Failed to search locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const formatPlaceName = (placeInfo) => {
    if (!placeInfo) return '';
    const parts = [];
    
    if (placeInfo.name) parts.push(placeInfo.name);
    if (placeInfo.district && !parts.includes(placeInfo.district)) parts.push(placeInfo.district);
    if (placeInfo.city && !parts.includes(placeInfo.city)) parts.push(placeInfo.city);
    if (placeInfo.region && !parts.includes(placeInfo.region)) parts.push(placeInfo.region);
    
    return parts.join(', ');
  };

  const handleLocationSelect = async (location) => {
    try {
      const { latitude, longitude, placeInfo } = location;
      const newLocation = {
        latitude,
        longitude,
        placeInfo,
        displayName: formatPlaceName(placeInfo)
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userLocation', JSON.stringify(newLocation));
      
      // Update local state
      setSelectedLocation(newLocation);
      setSelectedPlace(placeInfo);
      setSearchQuery('');
      setSearchResults([]);
      Keyboard.dismiss();

      // Update location context and wait for it to complete
      await updateLocation(newLocation);
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
          style={styles.searchResults}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleLocationSelect(item)}
            >
              <LinearGradient
                colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultGradient}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.resultText}>{item.displayName}</Text>
                  <Ionicons name="location" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      )}

      {isSearching && (
        <View style={styles.searchingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        region={{
          latitude: selectedLocation?.latitude || 41.0082,
          longitude: selectedLocation?.longitude || 28.9784,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    height: 48,
    ...theme.shadows.medium,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  searchResults: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1,
    maxHeight: '50%',
  },
  resultItem: {
    marginBottom: 8,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  resultGradient: {
    borderRadius: theme.borderRadius.md,
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  resultText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  map: {
    flex: 1,
  },
  searchingIndicator: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: 8,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  searchingText: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
  },
});

export default LocationPickerScreen;
