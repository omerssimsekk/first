import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocations } from '../hooks/useLocations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Location from 'expo-location';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1);
};

const LocationCard = ({ location }) => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  const isValidLocation = location && location.name && location.category;
  
  if (!isValidLocation) return null;

  const showTooltip = (type) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    setActiveTooltip(type);
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const renderTooltip = (message) => {
    if (!message) return null;
    return (
      <Animated.View 
        entering={FadeIn.duration(200)} 
        exiting={FadeOut.duration(200)} 
        style={styles.tooltip}
      >
        <Text style={styles.tooltipText}>{message}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.locationCard}>
      <View style={styles.imageContainer}>
        {location.image ? (
          <Image 
            source={{ uri: location.image }} 
            style={styles.locationImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons 
              name={location.category === 'bar' ? 'beer-outline' : 
                    location.category === 'restaurant' ? 'restaurant-outline' :
                    location.category === 'coffee' ? 'cafe-outline' :
                    location.category === 'club' ? 'musical-notes-outline' :
                    'image-outline'} 
              size={40} 
              color="#666" 
            />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.locationName}>{location.name}</Text>

        {location.note && (
          <Text style={styles.noteText}>{location.note}</Text>
        )}

        {location.operatingHours && (location.operatingHours.open || location.operatingHours.close) && (
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={16} color="#9ca3af" />
            <Text style={styles.hoursText}>
              {location.operatingHours.open} - {location.operatingHours.close}
            </Text>
          </View>
        )}

        <View style={styles.bottomSection}>
          <View style={styles.featuresContainer}>
            {location.hasWifi && (
              <TouchableOpacity 
                style={styles.featureIcon}
                onPress={() => showTooltip('wifi')}
              >
                <Ionicons name="wifi" size={16} color="#9ca3af" />
                {activeTooltip === 'wifi' && renderTooltip('WiFi')}
              </TouchableOpacity>
            )}
            {location.instagram && (
              <TouchableOpacity 
                style={styles.featureIcon}
                onPress={() => showTooltip('instagram')}
              >
                <Ionicons name="logo-instagram" size={16} color="#9ca3af" />
                {activeTooltip === 'instagram' && renderTooltip(`@${location.instagram}`)}
              </TouchableOpacity>
            )}
            {location.hasAlcohol && (
              <TouchableOpacity 
                style={styles.featureIcon}
                onPress={() => showTooltip('alcohol')}
              >
                <Ionicons name="wine" size={16} color="#9ca3af" />
                {activeTooltip === 'alcohol' && renderTooltip('Alcohol')}
              </TouchableOpacity>
            )}
          </View>

          {location.musicTypes && location.musicTypes.length > 0 && (
            <View style={styles.tagsContainer}>
              {location.musicTypes.map((type, index) => (
                <Text key={index} style={styles.tag}>{type}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const NearbyLocationCard = ({ location }) => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getUserLocation();
  }, []);

  const distance = userLocation && location.latitude && location.longitude ? 
    calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    ) : null;

  return (
    <TouchableOpacity style={styles.nearbyCard}>
      <View style={styles.nearbyImageContainer}>
        {location.image ? (
          <Image 
            source={{ uri: location.image }} 
            style={styles.nearbyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.nearbyPlaceholder}>
            <Ionicons 
              name={location.category === 'bar' ? 'beer-outline' : 
                    location.category === 'restaurant' ? 'restaurant-outline' :
                    location.category === 'coffee' ? 'cafe-outline' :
                    location.category === 'club' ? 'musical-notes-outline' :
                    'image-outline'} 
              size={32} 
              color="#666" 
            />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.nearbyGradient}
        >
          <Text style={styles.nearbyName}>{location.name}</Text>
          <View style={styles.nearbyDetails}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.nearbyDistance}>
              {distance ? `${distance} km away` : 'Calculating...'}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const CategoryScreen = ({ category, title, icon }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { locations, loading } = useLocations(category);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#111827', '#1f2937']}
        style={[styles.mainContainer, { paddingTop: insets.top }]}
      >
        <TouchableOpacity 
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{title}</Text>

          {locations.length > 0 && (
            <View style={styles.nearbySection}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyScrollContent}
              >
                {locations.map((location) => (
                  <NearbyLocationCard key={location.id} location={location} />
                ))}
              </ScrollView>
            </View>
          )}
          
          {loading ? (
            <ActivityIndicator size="large" color="#60a5fa" style={styles.loader} />
          ) : locations.length > 0 ? (
            <View style={styles.locationsContainer}>
              <Text style={styles.sectionTitle}>All {title}</Text>
              {locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name={icon} size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No {title.toLowerCase()} saved yet</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 20,
    marginTop: 60,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
    height: 140,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
    height: '100%',
    backgroundColor: '#374151',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  locationImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 4,
  },
  bottomSection: {
    flexDirection: 'column',
    gap: 8,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    color: '#9ca3af',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  locationsContainer: {
    marginTop: 0,
  },
  tooltip: {
    position: 'absolute',
    bottom: 30,
    left: -20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
  tooltipArrow: {
    display: 'none',
  },
  nearbySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f3f4f6',
    marginBottom: 16,
  },
  nearbyScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 36,
  },
  nearbyCard: {
    width: 240,
    height: 160,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#374151',
  },
  nearbyImageContainer: {
    width: '100%',
    height: '100%',
  },
  nearbyImage: {
    width: '100%',
    height: '100%',
  },
  nearbyPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  nearbyGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  nearbyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  nearbyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyDistance: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  noteText: {
    color: '#f3f4f6',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  hoursText: {
    color: '#f3f4f6',
    fontSize: 14,
  },
});

export default CategoryScreen; 