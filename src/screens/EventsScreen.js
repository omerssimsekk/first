import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EventCard = ({ title, date, time, location, category }) => (
  <TouchableOpacity style={styles.eventCard}>
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.eventGradient}
    >
      <View style={styles.eventContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Text style={styles.eventTitle}>{title}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const EventsScreen = () => {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="calendar" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            time={event.time}
            location={event.location}
            category={event.category}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterButton: {
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  eventGradient: {
    borderRadius: theme.borderRadius.md,
  },
  eventContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default EventsScreen;
