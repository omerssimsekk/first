import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Platform,
  Pressable,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LocationsScreen = () => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  
  // Core states for location picking
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Other necessary states
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAppointmentRequired, setIsAppointmentRequired] = useState(false);
  const [hasAlcohol, setHasAlcohol] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [notes, setNotes] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isWaitingForMapPress, setIsWaitingForMapPress] = useState(false);

  // Define categories
  const categories = [
    { id: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
    { id: 'bar', label: 'Bar', icon: 'beer' },
    { id: 'club', label: 'Club', icon: 'musical-notes' },
    { id: 'meyhane', label: 'Meyhane', icon: 'restaurant' },
    { id: 'streetFood', label: 'Street Food', icon: 'storefront' },
    { id: 'localFood', label: 'Local Food', icon: 'pizza' },
  ];

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

  const handleMapPress = (e) => {
    console.log('Map pressed, isPickingLocation:', isPickingLocation);
    
    if (isPickingLocation) {
      const { coordinate } = e.nativeEvent;
      console.log('Selected coordinate:', coordinate);
      
      // First set the location
      setSelectedLocation(coordinate);
      console.log('Location set');
      
      // Reset form fields before showing modal
      setLocationName('');
      setSelectedCategories([]);
      setIsAppointmentRequired(false);
      setHasAlcohol(false);
      setInstagram('');
      setNotes('');
      setPhoneNumber('');
      
      // Get address for the selected location
      getAddressFromCoordinates(coordinate);
      
      // Show modal and update states
      setShowModal(true);
      console.log('Modal should be visible now');
      setIsPickingLocation(false);
      setIsWaitingForMapPress(false);
    }
  };

  const handleAddLocation = () => {
    if (!locationName || !locationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }
    
    if (!selectedCategories || selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    const newMarker = {
      id: Date.now().toString(),
      coordinate: selectedLocation,
      name: locationName.trim(),
      categories: selectedCategories,
      appointmentRequired: isAppointmentRequired,
      hasAlcohol: hasAlcohol,
      instagram: instagram.trim(),
      notes: notes.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    setMarkers(prevMarkers => {
      const newMarkers = isEditing && selectedMarker
        ? prevMarkers.map(marker => marker.id === selectedMarker.id ? newMarker : marker)
        : [...(prevMarkers || []), newMarker];
      
      // Save markers to AsyncStorage
      saveMarkers(newMarkers).catch(error => {
        console.error('Failed to save markers:', error);
      });
      return newMarkers;
    });

    // Reset all states
    setShowModal(false);
    setLocationName('');
    setSelectedCategories([]);
    setSelectedLocation(null);
    setIsPickingLocation(false);
    setIsEditing(false);
    setSelectedMarker(null);
  };

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const toggleLocationPicker = () => {
    const newPickingState = !isPickingLocation;
    console.log('Toggling location picker to:', newPickingState);
    
    setIsPickingLocation(newPickingState);
    setIsWaitingForMapPress(newPickingState);
    
    if (!newPickingState) {
      setSelectedLocation(null);
      setShowModal(false);
    }
  };

  useEffect(() => {
    console.log('Picking mode changed:', isPickingLocation);
    if (!isPickingLocation) {
      console.log('Exiting picking mode');
    }
  }, [isPickingLocation]);

  useEffect(() => {
    console.log('showModal state changed:', showModal);
  }, [showModal]);

  // Add this function at the top of your component to get marker style by category
  const getMarkerStyle = (category) => {
    switch (category) {
      case 'restaurant':
        return {
          icon: 'restaurant',
          color: '#FF5252'
        };
      case 'bar':
        return {
          icon: 'beer',
          color: '#FFD740'
        };
      case 'club':
        return {
          icon: 'musical-notes',
          color: '#FF1744'
        };
      case 'meyhane':
        return {
          icon: 'restaurant',
          color: '#E0E0E0'
        };
      case 'streetFood':
        return {
          icon: 'storefront',
          color: '#00C853'
        };
      case 'localFood':
        return {
          icon: 'pizza',
          color: '#26A69A'
        };
      default:
        return {
          icon: 'location',
          color: theme.colors.primary
        };
    }
  };

  // Add this custom map style
  const customMapStyle = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#212121'  // Dark background
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#192f48'  // Dark blue water
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#2c2c2c'  // Dark gray roads
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8f8f8f'  // Light gray road names
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1c1c1c'  // Dark text outline for better readability
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [
        {
          color: '#1a3721'  // Dark green parks
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#447744'  // Muted green for park names
        }
      ]
    },
    {
      featureType: 'poi',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    },
    {
      featureType: 'transit',
      stylers: [
        {
          visibility: 'off'
        }
      ]
    }
  ];

  const getAddressFromCoordinates = async (coordinate) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (result[0]) {
        const address = [
          result[0].street,
          result[0].district,
          result[0].city,
          result[0].region,
        ]
          .filter(Boolean)  // Remove empty values
          .join(', ');
        setResolvedAddress(address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setResolvedAddress('Address not available');
    }
  };

  const handleMarkerPress = (marker) => {
    console.log('Marker pressed:', marker);
    setSelectedMarker(marker);
    setShowMarkerModal(true);
    getAddressFromCoordinates(marker.coordinate);
  };

  const handleDeleteMarker = (markerId) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this location?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMarkers(prevMarkers => {
              const newMarkers = prevMarkers.filter(m => m.id !== markerId);
              // Save markers to AsyncStorage
              saveMarkers(newMarkers);
              return newMarkers;
            });
            setShowMarkerModal(false);
            setSelectedMarker(null);
          }
        }
      ]
    );
  };

  const handleEditLocation = (marker) => {
    if (!marker) return;
    
    setLocationName(marker.name);
    setSelectedCategories(marker.categories);
    setSelectedLocation(marker.coordinate);
    setSelectedMarker(marker);
    setIsAppointmentRequired(marker.appointmentRequired || false);
    setHasAlcohol(marker.hasAlcohol || false);
    setInstagram(marker.instagram || '');
    setNotes(marker.notes || '');
    setPhoneNumber(marker.phoneNumber || '');
    setIsEditing(true);
    setShowModal(true);
    setShowMarkerModal(false);
  };

  const handleNavigate = (coordinate) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
    Linking.openURL(url);
  };

  // Add this helper function to check if phone number should be shown
  const shouldShowPhoneNumber = () => {
    return isAppointmentRequired && 
      (selectedCategories.includes('restaurant') || selectedCategories.includes('meyhane'));
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setShowModal(false);
      setIsPickingLocation(false);
      setSelectedLocation(null);
    };
  }, []);

  // Also add this useEffect to monitor modal state
  useEffect(() => {
    console.log('Modal visibility changed:', showModal);
  }, [showModal]);

  // Add these functions to save and load markers
  const saveMarkers = async (markers) => {
    try {
      const jsonValue = JSON.stringify(markers);
      await AsyncStorage.setItem('markers', jsonValue);
      console.log('Markers saved successfully:', markers.length);
    } catch (error) {
      console.error('Error saving markers:', error);
      Alert.alert(
        'Error',
        'Failed to save locations. Please try again.'
      );
    }
  };

  const loadMarkers = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('markers');
      if (jsonValue != null) {
        const parsedMarkers = JSON.parse(jsonValue);
        console.log('Loaded markers:', parsedMarkers.length);
        return parsedMarkers;
      }
      console.log('No saved markers found');
      return [];
    } catch (error) {
      console.error('Error loading markers:', error);
      Alert.alert(
        'Error',
        'Failed to load saved locations.'
      );
      return [];
    }
  };

  // Add useEffect to load markers when component mounts
  useEffect(() => {
    const loadSavedMarkers = async () => {
      try {
        const savedMarkers = await loadMarkers();
        if (Array.isArray(savedMarkers)) {
          setMarkers(savedMarkers);
          console.log('Successfully set markers:', savedMarkers.length);
        } else {
          console.error('Loaded markers is not an array:', savedMarkers);
          setMarkers([]);
        }
      } catch (error) {
        console.error('Error in loadSavedMarkers:', error);
        setMarkers([]);
      }
    };
    
    loadSavedMarkers();
  }, []);

  // Add these useEffect hooks for debugging
  useEffect(() => {
    console.log('isWaitingForMapPress:', isWaitingForMapPress);
  }, [isWaitingForMapPress]);

  useEffect(() => {
    console.log('selectedLocation:', selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    console.log('showModal:', showModal);
  }, [showModal]);

  useEffect(() => {
    console.log('isPickingLocation:', isPickingLocation);
  }, [isPickingLocation]);

  // Add this useEffect to monitor all relevant state changes
  useEffect(() => {
    console.log('State changed:', {
      isPickingLocation,
      isWaitingForMapPress,
      showModal,
      selectedLocation
    });
  }, [isPickingLocation, isWaitingForMapPress, showModal, selectedLocation]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
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
          initialRegion={mapRegion}
          onPress={handleMapPress}
          onRegionChangeComplete={setMapRegion}
          customMapStyle={customMapStyle}
        >
          {markers.map((marker) => {
            const markerStyle = getMarkerStyle(marker.categories[0]);
            return (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                onPress={() => handleMarkerPress(marker)}
              >
                <View style={styles.markerContainer}>
                  <Ionicons 
                    name={markerStyle.icon}
                    size={32}
                    color={markerStyle.color}
                    style={styles.markerIcon}
                  />
                </View>
              </Marker>
            );
          })}
          
          {selectedLocation && isPickingLocation && (
            <Marker coordinate={selectedLocation}>
              <View style={styles.markerContainer}>
                <View style={styles.selectionRing}>
                  <Ionicons 
                    name="location"
                    size={32}
                    color={theme.colors.primary}
                    style={styles.markerIcon}
                  />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        {isWaitingForMapPress && (
          <View style={styles.guidanceContainer}>
            <View style={styles.guidanceInner}>
              <Ionicons name="information-circle" size={24} color="white" />
              <Text style={styles.guidanceText}>Tap on the map to add a location</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.mapButton, styles.shadow]}
            onPress={goToCurrentLocation}
          >
            <Ionicons name="locate" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mapButton,
              styles.shadow,
              isPickingLocation && styles.activeButton
            ]}
            onPress={toggleLocationPicker}
          >
            <Ionicons 
              name="pin"
              size={24} 
              color={isPickingLocation ? theme.colors.white : theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
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

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowModal(false);
          setIsPickingLocation(false);
          setSelectedLocation(null);
        }}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <Pressable 
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {isEditing ? 'Edit Location' : 'Add Location'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Location Name Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="business" size={24} color={theme.colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Location name"
                    value={locationName}
                    onChangeText={setLocationName}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                {/* Categories Grid */}
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategories.includes(category.id) && styles.selectedCategory
                      ]}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <Ionicons
                        name={category.icon}
                        size={28}
                        color={selectedCategories.includes(category.id) 
                          ? theme.colors.white 
                          : theme.colors.primary
                        }
                      />
                      <Text style={[
                        styles.categoryLabel,
                        selectedCategories.includes(category.id) && styles.selectedCategoryLabel
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Additional Options */}
                <View style={styles.togglesContainer}>
                  <TouchableOpacity 
                    style={styles.toggleItem}
                    onPress={() => setIsAppointmentRequired(!isAppointmentRequired)}
                  >
                    <View style={styles.toggleTextContainer}>
                      <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                      <Text style={styles.toggleText}>Appointment Required</Text>
                    </View>
                    <View style={[
                      styles.toggle,
                      isAppointmentRequired && styles.toggleActive
                    ]}>
                      <View style={[
                        styles.toggleHandle,
                        isAppointmentRequired && styles.toggleHandleActive
                      ]} />
                    </View>
                  </TouchableOpacity>

                  {selectedCategories.includes('restaurant') && (
                    <TouchableOpacity 
                      style={styles.toggleItem}
                      onPress={() => setHasAlcohol(!hasAlcohol)}
                    >
                      <View style={styles.toggleTextContainer}>
                        <Ionicons name="wine" size={24} color={theme.colors.primary} />
                        <Text style={styles.toggleText}>Alcohol Available</Text>
                      </View>
                      <View style={[
                        styles.toggle,
                        hasAlcohol && styles.toggleActive
                      ]}>
                        <View style={[
                          styles.toggleHandle,
                          hasAlcohol && styles.toggleHandleActive
                        ]} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Contact Information */}
                {isAppointmentRequired && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="call" size={24} color={theme.colors.primary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Ionicons name="logo-instagram" size={24} color={theme.colors.primary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Instagram username"
                    value={instagram}
                    onChangeText={setInstagram}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                {/* Notes */}
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    (!locationName || selectedCategories.length === 0) && styles.disabledButton
                  ]}
                  onPress={handleAddLocation}
                  disabled={!locationName || selectedCategories.length === 0}
                >
                  <Text style={styles.addButtonText}>
                    {isEditing ? 'Save Changes' : 'Add Location'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showMarkerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMarkerModal(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowMarkerModal(false)}
        >
          <View style={styles.modalCard}>
            {selectedMarker && (
              <>
                {/* Name and Close Button */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMarker.name}</Text>
                  <TouchableOpacity 
                    onPress={() => setShowMarkerModal(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Address with Navigate Button */}
                <View style={styles.addressContainer}>
                  <Text style={styles.addressText}>{resolvedAddress}</Text>
                  <TouchableOpacity 
                    style={styles.navigateButton}
                    onPress={() => handleNavigate(selectedMarker.coordinate)}
                  >
                    <Ionicons name="navigate" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Simple Info List */}
                <View style={styles.infoList}>
                  {selectedMarker.phoneNumber && (
                    <TouchableOpacity 
                      style={styles.infoRow}
                      onPress={() => Linking.openURL(`tel:${selectedMarker.phoneNumber}`)}
                    >
                      <Ionicons name="call" size={24} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{selectedMarker.phoneNumber}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filterButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  selectedCategoryLabel: {
    color: theme.colors.white,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 12,
    zIndex: 999,
    elevation: 6,
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 6,
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    android: {
      elevation: 5,
    },
  }),
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  markerIcon: {
    marginBottom: -8,
    backgroundColor: 'transparent',
  },
  selectionRing: {
    padding: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  markerDetails: {
    padding: 16,
  },
  markerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categoryChipText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  togglesContainer: {
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    transform: [{ translateX: 0 }],
  },
  toggleHandleActive: {
    transform: [{ translateX: 22 }],
  },
  detailsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  navigateText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  linkText: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  guidanceContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  guidanceInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  guidanceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  featuresList: {
    gap: 12,
  },
});

export default LocationsScreen;