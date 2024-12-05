import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';

const GetInfoModal = ({ visible, onClose, onSave, initialValues }) => {
  const [locationName, setLocationName] = React.useState('');
  const [locationNote, setLocationNote] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [hasAlcohol, setHasAlcohol] = React.useState(false);
  const [hasWifi, setHasWifi] = React.useState(false);
  const [instagramUsername, setInstagramUsername] = React.useState('');
  const [operatingHours, setOperatingHours] = React.useState({
    open: '',
    close: '',
  });
  const [musicTypes, setMusicTypes] = React.useState([]);

  const MUSIC_TYPES = [
    { id: 'live', label: 'Live Music' },
    { id: 'dj', label: 'DJ' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'rock', label: 'Rock' },
    { id: 'pop', label: 'Pop' },
  ];

  const handleSave = () => {
    if (!locationName.trim()) {
      return;
    }
    onSave({ 
      name: locationName, 
      note: locationNote,
      category: selectedCategory,
      hasAlcohol: selectedCategory === 'restaurant' ? hasAlcohol : undefined,
      hasWifi: hasWifi,
      instagram: instagramUsername.trim(),
      operatingHours: operatingHours.open || operatingHours.close ? operatingHours : undefined,
      musicTypes: selectedCategory === 'bar' ? musicTypes : undefined,
    });
    setLocationName('');
    setLocationNote('');
    setSelectedCategory(null);
    setHasAlcohol(false);
    setHasWifi(false);
    setInstagramUsername('');
    setOperatingHours({ open: '', close: '' });
    setMusicTypes([]);
  };

  React.useEffect(() => {
    if (visible) {
      if (initialValues) {
        setLocationName(initialValues.name);
        setLocationNote(initialValues.note);
        setSelectedCategory(initialValues.category);
        if (initialValues.hasAlcohol !== undefined) {
          setHasAlcohol(initialValues.hasAlcohol);
        } else {
          setHasAlcohol(false);
        }
        setHasWifi(initialValues.hasWifi || false);
        setInstagramUsername(initialValues.instagram || '');
        setOperatingHours(initialValues.operatingHours || { open: '', close: '' });
        setMusicTypes(initialValues.musicTypes || []);
      } else {
        setLocationName('');
        setLocationNote('');
        setSelectedCategory(null);
        setHasAlcohol(false);
        setHasWifi(false);
        setInstagramUsername('');
        setOperatingHours({ open: '', close: '' });
        setMusicTypes([]);
      }
    }
  }, [visible, initialValues]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Location</Text>
          
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location Name</Text>
                <TextInput
                  style={styles.input}
                  value={locationName}
                  onChangeText={setLocationName}
                  placeholder="Enter location name"
                  placeholderTextColor={theme.colors.text + '80'}
                />
              </View>

              <View style={styles.categoriesSection}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoriesGrid}>
                  {Object.values(CATEGORIES).map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.id && styles.categoryButtonActive,
                        selectedCategory === category.id && { borderColor: category.color }
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={24} 
                        color={category.color}
                      />
                      <Text 
                        style={[
                          styles.categoryText,
                          selectedCategory === category.id && styles.categoryTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TouchableOpacity 
                  style={[
                    styles.toggleButton,
                    hasWifi && styles.toggleButtonActive
                  ]}
                  onPress={() => setHasWifi(!hasWifi)}
                >
                  <Text style={[
                    styles.toggleButtonText,
                    hasWifi && styles.toggleButtonTextActive
                  ]}>
                    WiFi
                  </Text>
                  {hasWifi && (
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color="#FFFFFF" 
                      style={styles.checkmark}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {selectedCategory === 'restaurant' && (
                <View style={styles.inputContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton,
                      hasAlcohol && styles.toggleButtonActive
                    ]}
                    onPress={() => setHasAlcohol(!hasAlcohol)}
                  >
                    <Text style={[
                      styles.toggleButtonText,
                      hasAlcohol && styles.toggleButtonTextActive
                    ]}>
                      Alcohol
                    </Text>
                    {hasAlcohol && (
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color="#FFFFFF" 
                        style={styles.checkmark}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {selectedCategory === 'bar' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Music Types</Text>
                  <View style={styles.musicTypesContainer}>
                    {MUSIC_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.musicTypeButton,
                          musicTypes.includes(type.id) && styles.musicTypeButtonActive
                        ]}
                        onPress={() => {
                          setMusicTypes(prev => 
                            prev.includes(type.id)
                              ? prev.filter(t => t !== type.id)
                              : [...prev, type.id]
                          );
                        }}
                      >
                        <Text style={[
                          styles.musicTypeText,
                          musicTypes.includes(type.id) && styles.musicTypeTextActive
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Instagram</Text>
                <View style={styles.instagramInputContainer}>
                  <Text style={styles.atSymbol}>@</Text>
                  <TextInput
                    style={[styles.input, styles.instagramInput]}
                    value={instagramUsername}
                    onChangeText={setInstagramUsername}
                    placeholder="Instagram username"
                    placeholderTextColor={theme.colors.text + '80'}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Operating Hours</Text>
                <View style={styles.hoursContainer}>
                  <View style={styles.hourInput}>
                    <Text style={styles.hourLabel}>Opens</Text>
                    <TextInput
                      style={[styles.input, styles.timeInput]}
                      value={operatingHours.open}
                      onChangeText={(text) => setOperatingHours(prev => ({ ...prev, open: text }))}
                      placeholder="10:00"
                      placeholderTextColor={theme.colors.text + '80'}
                    />
                  </View>
                  <Text style={styles.hoursSeparator}>-</Text>
                  <View style={styles.hourInput}>
                    <Text style={styles.hourLabel}>Closes</Text>
                    <TextInput
                      style={[styles.input, styles.timeInput]}
                      value={operatingHours.close}
                      onChangeText={(text) => setOperatingHours(prev => ({ ...prev, close: text }))}
                      placeholder="22:00"
                      placeholderTextColor={theme.colors.text + '80'}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={locationNote}
                  onChangeText={setLocationNote}
                  placeholder="Add notes about this location"
                  placeholderTextColor={theme.colors.text + '80'}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    width: '100%',
  },
  formContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
    backgroundColor: theme.colors.surface,
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  categoryButton: {
    width: '30%', // Approximately 3 buttons per row
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryButtonActive: {
    borderWidth: 2,
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  checkmark: {
    marginLeft: 8,
  },
  instagramInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    fontSize: 16,
    color: theme.colors.text,
    marginRight: 8,
  },
  instagramInput: {
    flex: 1,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hourInput: {
    flex: 1,
  },
  hourLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  timeInput: {
    textAlign: 'center',
  },
  hoursSeparator: {
    fontSize: 20,
    color: theme.colors.text,
    marginHorizontal: 12,
    marginTop: 20,
  },
  musicTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginTop: 8,
  },
  musicTypeButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  musicTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  musicTypeText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  musicTypeTextActive: {
    color: '#FFFFFF',
  },
});

export default GetInfoModal; 