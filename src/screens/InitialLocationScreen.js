import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../context/LocationContext';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TURKISH_CITIES = [
  { name: 'Adana', latitude: 37.0000, longitude: 35.3213 },
  { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Izmir', latitude: 38.4237, longitude: 27.1428 },
  { name: 'Antalya', latitude: 36.8969, longitude: 30.7133 },
  { name: 'Bursa', latitude: 40.1885, longitude: 29.0610 },
  { name: 'Konya', latitude: 37.8719, longitude: 32.4843 },
  { name: 'Gaziantep', latitude: 37.0662, longitude: 37.3833 },
  { name: 'Mersin', latitude: 36.8121, longitude: 34.6339 },
  { name: 'Diyarbakır', latitude: 37.9144, longitude: 40.2306 },
  { name: 'Eskişehir', latitude: 39.7767, longitude: 30.5206 },
  { name: 'Samsun', latitude: 41.2867, longitude: 36.3300 },
  { name: 'Denizli', latitude: 37.7765, longitude: 29.0864 },
  { name: 'Trabzon', latitude: 41.0027, longitude: 39.7168 },
  { name: 'Erzurum', latitude: 39.9055, longitude: 41.2658 }
];

const InitialLocationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { updateLocation } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleCitySelect = async (city) => {
    try {
      const locationData = {
        latitude: city.latitude,
        longitude: city.longitude,
        placeInfo: {
          city: city.name,
          region: 'Turkey'
        }
      };

      await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
      await updateLocation(locationData);
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Error', 'Failed to save location. Please try again.');
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please grant location permissions to use this feature.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const placeInfo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        placeInfo: placeInfo[0]
      };

      await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
      await updateLocation(locationData);
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCitySelect(item)}
    >
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cityGradient}
      >
        <Text style={styles.cityName}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={[styles.mainContainer, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Location</Text>
          <Text style={styles.headerSubtitle}>Select your city to get started</Text>
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentLocationGradient}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <>
                <Ionicons name="locate" size={24} color={theme.colors.text} />
                <Text style={styles.currentLocationText}>Use Current Location</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <FlatList
          data={TURKISH_CITIES}
          renderItem={renderCityItem}
          keyExtractor={item => item.name}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  currentLocationButton: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  currentLocationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  currentLocationText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  listContent: {
    padding: 20,
  },
  cityItem: {
    marginBottom: 12,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cityName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InitialLocationScreen;
