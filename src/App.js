import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './theme/ThemeContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <AppNavigator />
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;