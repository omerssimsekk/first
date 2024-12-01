import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const InitialLocationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const navigateToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
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
        style={styles.resultItem}
        onPress={() => handleSelectLocation(item)}
      >
        <Ionicons name="location" size={24} color={theme.colors.primary} />
        <Text style={styles.resultText}>{placeName}</Text>
      </TouchableOpacity>
    );
  };

  const WelcomeSection = () => (
    <View style={styles.welcomeContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        style={styles.welcomeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="location" size={64} color={theme.colors.text} />
        <Text style={styles.welcomeTitle}>Choose Your Location</Text>
        <Text style={styles.welcomeSubtitle}>
          Find exciting nightlife spots near you
        </Text>
      </LinearGradient>
      
      <View style={styles.tipContainer}>
        <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
        <Text style={styles.tipText}>
          Search for your city or use your current location
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter your city..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchLocations(text);
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size={36} color={theme.colors.primary} style={styles.loading} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSearchResult}
        />
      ) : (
        <WelcomeSection />
      )}

      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={getCurrentLocation}
      >
        <View
          style={styles.gradientButton}
        >
          <Ionicons name="location" size={24} color={theme.colors.text} />
          <Text style={styles.buttonText}>Use Current Location</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultText: {
    marginLeft: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  currentLocationButton: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  welcomeGradient: {
    width: '100%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});

export default InitialLocationScreen;
