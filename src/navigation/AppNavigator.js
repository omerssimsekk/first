import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import InitialLocationScreen from '../screens/InitialLocationScreen';
import MainNavigator from './MainNavigator';
import BarScreen from '../screens/BarScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import CafeScreen from '../screens/CafeScreen';
import ClubScreen from '../screens/ClubScreen';
import MeyhaneScreen from '../screens/MeyhaneScreen';
import LocalFoodScreen from '../screens/LocalFoodScreen';
import { theme } from '../theme/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
        initialRouteName="Main"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="InitialLocation" component={InitialLocationScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="Bar" component={BarScreen} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        <Stack.Screen name="Cafe" component={CafeScreen} />
        <Stack.Screen name="Club" component={ClubScreen} />
        <Stack.Screen name="Meyhane" component={MeyhaneScreen} />
        <Stack.Screen name="LocalFood" component={LocalFoodScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;