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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';

const LocationPickerScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const navigation = useNavigation();
  const { updateLocation } = useLocation();

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        setSelectedLocation(location);
        const placeInfo = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        if (placeInfo[0]) {
          setSelectedPlace(placeInfo[0]);
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
    
    try {
      // First try with the exact query
      let results = await Location.geocodeAsync(query);
      
      // If no results, try adding the country name
      if (results.length === 0 && !query.toLowerCase().includes('turkey')) {
        results = await Location.geocodeAsync(`${query}, Turkey`);
      }

      // If still no results, try with different formats
      if (results.length === 0) {
        const alternativeQueries = [
          `${query} Province, Turkey`,
          `${query} City, Turkey`,
          `${query} Turkey`
        ];

        for (const altQuery of alternativeQueries) {
          if (results.length === 0) {
            const altResults = await Location.geocodeAsync(altQuery);
            results = [...results, ...altResults];
          }
        }
      }

      const detailedResults = await Promise.all(
        results.map(async (result) => {
          const placeInfo = await Location.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });
          return {
            ...result,
            placeInfo: placeInfo[0],
          };
        })
      );

      // Filter out duplicates based on coordinates
      const uniqueResults = detailedResults.filter((result, index, self) =>
        index === self.findIndex((r) => (
          r.latitude === result.latitude && r.longitude === result.longitude
        ))
      );

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Could not search for locations. Please try again.');
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    searchLocations(text);
  };

  const handleSelectSearchResult = async (result) => {
    const newLocation = {
      latitude: result.latitude,
      longitude: result.longitude,
    };
    setSelectedLocation(newLocation);
    setSelectedPlace(result.placeInfo);
    setSearchQuery('');
    setSearchResults([]);
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

      const placeInfo = await Location.reverseGeocodeAsync(newLocation);
      if (placeInfo[0]) {
        setSelectedPlace(placeInfo[0]);
      }

      setSelectedLocation(newLocation);
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event) => {
    const newLocation = event.nativeEvent.coordinate;
    setSelectedLocation(newLocation);
    
    try {
      const placeInfo = await Location.reverseGeocodeAsync(newLocation);
      if (placeInfo[0]) {
        setSelectedPlace(placeInfo[0]);
      }
    } catch (error) {
      console.error('Error getting place info:', error);
    }
  };

  const saveLocation = async () => {
    try {
      if (selectedLocation && selectedPlace) {
        const locationData = {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          placeInfo: {
            city: selectedPlace.city || selectedPlace.region,
            region: selectedPlace.region,
            country: selectedPlace.country,
          }
        };
        console.log('Saving location data:', locationData);
        await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
        
        // Update location context
        if (updateLocation) {
          await updateLocation();
        }
        
        Alert.alert(
          'Success',
          'Location updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Please select a valid location first.');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Could not save location. Please try again.');
    }
  };

  const renderSearchResult = ({ item }) => {
    const { placeInfo } = item;
    const placeName = [
      placeInfo.city,
      placeInfo.region,
      placeInfo.country
    ].filter(Boolean).join(', ');

    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => handleSelectSearchResult(item)}
      >
        <Ionicons name="location" size={20} color="#1a237e" />
        <Text style={styles.searchResultText}>{placeName}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  const getPlaceName = () => {
    if (!selectedPlace) return '';
    return [
      selectedPlace.city,
      selectedPlace.region,
      selectedPlace.country
    ].filter(Boolean).join(', ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick Location</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveLocation}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a city or place..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#666"
          />
        </View>
        {selectedPlace && (
          <View style={styles.selectedPlaceContainer}>
            <Text style={styles.selectedPlaceText}>
              Selected: {getPlaceName()}
            </Text>
          </View>
        )}
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => index.toString()}
          style={styles.searchResults}
        />
      )}

      {selectedLocation && !searchResults.length && (
        <>
          <MapView
            style={styles.map}
            region={{
              ...selectedLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={selectedLocation}
              title={getPlaceName()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  saveButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  selectedPlaceContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedPlaceText: {
    fontSize: 14,
    color: '#1a237e',
    fontWeight: '600',
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

export default LocationPickerScreen;
