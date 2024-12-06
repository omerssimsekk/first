import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import ExploreScreen from '../screens/ExploreScreen';
import BarScreen from '../screens/BarScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CafeScreen from '../screens/CafeScreen';
import ClubScreen from '../screens/ClubScreen';
import MeyhaneScreen from '../screens/MeyhaneScreen';
import LocalFoodScreen from '../screens/LocalFoodScreen';
import { theme } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ExploreStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ExploreHome"
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="ExploreHome" component={ExploreScreen} />
      <Stack.Screen 
        name="Bar" 
        component={BarScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Restaurant" 
        component={RestaurantScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Cafe" 
        component={CafeScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Club" 
        component={ClubScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="Meyhane" 
        component={MeyhaneScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="LocalFood" 
        component={LocalFoodScreen}
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: 60,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopColor: 'transparent',
        },
        tabBarItemStyle: {
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;