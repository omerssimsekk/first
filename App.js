import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import InitialLocationScreen from './src/screens/InitialLocationScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import LocationsScreen from './src/screens/LocationsScreen';
import EventsScreen from './src/screens/EventsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import BarScreen from './src/screens/BarScreen';
import CafeScreen from './src/screens/CafeScreen';
import ClubScreen from './src/screens/ClubScreen';
import MeyhaneScreen from './src/screens/MeyhaneScreen';
import LocalFoodScreen from './src/screens/LocalFoodScreen';

// Theme
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();

const ExploreStackNavigator = () => {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} />
      <ExploreStack.Screen name="Restaurant" component={RestaurantScreen} />
      <ExploreStack.Screen name="Bar" component={BarScreen} />
      <ExploreStack.Screen name="Cafe" component={CafeScreen} />
      <ExploreStack.Screen name="Club" component={ClubScreen} />
      <ExploreStack.Screen name="Meyhane" component={MeyhaneScreen} />
      <ExploreStack.Screen name="LocalFood" component={LocalFoodScreen} />
    </ExploreStack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Locations':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explore" component={ExploreStackNavigator} />
      <Tab.Screen name="Locations" component={LocationsScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Login"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="InitialLocation" component={InitialLocationScreen} />
              <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen name="Bar" component={BarScreen} />
              <Stack.Screen name="Restaurant" component={RestaurantScreen} />
              <Stack.Screen name="Cafe" component={CafeScreen} />
              <Stack.Screen name="Club" component={ClubScreen} />
              <Stack.Screen name="Meyhane" component={MeyhaneScreen} />
              <Stack.Screen name="LocalFood" component={LocalFoodScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}