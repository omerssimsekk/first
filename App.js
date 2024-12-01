import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import InitialLocationScreen from './src/screens/InitialLocationScreen';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="InitialLocation" component={InitialLocationScreen} />
                <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </LocationProvider>
    </AuthProvider>
  );
}