import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = () => {
  return (
    <View style={styles.container}>
      <View style={styles.gradient} />
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A237E',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
});

export default AnimatedBackground;
