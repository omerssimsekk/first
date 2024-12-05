import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const EventCard = ({ title, date, time, location, category, attendees }) => (
  <TouchableOpacity style={styles.eventCard}>
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.eventGradient}
    >
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{category}</Text>
      </View>
      
      <Text style={styles.eventTitle}>{title}</Text>
      
      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.text} />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text} />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.text} />
          <Text style={styles.detailText}>{location}</Text>
        </View>
      </View>
      
      <View style={styles.attendeesSection}>
        <Text style={styles.attendeesText}>{attendees} attending</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const EventsScreen = () => {
  const insets = useSafeAreaInsets();
  const [events] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={[styles.mainContainer, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Events</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.eventsScroll}
          contentContainerStyle={styles.eventsContainer}
          showsVerticalScrollIndicator={false}
        >
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsScroll: {
    flex: 1,
  },
  eventsContainer: {
    padding: 20,
  },
  eventCard: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  eventGradient: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  categoryText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  attendeesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  attendeesText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default EventsScreen;
