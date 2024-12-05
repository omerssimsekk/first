import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';

const MUSIC_TYPES = [
  { id: 'live', label: 'Live Music' },
  { id: 'dj', label: 'DJ' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'rock', label: 'Rock' },
  { id: 'pop', label: 'Pop' },
];

const InfoModal = ({ visible, onClose, location, onDelete, onEdit }) => {
  console.log('InfoModal location data:', location);
  console.log('Music Types:', location?.musicTypes);
  const category = location?.category ? CATEGORIES[location.category] : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={[
            styles.locationIcon,
            category && { borderColor: category.color }
          ]}>
            <Ionicons 
              name={category?.icon || 'location'} 
              size={32} 
              color={category?.color || theme.colors.primary} 
            />
          </View>

          <Text style={styles.locationName}>{location?.name}</Text>
          
          {category && (
            <Text style={[styles.categoryText, { color: category.color }]}>
              {category.name}
            </Text>
          )}

          {location?.hasWifi && (
            <View style={styles.wifiContainer}>
              <Ionicons name="wifi" size={20} color={theme.colors.text} />
              <Text style={styles.wifiText}>WiFi Available</Text>
            </View>
          )}

          {location?.category === 'bar' && location?.musicTypes?.length > 0 && (
            <View style={styles.musicTypesContainer}>
              <Ionicons name="musical-notes" size={20} color={theme.colors.text} />
              <Text style={styles.musicTypesText}>
                {location.musicTypes.map(type => {
                  const musicType = MUSIC_TYPES.find(t => t.id === type);
                  return musicType?.label;
                }).join(', ')}
              </Text>
            </View>
          )}

          {location?.category === 'restaurant' && location?.hasAlcohol && (
            <View style={styles.alcoholContainer}>
              <Ionicons name="wine" size={20} color={theme.colors.text} />
              <Text style={styles.alcoholText}>Serves Alcohol</Text>
            </View>
          )}

          {location?.instagram && (
            <TouchableOpacity 
              style={styles.instagramContainer}
              onPress={() => Linking.openURL(`https://instagram.com/${location.instagram}`)}
            >
              <Ionicons name="logo-instagram" size={20} color={theme.colors.text} />
              <Text style={styles.instagramText}>@{location.instagram}</Text>
            </TouchableOpacity>
          )}

          {location?.operatingHours?.open && location?.operatingHours?.close && (
            <View style={styles.hoursContainer}>
              <Ionicons name="time" size={20} color={theme.colors.text} />
              <Text style={styles.hoursText}>
                {location.operatingHours.open} - {location.operatingHours.close}
              </Text>
            </View>
          )}

          {location?.note && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Notes</Text>
              <Text style={styles.noteText}>{location.note}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                onEdit(location);
                onClose();
              }}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                onDelete(location.id);
                onClose();
              }}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Delete</Text>
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
    maxHeight: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  locationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  locationName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  noteContainer: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error || '#DC3545',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  alcoholContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  alcoholText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  instagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  instagramText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  hoursText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  wifiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  wifiText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  musicTypesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    marginBottom: 16,
  },
  musicTypesText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default InfoModal; 