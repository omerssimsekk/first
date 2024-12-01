import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LocationCard = ({ name, type, distance, rating, onPress }) => (
  <TouchableOpacity style={styles.locationCard} onPress={onPress}>
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.locationGradient}
    >
      <View style={styles.locationContent}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationName}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationType}>{type}</Text>
          <Text style={styles.locationDistance}>{distance}</Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const LocationsScreen = () => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.0082,  // Istanbul's coordinates as default
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const loadSavedLocation = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        console.log('Loading saved location:', location);
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setMapRegion(newRegion);
        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        
        // Animate map to saved location
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please grant location permissions to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setCurrentLocation(location.coords);
      setMapRegion(newRegion);
      
      // Animate map to new location
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not fetch location. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Use useFocusEffect to reload location when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('LocationsScreen focused - loading saved location');
      loadSavedLocation();
    }, [])
  );

  const goToCurrentLocation = () => {
    if (currentLocation) {
      const region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current?.animateToRegion(region, 1000);
    } else {
      getCurrentLocation();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Nearby Places</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {locations.map((location) => (
            <Marker
              key={location.id}
              coordinate={location.coordinate}
              title={location.name}
              description={location.type}
              onPress={() => setSelectedLocation(location)}
            />
          ))}
        </MapView>

        <TouchableOpacity 
          style={styles.currentLocationButton}
          onPress={goToCurrentLocation}
          activeOpacity={0.7}
        >
          <View style={styles.buttonInner}>
            <Ionicons name="locate" size={24} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {locations.length > 0 && (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              name={location.name}
              type={location.type}
              distance={location.distance}
              rating={location.rating}
              onPress={() => setSelectedLocation(location)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  currentLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  scrollView: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  locationCard: {
    width: width * 0.8,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  locationGradient: {
    padding: 16,
  },
  locationContent: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FFFFFF',
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationDistance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default LocationsScreen;