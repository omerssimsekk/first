import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';

const InitialLocationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const navigateToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  const searchLocations = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    searchLocations(text);
  };

  const handleSelectLocation = async (result) => {
    try {
      setLoading(true);
      const locationData = {
        latitude: result.latitude,
        longitude: result.longitude,
        placeInfo: result.placeInfo,
      };
      await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
      navigateToHome();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Please allow location access to use this feature.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const placeInfo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        placeInfo: placeInfo[0],
      };

      await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
      navigateToHome();
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
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
        onPress={() => handleSelectLocation(item)}
      >
        <Ionicons name="location" size={20} color="#fff" />
        <Text style={styles.searchResultText}>{placeName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Where would you like to explore?</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a city..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
          </View>

          {loading ? (
            <ActivityIndicator color="#fff" style={styles.loader} />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => index.toString()}
              style={styles.searchResults}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#fff" />
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  searchResultText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  currentLocationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default InitialLocationScreen;
