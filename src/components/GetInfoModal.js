import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';

const GetInfoModal = ({ visible, onClose, onSave, initialValues }) => {
  const [locationName, setLocationName] = React.useState('');
  const [locationNote, setLocationNote] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const handleSave = () => {
    if (!locationName.trim()) {
      return;
    }
    onSave({ 
      name: locationName, 
      note: locationNote,
      category: selectedCategory 
    });
    setLocationName('');
    setLocationNote('');
    setSelectedCategory(null);
  };

  React.useEffect(() => {
    if (visible) {
      if (initialValues) {
        setLocationName(initialValues.name);
        setLocationNote(initialValues.note);
        setSelectedCategory(initialValues.category);
      } else {
        setLocationName('');
        setLocationNote('');
        setSelectedCategory(null);
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Location</Text>

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
      </View>
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
});

export default GetInfoModal; 