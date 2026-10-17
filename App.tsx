import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CalendarDays,
  Compass,
  House,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { BottomTab, Button, ScreenHeader } from './src/components';
import {
  categories,
  initialBookings,
  mentors,
  timeSlots,
  weekdays,
  type Booking,
  type Mentor,
} from './src/data';
import { colors, spacing } from './src/theme';
import { ScreenContent, type ScreenName } from './src/Screens';

type StackEntry = { screen: ScreenName; mentorId?: string };

const tabs: { label: string; screen: ScreenName; Icon: LucideIcon }[] = [
  { label: 'Home', screen: 'home', Icon: House },
  { label: 'Explore', screen: 'explore', Icon: Compass },
  { label: 'Bookings', screen: 'bookings', Icon: CalendarDays },
  { label: 'Profile', screen: 'profile', Icon: UserRound },
];
const skillFilterNames = ['Technology', 'Business', 'Marketing', 'Finance', 'Design', 'Career', 'Leadership'];

export default function App() {
  const [stack, setStack] = useState<StackEntry[]>([{ screen: 'welcome' }]);
  const [role, setRole] = useState<'learner' | 'mentor'>('learner');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Technology']);
  const [priceFilter, setPriceFilter] = useState('Any price');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>(['amara-okafor']);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedDate, setSelectedDate] = useState(2);
  const [selectedTime, setSelectedTime] = useState(timeSlots[2]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notificationTab, setNotificationTab] = useState('All');
  const [activeBookingsTab, setActiveBookingsTab] = useState('Upcoming');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activePriceFilter, setActivePriceFilter] = useState('Any price');
  const [activeAvailableOnly, setActiveAvailableOnly] = useState(false);
  const [filterRating, setFilterRating] = useState('Any');
  const [activeRating, setActiveRating] = useState('Any');
  const [requests, setRequests] = useState(['booking-request-2', 'booking-request-3']);
  const [availability, setAvailability] = useState([true, true, false, true, false, true, true]);
  const [mutedNotifications, setMutedNotifications] = useState(false);

  const current = stack[stack.length - 1];
  const screen = current.screen;
  const selectedMentor: Mentor =
    mentors.find((mentor) => mentor.id === current.mentorId) ?? mentors[0];
  const filteredMentors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mentors.filter((mentor) => {
      const matchesQuery =
        !normalizedQuery ||
        `${mentor.name} ${mentor.role} ${mentor.skills.join(' ')}`.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        category === 'All' ||
        mentor.skills.some((skill) => skill.toLowerCase().includes(category.toLowerCase())) ||
        mentor.role.toLowerCase().includes(category.toLowerCase());
      const skillMatches: Record<string, string[]> = {
        'Product strategy': ['Product'],
        'UX research': ['Design'],
        Startups: ['Business'],
      };
      const selectedSkills = activeFilters.flatMap((filter) =>
        skillFilterNames.includes(filter) ? [filter] : skillMatches[filter] ?? [],
      );
      const matchesSkills = selectedSkills.length === 0 || mentor.skills.some((skill) => selectedSkills.includes(skill));
      const matchesPrice =
        activePriceFilter === 'Any price' ||
        (activePriceFilter === '$20–$50' && mentor.price >= 20 && mentor.price <= 50) ||
        (activePriceFilter === '$50–$80' && mentor.price >= 50 && mentor.price <= 80);
      const matchesRating = activeRating === 'Any' || mentor.rating >= Number(activeRating.replace('+', ''));
      const matchesAvailability = !activeAvailableOnly || mentor.availableThisWeek;
      const matchesFilters =
        screen !== 'explore' || (matchesSkills && matchesPrice && matchesRating && matchesAvailability);
      return matchesQuery && matchesCategory && matchesFilters;
    });
  }, [activeAvailableOnly, activeFilters, activePriceFilter, activeRating, category, query, screen]);

  const navigate = (next: ScreenName, mentorId?: string) => {
    if (['welcome', 'home', 'mentorDashboard'].includes(next)) {
      setStack([{ screen: next, mentorId }]);
      return;
    }
    setStack((items) => [...items, { screen: next, mentorId }]);
  };
  const back = () => {
    setStack((items) => (items.length > 1 ? items.slice(0, -1) : items));
  };
  const selectTab = (next: ScreenName) => {
    const destination = role === 'mentor' && next === 'home' ? 'mentorDashboard' : next;
    setStack([{ screen: destination }]);
  };
  const toggleLike = (id: string) => {
    setLikedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  };
  const makeBooking = () => {
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      mentorId: selectedMentor.id,
      date: `${weekdays[selectedDate].day}, ${weekdays[selectedDate].date} May`,
      time: selectedTime,
      status: 'Upcoming',
      topic: 'Career consultation',
    };
    setBookings((currentBookings) => [newBooking, ...currentBookings]);
    navigate('confirmed', selectedMentor.id);
  };

  const showTabs = !['welcome', 'auth', 'choosePath'].includes(screen);
  const tabScreen = screen === 'likedProfiles' ? 'profile' : screen;
  const selectedTab =
    (role === 'mentor' && ['mentorDashboard', 'availability', 'requests', 'earnings'].includes(screen)
      ? 'home'
      : tabs.find((tab) => tab.screen === tabScreen)?.screen) ??
    (screen === 'confirmed' || screen === 'selectTime' || screen === 'payment' ? 'bookings' : '');
  const hasBack = stack.length > 1;
  const showHeader =
    hasBack &&
    !['welcome', 'auth', 'choosePath', 'home', 'explore', 'bookings', 'profile', 'mentorDashboard'].includes(screen);

  useEffect(() => {
    if (stack.length <= 1) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setStack((items) => items.length > 1 ? items.slice(0, -1) : items);
      return true;
    });
    return () => subscription.remove();
  }, [stack.length]);

  const content = (
    <View style={styles.appSurface}>
      {showHeader ? (
        <ScreenHeader
          title={headerTitle(screen, selectedMentor.name)}
          onBack={back}
          right={screen === 'notifications' || screen === 'profileNotifications' ? 'Clear' : undefined}
          onRight={() => setMutedNotifications(true)}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenContent
          screen={screen}
          role={role}
          mentor={selectedMentor}
          mentors={screen === 'explore' ? filteredMentors : mentors}
          bookings={bookings}
          likedIds={likedIds}
          query={query}
          category={category}
          categories={categories}
          selectedFilters={selectedFilters}
          priceFilter={priceFilter}
          availableOnly={availableOnly}
          filterRating={filterRating}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          paymentMethod={paymentMethod}
          notificationTab={notificationTab}
          activeBookingsTab={activeBookingsTab}
          requests={requests}
          availability={availability}
          notificationsCleared={mutedNotifications}
          onNavigate={navigate}
          onRoleChange={setRole}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onToggleFilter={(value) =>
            setSelectedFilters((values) =>
              values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
            )
          }
          onApplyFilters={() => {
            setActiveFilters(selectedFilters);
            setActivePriceFilter(priceFilter);
            setActiveAvailableOnly(availableOnly);
            setActiveRating(filterRating);
            navigate('explore');
          }}
          onPriceFilterChange={setPriceFilter}
          onAvailableOnlyChange={setAvailableOnly}
          onFilterRatingChange={setFilterRating}
          onToggleLike={toggleLike}
          onSelectDate={setSelectedDate}
          onSelectTime={setSelectedTime}
          onPaymentMethodChange={setPaymentMethod}
          onNotificationTabChange={setNotificationTab}
          onBookingsTabChange={setActiveBookingsTab}
          onBooking={makeBooking}
          onCancelBooking={(id) =>
            setBookings((items) => items.map((item) => (item.id === id ? { ...item, status: 'Cancelled' } : item)))
          }
          onRequestDecision={(id) => setRequests((items) => items.filter((item) => item !== id))}
          onToggleAvailability={(index) =>
            setAvailability((days) => days.map((day, i) => (i === index ? !day : day)))
          }
        />
      </ScrollView>
      {showTabs ? (
        <View style={styles.bottomNav}>
          {tabs.map(({ label, screen: tab, Icon }) => (
            <BottomTab
              key={tab}
              label={label}
              Icon={Icon}
              active={tab === selectedTab}
              onPress={() => selectTab(tab)}
            />
          ))}
          <Button
            compact
            circle
            label="+"
            accessibilityLabel="Add a new listing"
            onPress={() => navigate(role === 'mentor' ? 'availability' : 'explore')}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function headerTitle(screen: ScreenName, mentorName: string) {
  const titles: Partial<Record<ScreenName, string>> = {
    filters: 'Filters',
    notifications: 'Notifications',
    mentorProfile: mentorName,
    media: 'Media & highlights',
    reviews: 'Reviews',
    selectTime: 'Book consultation',
    payment: 'Payment',
    confirmed: 'Booking confirmed',
    likedProfiles: 'Liked profiles',
    profileBookings: 'My bookings',
    profileNotifications: 'Notifications',
    mentorDashboard: 'Mentor dashboard',
    availability: 'Manage availability',
    requests: 'Consultation requests',
    earnings: 'Earnings & reviews',
  };
  return titles[screen] ?? 'Experience Connect';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.white },
  appSurface: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.xl,
  },
  bottomNav: {
    minHeight: 72,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
