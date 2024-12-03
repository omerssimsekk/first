import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ProfileOption = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress}>
    <View style={styles.optionIcon}>
      <Ionicons name={icon} size={24} color={theme.colors.primary} />
    </View>
    <View style={styles.optionContent}>
      <Text style={styles.optionTitle}>{title}</Text>
      {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const { currentCity, updateCity } = useLocation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      loadLocationInfo();
    }, [])
  );

  const loadLocationInfo = async () => {
    try {
      const locationStr = await AsyncStorage.getItem('userLocation');
      if (locationStr) {
        const location = JSON.parse(locationStr);
        if (location.placeInfo && location.placeInfo.city) {
          updateCity(location.placeInfo.city || location.placeInfo.region || 'Unknown Location');
        } else {
          const response = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          
          if (response[0]) {
            updateCity(response[0].city || response[0].region || 'Unknown Location');
          }
        }
      }
    } catch (error) {
      console.error('Error loading location info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.profileName}>{userInfo?.name || 'User'}</Text>
          <Text style={styles.profileLocation}>{currentCity}</Text>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <ProfileOption
            icon="location"
            title="Current Location"
            subtitle={currentCity}
            onPress={() => navigation.navigate('LocationPicker')}
          />
          <ProfileOption
            icon="person-outline"
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <ProfileOption
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <ProfileOption
            icon="notifications-outline"
            title="Notifications"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <ProfileOption
            icon="settings-outline"
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
          <ProfileOption
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    margin: 16,
    ...theme.shadows.medium,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  optionsContainer: {
    padding: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default ProfileScreen;
