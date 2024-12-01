import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CountryCodePicker from '../components/CountryCodePicker';
import AnimatedBackground from '../components/AnimatedBackground';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+90');

  const handleRegister = () => {
    if (!name || !surname || !email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Mock successful registration
    Alert.alert(
      'Success',
      'Registration successful! Please login.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AnimatedBackground />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          entering={FadeIn.duration(1000)}
          style={styles.formContainer}
        >
          <Animated.Text 
            entering={FadeInDown.duration(1000).delay(300)}
            style={styles.title}
          >
            Create Account
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(1000).delay(400)}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(500)}>
            <TextInput
              style={styles.input}
              placeholder="Surname"
              value={surname}
              onChangeText={setSurname}
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(600)}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(700)}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(800)} style={styles.phoneContainer}>
            <CountryCodePicker
              selectedValue={selectedCountryCode}
              onValueChange={(value) => setSelectedCountryCode(value)}
            />
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(900)}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(1000)}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#94A3B8"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(1100)}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(1000).delay(1200)}>
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account? Login here
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  formContainer: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 30,
    textAlign: 'center',
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1a237e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#1a237e',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    color: '#1a237e',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RegisterScreen;
