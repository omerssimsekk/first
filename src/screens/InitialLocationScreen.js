import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CommonActions } from '@react-navigation/native';
import { theme } from '../theme/theme';
import MapView, { Marker } from 'react-native-maps';

const InitialLocationScreen = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });

  const cityData = {
    'Adana': { postalCode: '01', latitude: 36.9908, longitude: 35.3266 },
    'Adıyaman': { postalCode: '02', latitude: 37.7648, longitude: 38.2786 },
    'Afyonkarahisar': { postalCode: '03', latitude: 38.7589, longitude: 30.5431 },
    'Ağrı': { postalCode: '04', latitude: 39.7167, longitude: 43.0500 },
    'Amasya': { postalCode: '05', latitude: 40.6667, longitude: 35.8333 },
    'Ankara': { postalCode: '06', latitude: 39.9208, longitude: 32.8541 },
    'Antalya': { postalCode: '07', latitude: 36.8969, longitude: 30.7133 },
    'Artvin': { postalCode: '08', latitude: 41.1833, longitude: 41.8167 },
    'Aydın': { postalCode: '09', latitude: 37.8500, longitude: 27.8500 },
    'Balıkesir': { postalCode: '10', latitude: 39.6484, longitude: 27.8851 },
    'Bilecik': { postalCode: '11', latitude: 40.0500, longitude: 29.9667 },
    'Bingöl': { postalCode: '12', latitude: 38.8853, longitude: 40.4900 },
    'Bitlis': { postalCode: '13', latitude: 38.4025, longitude: 42.1167 },
    'Bolu': { postalCode: '14', latitude: 40.7333, longitude: 31.6167 },
    'Burdur': { postalCode: '15', latitude: 37.7167, longitude: 30.2833 },
    'Bursa': { postalCode: '16', latitude: 40.1833, longitude: 29.0667 },
    'Çanakkale': { postalCode: '17', latitude: 40.1553, longitude: 26.4142 },
    'Çankırı': { postalCode: '18', latitude: 40.6000, longitude: 33.6167 },
    'Çorum': { postalCode: '19', latitude: 40.5500, longitude: 34.9500 },
    'Denizli': { postalCode: '20', latitude: 37.7667, longitude: 29.0857 },
    'Diyarbakır': { postalCode: '21', latitude: 37.9167, longitude: 40.2167 },
    'Edirne': { postalCode: '22', latitude: 41.6667, longitude: 26.5667 },
    'Elazığ': { postalCode: '23', latitude: 38.6667, longitude: 39.2167 },
    'Erzincan': { postalCode: '24', latitude: 39.7500, longitude: 39.5000 },
    'Erzurum': { postalCode: '25', latitude: 39.9167, longitude: 41.2667 },
    'Eskişehir': { postalCode: '26', latitude: 39.7667, longitude: 30.5256 },
    'Gaziantep': { postalCode: '27', latitude: 37.0667, longitude: 37.3833 },
    'Giresun': { postalCode: '28', latitude: 40.9167, longitude: 38.3833 },
    'Gümüşhane': { postalCode: '29', latitude: 40.4600, longitude: 39.4833 },
    'Hakkari': { postalCode: '30', latitude: 37.5833, longitude: 43.7333 },
    'Hatay': { postalCode: '31', latitude: 36.4074, longitude: 36.3499 },
    'Isparta': { postalCode: '32', latitude: 37.7667, longitude: 30.5556 },
    'Mersin': { postalCode: '33', latitude: 36.8000, longitude: 34.6333 },
    'İstanbul': { postalCode: '34', latitude: 41.0082, longitude: 28.9784 },
    'İzmir': { postalCode: '35', latitude: 38.4192, longitude: 27.1287 },
    'Kars': { postalCode: '36', latitude: 40.6167, longitude: 43.1000 },
    'Kastamonu': { postalCode: '37', latitude: 41.3881, longitude: 33.7828 },
    'Kayseri': { postalCode: '38', latitude: 38.7333, longitude: 35.4833 },
    'Kırklareli': { postalCode: '39', latitude: 41.7333, longitude: 27.2167 },
    'Kırşehir': { postalCode: '40', latitude: 39.1500, longitude: 34.1667 },
    'Kocaeli': { postalCode: '41', latitude: 40.7667, longitude: 29.9167 },
    'Konya': { postalCode: '42', latitude: 37.8667, longitude: 32.4833 },
    'Kütahya': { postalCode: '43', latitude: 39.4167, longitude: 29.9833 },
    'Malatya': { postalCode: '44', latitude: 38.3553, longitude: 38.3161 },
    'Manisa': { postalCode: '45', latitude: 38.6167, longitude: 27.4167 },
    'Kahramanmaraş': { postalCode: '46', latitude: 37.5833, longitude: 36.9333 },
    'Mardin': { postalCode: '47', latitude: 37.3167, longitude: 40.7333 },
    'Muğla': { postalCode: '48', latitude: 37.2167, longitude: 28.3667 },
    'Muş': { postalCode: '49', latitude: 38.7500, longitude: 41.5000 },
    'Nevşehir': { postalCode: '50', latitude: 38.6333, longitude: 34.7167 },
    'Niğde': { postalCode: '51', latitude: 37.9667, longitude: 34.6833 },
    'Ordu': { postalCode: '52', latitude: 40.9833, longitude: 37.8833 },
    'Rize': { postalCode: '53', latitude: 41.0200, longitude: 40.5236 },
    'Sakarya': { postalCode: '54', latitude: 40.7667, longitude: 30.4167 },
    'Samsun': { postalCode: '55', latitude: 41.2867, longitude: 36.3300 },
    'Siirt': { postalCode: '56', latitude: 37.9333, longitude: 41.9500 },
    'Sinop': { postalCode: '57', latitude: 42.0333, longitude: 35.1500 },
    'Sivas': { postalCode: '58', latitude: 39.7500, longitude: 37.0167 },
    'Tekirdağ': { postalCode: '59', latitude: 40.9833, longitude: 27.5167 },
    'Tokat': { postalCode: '60', latitude: 40.3167, longitude: 36.5500 },
    'Trabzon': { postalCode: '61', latitude: 41.0082, longitude: 39.7167 },
    'Tunceli': { postalCode: '62', latitude: 39.1500, longitude: 39.5500 },
    'Şanlıurfa': { postalCode: '63', latitude: 37.1667, longitude: 38.7833 },
    'Uşak': { postalCode: '64', latitude: 38.6833, longitude: 29.4167 },
    'Van': { postalCode: '65', latitude: 38.5000, longitude: 43.3833 },
    'Yozgat': { postalCode: '66', latitude: 39.8167, longitude: 34.8167 },
    'Zonguldak': { postalCode: '67', latitude: 41.4500, longitude: 31.8167 },
    'Aksaray': { postalCode: '68', latitude: 38.3667, longitude: 34.0667 },
    'Bayburt': { postalCode: '69', latitude: 40.2600, longitude: 40.2333 },
    'Karaman': { postalCode: '70', latitude: 37.1833, longitude: 33.2167 },
    'Kırıkkale': { postalCode: '71', latitude: 39.8500, longitude: 33.5167 },
    'Batman': { postalCode: '72', latitude: 37.8833, longitude: 41.1333 },
    'Şırnak': { postalCode: '73', latitude: 37.4167, longitude: 42.4667 },
    'Bartın': { postalCode: '74', latitude: 41.6367, longitude: 32.3333 },
    'Ardahan': { postalCode: '75', latitude: 41.1167, longitude: 42.7000 },
    'Iğdır': { postalCode: '76', latitude: 39.9167, longitude: 44.0333 },
    'Yalova': { postalCode: '77', latitude: 40.6500, longitude: 29.2667 },
    'Karabük': { postalCode: '78', latitude: 41.2000, longitude: 32.6333 },
    'Kilis': { postalCode: '79', latitude: 36.7167, longitude: 37.1167 },
    'Osmaniye': { postalCode: '80', latitude: 37.0667, longitude: 36.2500 },
    'Düzce': { postalCode: '81', latitude: 40.8333, longitude: 31.1667 }
  };

  const turkishCities = Object.entries(cityData)
    .sort(([, a], [, b]) => parseInt(a.postalCode) - parseInt(b.postalCode))
    .map(([city]) => city);

  useEffect(() => {
    setFilteredCities(turkishCities);
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      loadSavedLocation();
    } catch (error) {
      console.error('Error initializing location:', error);
      setLoading(false);
    }
  };

  const loadSavedLocation = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        setSelectedLocation(location);
        setMapRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        });
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredCities(turkishCities);
      return;
    }
    
    const normalizeText = (str) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ıİ]/g, 'i')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[üÜ]/g, 'u')
        .replace(/[şŞ]/g, 's')
        .replace(/[öÖ]/g, 'o')
        .replace(/[çÇ]/g, 'c');
    };

    const searchText = text.toLowerCase();
    const filtered = turkishCities.filter(city => 
      city.toLowerCase().includes(searchText)
    );
    
    setFilteredCities(filtered);
  };

  const handleCitySelect = async (city) => {
    try {
      setLoading(true);
      const { latitude, longitude, postalCode } = cityData[city];
      
      const locationData = {
        latitude,
        longitude,
        placeInfo: { city, postalCode },
        city
      };

      setSelectedLocation(locationData);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });

      await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
    } catch (error) {
      console.error('Error selecting city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      return;
    }

    try {
      await AsyncStorage.setItem('userLocation', JSON.stringify(selectedLocation));
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  if (loading && !searchQuery) {
    return (
      <View style={[styles.safeContainer, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Choose Your City</Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Şehir ara..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={theme.colors.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={50}
              keyboardType="default"
              textContentType="none"
              autoComplete="off"
              contextMenuHidden={false}
              textAlignVertical="center"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilteredCities(turkishCities);
                }}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.listContainer}>
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    selectedLocation?.city === item && styles.selectedCityItem
                  ]}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={styles.postalCode}>{cityData[item].postalCode}</Text>
                  <Text style={[
                    styles.cityText,
                    selectedLocation?.city === item && styles.selectedCityText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.citiesList}
              keyboardShouldPersistTaps="handled"
            />
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={mapRegion}
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
        </View>

        {selectedLocation && (
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    flex: 1,
    maxWidth: '40%',
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  citiesList: {
    flex: 1,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedCityItem: {
    backgroundColor: theme.colors.primaryLight,
  },
  postalCode: {
    width: 30,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  cityText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedCityText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1.5,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InitialLocationScreen;
