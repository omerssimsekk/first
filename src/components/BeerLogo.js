import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BeerLogo = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="beer" size={64} color="#D4B483" />
      <Text style={styles.title}>CraftBrew</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4B483',
    marginTop: 10,
  },
});

export default BeerLogo;
