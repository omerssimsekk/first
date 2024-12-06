import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CATEGORIES } from '../constants/categories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const CategoryCard = ({ title, icon, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (isPressed) return; // Prevent multiple presses
    
    setIsPressed(true);
    console.log('Category pressed:', title);
    onPress();
    
    // Reset after a short delay
    setTimeout(() => {
      setIsPressed(false);
    }, 1000); // 1 second cooldown
  };
  
  return (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={handlePress}
      disabled={isPressed}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardIconContainer}>
          <Ionicons name={icon} size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const NearbyEventCard = ({ title, time, distance, image }) => (
  <TouchableOpacity style={styles.nearbyEventCard}>
    <Image source={{ uri: image }} style={styles.eventImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.nearbyEventGradient}
    >
      <View style={styles.nearbyEventContent}>
        <View style={styles.nearbyEventHeader}>
          <Ionicons name="time-outline" size={16} color="#FFFFFF" />
          <Text style={styles.nearbyEventTime}>{time}</Text>
        </View>
        <Text style={styles.nearbyEventTitle}>{title}</Text>
        <View style={styles.nearbyEventFooter}>
          <Ionicons name="location-outline" size={14} color="#FFFFFF" />
          <Text style={styles.nearbyEventDistance}>{distance}</Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1); // Return distance with 1 decimal place
};

const NearbyLocationCard = ({ location, userLocation }) => {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const updateDistance = () => {
      if (userLocation && location.latitude && location.longitude) {
        const calculatedDistance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        );
        setDistance(calculatedDistance);
      }
    };

    // Update immediately when userLocation changes
    updateDistance();

    // Set up interval to update every 30 seconds
    const intervalId = setInterval(updateDistance, 30000);

    return () => clearInterval(intervalId);
  }, [userLocation, location]);

  return (
    <TouchableOpacity style={styles.nearbyLocationCard}>
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

const ExploreScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [categories] = useState([
    { id: 'restaurant', title: 'Restaurant', icon: 'restaurant' },
    { id: 'coffee', title: 'Cafe', icon: 'cafe' },
    { id: 'bar', title: 'Bar', icon: 'beer' },
    { id: 'club', title: 'Club', icon: 'musical-notes' },
    { id: 'meyhane', title: 'Meyhane', icon: 'restaurant' },
    { id: 'localFood', title: 'LocalFood', icon: 'storefront-outline' },
  ]);
  
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused - refreshing data and location...');
      
      const loadData = async () => {
        try {
          // Get fresh user location
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.log('Location permission denied');
            return;
          }

          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          
          // Load nearby locations
          const savedMarkers = await AsyncStorage.getItem('@saved_markers');
          if (savedMarkers) {
            const allLocations = JSON.parse(savedMarkers);
            setNearbyLocations(allLocations);
            console.log('Nearby locations refreshed:', allLocations.length);
          } else {
            setNearbyLocations([]);
            console.log('No locations found');
          }
        } catch (error) {
          console.error('Error loading nearby locations:', error);
          setNearbyLocations([]);
        }
      };

      loadData();
    }, [])
  );

  // Sort locations by distance when user location changes
  const sortedNearbyLocations = React.useMemo(() => {
    if (!userLocation || !nearbyLocations.length) return nearbyLocations;

    return [...nearbyLocations].sort((a, b) => {
      const distanceA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.latitude,
        a.longitude
      );
      const distanceB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.latitude,
        b.longitude
      );
      return distanceA - distanceB;
    });
  }, [nearbyLocations, userLocation]);

  const handleCategoryPress = (category) => {
    try {
      const screenName = category.id === 'coffee' ? 'Cafe' : 
                        category.id.charAt(0).toUpperCase() + category.id.slice(1);
      navigation.navigate(screenName);
      
    } catch (error) {
      console.error('Navigation error:', error);
      // Only show alert if navigation fails
      Alert.alert(
        'Navigation Error',
        'Unable to open this category at the moment.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#111827', '#1f2937']}
        style={[styles.mainContainer, { paddingTop: insets.top }]}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Discover the City</Text>
              <Text style={styles.subtitleText}>Explore food and local experiences</Text>
            </View>
          </View>
          
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  icon={category.icon}
                  onPress={() => handleCategoryPress(category)}
                />
              ))}
            </View>
          </View>

          <View style={styles.nearbySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nearbyScrollContent}
            >
              {sortedNearbyLocations.map((location) => (
                <NearbyLocationCard 
                  key={location.id} 
                  location={location}
                  userLocation={userLocation}
                />
              ))}
            </ScrollView>
          </View>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f3f4f6',
    marginBottom: 16,
  },
  seeAllButton: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: (width - 52) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  nearbySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  nearbyScrollContent: {
    paddingRight: 20,
  },
  nearbyLocationCard: {
    width: 280,
    height: 180,
    marginRight: 16,
    borderRadius: 16,
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
    fontSize: 20,
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
});

export default ExploreScreen;
