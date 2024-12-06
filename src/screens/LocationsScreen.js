import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../context/LocationContext';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetInfoModal from '../components/GetInfoModal';
import InfoModal from '../components/InfoModal';
import { CATEGORIES } from '../constants/categories';

// Custom map style to hide POIs
const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

const MARKERS_STORAGE_KEY = '@saved_markers';

const CustomMarker = ({ category, onPress }) => {
  const categoryInfo = CATEGORIES[category];
  
  return (
    <Ionicons 
      name={categoryInfo?.icon || 'location'} 
      size={32} 
      color={categoryInfo?.color || theme.colors.primary} 
      style={styles.markerIcon}
      onPress={onPress}
    />
  );
};

const LocationsScreen = () => {
  const { currentLocation, selectedCity } = useLocation();
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedMarkers, setSavedMarkers] = useState([]);
  const [showGetInfoModal, setShowGetInfoModal] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Add this function
  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('Storage cleared');
      setSavedMarkers([]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // You can call this once to clear everything and comment it out after:
  useEffect(() => {
    // clearStorage(); // Uncomment this line once to clear storage
    loadSavedMarkers();
    checkAsyncStorage();
  }, []);

  const loadSavedMarkers = async () => {
    try {
      console.log('Loading markers...');
      const storedMarkers = await AsyncStorage.getItem(MARKERS_STORAGE_KEY);
      console.log('Raw stored markers:', storedMarkers);
      if (storedMarkers) {
        const parsedMarkers = JSON.parse(storedMarkers);
        console.log('Parsed markers:', parsedMarkers);
        setSavedMarkers(parsedMarkers);
      } else {
        console.log('No markers found in storage');
        setSavedMarkers([]); // Explicitly set empty array if no markers
      }
    } catch (error) {
      console.error('Error loading markers:', error);
      setSavedMarkers([]); // Set empty array on error
    }
  };

  const saveMarker = async (marker) => {
    try {
      console.log('Saving marker with coordinates:', {
        latitude: marker.latitude,
        longitude: marker.longitude
      });
      const newMarker = {
        id: Date.now().toString(),
        latitude: marker.latitude,
        longitude: marker.longitude,
        name: marker.name,
        note: marker.note,
        category: marker.category,
        hasAlcohol: marker.hasAlcohol,
        hasWifi: marker.hasWifi,
        instagram: marker.instagram,
        operatingHours: marker.operatingHours,
        musicTypes: marker.musicTypes,
        image: marker.image,
        timestamp: new Date().toISOString(),
      };

      console.log('Saving marker with image:', newMarker.image ? 'Image exists' : 'No image');
      
      const updatedMarkers = [...savedMarkers, newMarker];
      await AsyncStorage.setItem(MARKERS_STORAGE_KEY, JSON.stringify(updatedMarkers));
      setSavedMarkers(updatedMarkers);
    } catch (error) {
      console.error('Error saving marker:', error);
    }
  };

  useEffect(() => {
    const initializeRegion = () => {
      if (selectedCity?.latitude && selectedCity?.longitude) {
        const cityRegion = {
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(cityRegion);
        mapRef.current?.animateToRegion(cityRegion, 1000);
      }
    };

    initializeRegion();
  }, [selectedCity]);

  const handleLocationPress = () => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      const newRegion = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const handleMarkerButtonPress = () => {
    setIsPickingLocation(!isPickingLocation);
  };

  const handleMapPress = async (event) => {
    if (isPickingLocation) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setTempMarker({ latitude, longitude });
      setShowGetInfoModal(true);
      setIsPickingLocation(false);
    }
  };

  const handleSaveLocation = async (locationInfo) => {
    console.log('Saving location with info:', locationInfo);
    if (tempMarker) {
      if (isEditing) {
        await updateMarker(tempMarker.id, {
          ...locationInfo,
          latitude: tempMarker.latitude,
          longitude: tempMarker.longitude,
        });
        setIsEditing(false);
      } else {
        const markerWithInfo = {
          ...tempMarker,
          ...locationInfo,
        };
        await saveMarker(markerWithInfo);
      }
      setShowGetInfoModal(false);
      setTempMarker(null);
    }
  };

  const handleMarkerPress = (marker) => {
    console.log('Selected marker:', marker);
    console.log('Music Types:', marker.musicTypes);
    setSelectedMarker(marker);
    setShowInfoModal(true);
  };

  const handleDeleteMarker = async (markerId) => {
    try {
      const updatedMarkers = savedMarkers.filter(marker => marker.id !== markerId);
      console.log('After deletion:', updatedMarkers);
      await AsyncStorage.setItem(MARKERS_STORAGE_KEY, JSON.stringify(updatedMarkers));
      setSavedMarkers(updatedMarkers);
      setShowInfoModal(false);
    } catch (error) {
      console.error('Error deleting marker:', error);
    }
  };

  const handleEditMarker = (marker) => {
    setTempMarker(marker);
    setIsEditing(true);
    setShowGetInfoModal(true);
  };

  const updateMarker = async (markerId, updatedInfo) => {
    try {
      const updatedMarkers = savedMarkers.map(marker => 
        marker.id === markerId 
          ? { 
              ...marker, 
              ...updatedInfo,
              hasAlcohol: updatedInfo.category === 'restaurant' ? updatedInfo.hasAlcohol : undefined,
              hasWifi: updatedInfo.hasWifi,
              instagram: updatedInfo.instagram,
              operatingHours: updatedInfo.operatingHours,
              musicTypes: updatedInfo.category === 'bar' ? updatedInfo.musicTypes : undefined,
              image: updatedInfo.image
            }
          : marker
      );
      console.log('Updating markers:', updatedMarkers);
      await AsyncStorage.setItem(MARKERS_STORAGE_KEY, JSON.stringify(updatedMarkers));
      setSavedMarkers(updatedMarkers);
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };

  // Add debug effect
  useEffect(() => {
    console.log('showGetInfoModal:', showGetInfoModal);
  }, [showGetInfoModal]);

  // Add this function to check all stored data
  const checkAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log('All AsyncStorage Data:', result);
    } catch (error) {
      console.error('Error checking AsyncStorage:', error);
    }
  };

  // Add this debug effect to monitor savedMarkers
  useEffect(() => {
    console.log('Current savedMarkers:', savedMarkers);
  }, [savedMarkers]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.content, {
        paddingTop: Math.max(insets.top + 12, 32),
        paddingLeft: Math.max(insets.left, 20),
        paddingRight: Math.max(insets.right, 20),
        paddingBottom: Math.max(insets.bottom, 20),
      }]}>
        <Text style={styles.title}>Places</Text>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            customMapStyle={mapStyle}
            showsUserLocation
            showsMyLocationButton={false}
            mapPadding={{ left: 0, right: 0, top: 0, bottom: 64 }}
            onPress={handleMapPress}
          >
            {savedMarkers.map(marker => (
              <Marker
                key={marker.id}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={null}
                description={null}
                hideCallout={true}
                onPress={() => handleMarkerPress(marker)}
              >
                <CustomMarker 
                  category={marker.category}
                  onPress={() => handleMarkerPress(marker)}
                />
              </Marker>
            ))}
          </MapView>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationButtonInner}>
              <Ionicons name="locate" size={24} color={theme.colors.text} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.markerButton,
              isPickingLocation && styles.markerButtonActive
            ]}
            onPress={handleMarkerButtonPress}
            activeOpacity={0.7}
          >
            <View style={styles.locationButtonInner}>
              <Ionicons 
                name="location" 
                size={24} 
                color={isPickingLocation ? theme.colors.primary : theme.colors.text} 
              />
            </View>
          </TouchableOpacity>
          
          {isPickingLocation && (
            <View style={styles.guidanceContainer}>
              <Text style={styles.guidanceText}>
                Tap anywhere on the map to place your marker
              </Text>
            </View>
          )}
        </View>
      </View>
      <InfoModal
        visible={showInfoModal}
        onClose={() => {
          setShowInfoModal(false);
          setSelectedMarker(null);
        }}
        location={selectedMarker}
        onDelete={handleDeleteMarker}
        onEdit={handleEditMarker}
      />
      <GetInfoModal
        visible={showGetInfoModal}
        onClose={() => {
          setShowGetInfoModal(false);
          setTempMarker(null);
          setIsEditing(false);
        }}
        onSave={handleSaveLocation}
        initialValues={isEditing ? {
          name: tempMarker?.name || '',
          note: tempMarker?.note || '',
          category: tempMarker?.category || null,
          hasAlcohol: tempMarker?.hasAlcohol || false,
          hasWifi: tempMarker?.hasWifi || false,
          instagram: tempMarker?.instagram || '',
          operatingHours: tempMarker?.operatingHours || { open: '', close: '' },
          musicTypes: tempMarker?.musicTypes || [],
          image: tempMarker?.image || null,
        } : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  mapContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 60,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    bottom: 18,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.colors.border || '#2C2C2E',
  },
  locationButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  markerButton: {
    position: 'absolute',
    bottom: 78,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.colors.border || '#2C2C2E',
  },
  markerButtonActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  guidanceContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border || '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  guidanceText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  markerIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default LocationsScreen;