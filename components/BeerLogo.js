import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BeerLogo = () => {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="beer" size={40} color="#D4B483" />
      </View>
      <Text style={styles.brandName}>CRAFTBREW</Text>
      <Text style={styles.tagline}>Premium Beer Society</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 24,
    color: '#D4B483',
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#8B7355',
    letterSpacing: 1,
  },
});

export default BeerLogo;
