import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { BottomTab, Button, ScreenHeader, TextLabel } from './src/components';
import {
  categories,
  timeSlots,
  weekdays,
  type AppNotification,
  type AppUser,
  type AvailabilityDay,
  type Booking,
  type Mentor,
  type MentorDashboard,
  type MentorMedia,
  type MentorReview,
} from './src/data';
import { colors, spacing } from './src/theme';
import { ScreenContent, type ScreenName } from './src/Screens';
import {
  ApiError,
  apiRequest,
  clearAuthToken,
  errorMessage,
  readAuthToken,
  saveAuthToken,
} from './src/services/api';

type StackEntry = { screen: ScreenName; mentorId?: string };
type Envelope<T> = { data: T };
type PageEnvelope<T> = { data: T[]; meta: { current_page: number; last_page: number; total: number } };
type AuthResponse = { user: AppUser; token: string };

const tabs: { label: string; screen: ScreenName; Icon: LucideIcon }[] = [
  { label: 'Home', screen: 'home', Icon: House },
  { label: 'Explore', screen: 'explore', Icon: Compass },
  { label: 'Bookings', screen: 'bookings', Icon: CalendarDays },
  { label: 'Profile', screen: 'profile', Icon: UserRound },
];
const skillFilterNames = ['Technology', 'Business', 'Marketing', 'Finance', 'Design', 'Career', 'Leadership'];
const skillAliases: Record<string, string> = {
  'Product strategy': 'Product',
  'UX research': 'Design',
  Startups: 'Business',
};

export default function App() {
  const [stack, setStack] = useState<StackEntry[]>([{ screen: 'welcome' }]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<'learner' | 'mentor'>('learner');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Technology']);
  const [priceFilter, setPriceFilter] = useState('Any price');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filterRating, setFilterRating] = useState('Any');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activePriceFilter, setActivePriceFilter] = useState('Any price');
  const [activeAvailableOnly, setActiveAvailableOnly] = useState(false);
  const [activeRating, setActiveRating] = useState('Any');
  const [likedProfiles, setLikedProfiles] = useState<Mentor[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<boolean[]>(Array(7).fill(false));
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [dashboard, setDashboard] = useState<MentorDashboard | null>(null);
  const [reviews, setReviews] = useState<MentorReview[]>([]);
  const [media, setMedia] = useState<MentorMedia[]>([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notificationTab, setNotificationTab] = useState('All');
  const [activeBookingsTab, setActiveBookingsTab] = useState('Upcoming');
  const [booting, setBooting] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [apiError, setApiError] = useState('');

  const current = stack[stack.length - 1];
  const screen = current.screen;
  const selectedMentor = mentors.find((mentor) => mentor.id === current.mentorId) ?? mentors[0];
  const likedIds = likedProfiles.map((mentor) => mentor.id);

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

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const token = await readAuthToken();
        if (!token) return;
        const response = await apiRequest<Envelope<AppUser>>('/me');
        if (!active) return;
        setCurrentUser(response.data);
        setRole(response.data.role);
        setStack([{ screen: response.data.role === 'mentor' ? 'mentorDashboard' : 'home' }]);
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          setAuthError('Your session expired. Please sign in again.');
        } else {
          setApiError(errorMessage(error));
        }
      } finally {
        if (active) setBooting(false);
      }
    };
    void restoreSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const loadAccountData = async () => {
      setDataLoading(true);
      setApiError('');
      try {
        const [bookingResponse, favoriteResponse, notificationResponse] = await Promise.all([
          apiRequest<PageEnvelope<Booking>>('/bookings?per_page=50'),
          role === 'learner'
            ? apiRequest<Envelope<Mentor[]>>('/favorites')
            : Promise.resolve({ data: [] as Mentor[] }),
          apiRequest<PageEnvelope<AppNotification>>('/notifications?per_page=30'),
        ]);
        if (!active) return;
        setBookings(bookingResponse.data);
        setLikedProfiles(favoriteResponse.data);
        setNotifications(notificationResponse.data.filter((item) => !item.read));

        if (role === 'mentor') {
          const [availabilityResponse, requestsResponse, dashboardResponse] = await Promise.all([
            apiRequest<Envelope<AvailabilityDay[]>>('/mentor/availability'),
            apiRequest<PageEnvelope<Booking>>('/mentor/requests?per_page=50'),
            apiRequest<Envelope<MentorDashboard>>('/mentor/dashboard'),
          ]);
          if (!active) return;
          setAvailability(availabilityResponse.data.map((day) => day.available));
          const firstAvailable = availabilityResponse.data.find((day) => day.available);
          setAvailabilitySlots(firstAvailable?.slots.map(formatTimeRange) ?? []);
          setRequests(requestsResponse.data);
          setDashboard(dashboardResponse.data);
        } else {
          setRequests([]);
          setDashboard(null);
        }
      } catch (error) {
        if (active) setApiError(errorMessage(error));
      } finally {
        if (active) setDataLoading(false);
      }
    };
    void loadAccountData();
    return () => { active = false; };
  }, [currentUser?.id, role]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());
      if (category !== 'All') params.set('category', category);
      const skills = activeFilters
        .map((skill) => skillFilterNames.includes(skill) ? skill : skillAliases[skill])
        .filter(Boolean);
      if (skills.length) params.set('skills', [...new Set(skills)].join(','));
      if (activePriceFilter === '$20–$50') {
        params.set('min_price', '20');
        params.set('max_price', '50');
      } else if (activePriceFilter === '$50–$80') {
        params.set('min_price', '50');
        params.set('max_price', '80');
      }
      if (activeRating !== 'Any') params.set('min_rating', activeRating.replace('+', ''));
      if (activeAvailableOnly) params.set('available', 'true');
      params.set('sort', 'rating');
      params.set('direction', 'desc');
      params.set('per_page', '50');

      void apiRequest<PageEnvelope<Mentor>>(`/mentors?${params.toString()}`)
        .then((response) => {
          if (active) setMentors(response.data);
        })
        .catch((error: unknown) => {
          if (active) {
            setMentors([]);
            setApiError(errorMessage(error));
          }
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    activeAvailableOnly,
    activeFilters,
    activePriceFilter,
    activeRating,
    category,
    currentUser?.id,
    query,
  ]);

  useEffect(() => {
    const mentorId = current.mentorId;
    if (!currentUser || !mentorId || !['media', 'reviews'].includes(screen)) return;
    let active = true;
    const loadMentorContent = async () => {
      setDataLoading(true);
      setApiError('');
      try {
        if (screen === 'reviews') {
          const response = await apiRequest<PageEnvelope<MentorReview>>(
            `/mentors/${encodeURIComponent(mentorId)}/reviews`,
          );
          if (active) setReviews(response.data);
        } else {
          const response = await apiRequest<PageEnvelope<MentorMedia>>(
            `/mentors/${encodeURIComponent(mentorId)}/media`,
          );
          if (active) setMedia(response.data);
        }
      } catch (error) {
        if (active) setApiError(errorMessage(error));
      } finally {
        if (active) setDataLoading(false);
      }
    };
    void loadMentorContent();
    return () => { active = false; };
  }, [current.mentorId, currentUser?.id, screen]);

  useEffect(() => {
    if (stack.length <= 1) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setStack((items) => items.length > 1 ? items.slice(0, -1) : items);
      return true;
    });
    return () => subscription.remove();
  }, [stack.length]);

  const performAction = async (action: () => Promise<void>): Promise<boolean> => {
    setActionBusy(true);
    setApiError('');
    try {
      await action();
      return true;
    } catch (error) {
      const message = errorMessage(error);
      setApiError(message);
      if (error instanceof ApiError && error.status === 401) {
        setCurrentUser(null);
        setStack([{ screen: 'welcome' }]);
        setAuthError('Your session expired. Please sign in again.');
        setRole('learner');
        setMentors([]);
        setBookings([]);
        setLikedProfiles([]);
      } else if (!(error instanceof ApiError)) {
        console.error('API action failed unexpectedly', error);
      }
      return false;
    } finally {
      setActionBusy(false);
    }
  };

  const authenticate = async (
    mode: 'Log In' | 'Sign Up',
    name: string,
    email: string,
    password: string,
  ) => {
    setAuthBusy(true);
    setAuthError('');
    try {
      const response = await apiRequest<Envelope<AuthResponse>>(
        mode === 'Sign Up' ? '/auth/register' : '/auth/login',
        {
          method: 'POST',
          authenticated: false,
          body: mode === 'Sign Up'
            ? { name, email, password, password_confirmation: password }
            : { email, password },
        },
      );
      await saveAuthToken(response.data.token);
      setCurrentUser(response.data.user);
      setRole(response.data.user.role);
      navigate('choosePath');
    } catch (error) {
      setAuthError(errorMessage(error));
      if (!(error instanceof ApiError)) console.error('Unable to save authentication session', error);
    } finally {
      setAuthBusy(false);
    }
  };

  const chooseRole = async (nextRole: 'learner' | 'mentor') => {
    await performAction(async () => {
      const response = await apiRequest<Envelope<AppUser>>('/me/role', {
        method: 'PATCH',
        body: { role: nextRole },
      });
      setCurrentUser(response.data);
      setRole(response.data.role);
      navigate(nextRole === 'learner' ? 'home' : 'mentorDashboard');
    });
  };

  const logout = async () => {
    setActionBusy(true);
    setApiError('');
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      setApiError(`Signed out locally, but the server could not revoke the token: ${errorMessage(error)}`);
    } finally {
      try {
        await clearAuthToken();
      } catch (error) {
        setApiError(`Unable to clear the saved session: ${errorMessage(error)}`);
      }
      setCurrentUser(null);
      setRole('learner');
      setMentors([]);
      setBookings([]);
      setLikedProfiles([]);
      setNotifications([]);
      setStack([{ screen: 'welcome' }]);
      setActionBusy(false);
    }
  };

  const toggleLike = (id: string) => {
    void performAction(async () => {
      const isLiked = likedProfiles.some((mentor) => mentor.id === id);
      await apiRequest(`/favorites/${encodeURIComponent(id)}`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      const response = await apiRequest<Envelope<Mentor[]>>('/favorites');
      setLikedProfiles(response.data);
    });
  };

  const makeBooking = () => {
    if (!selectedMentor) {
      setApiError('Choose a mentor before booking a consultation.');
      return;
    }
    void performAction(async () => {
      const schedule = localDateTimeToIso(weekdays[selectedDate].isoDate, selectedTime);
      const response = await apiRequest<Envelope<Booking>>('/bookings', {
        method: 'POST',
        body: {
          mentor_id: selectedMentor.id,
          scheduled_at: schedule,
          topic: 'Career consultation',
        },
      });
      setBookings((currentBookings) => [response.data, ...currentBookings]);
      navigate('confirmed', selectedMentor.id);
    });
  };

  const cancelBooking = (id: string) => {
    void performAction(async () => {
      const response = await apiRequest<Envelope<Booking>>(`/bookings/${encodeURIComponent(id)}/cancel`, {
        method: 'PATCH',
      });
      setBookings((current) => current.map((booking) => booking.id === id ? response.data : booking));
    });
  };

  const decideRequest = (id: string, decision: 'accept' | 'decline') => {
    void performAction(async () => {
      await apiRequest(`/mentor/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { decision },
      });
      const [requestResponse, bookingResponse] = await Promise.all([
        apiRequest<PageEnvelope<Booking>>('/mentor/requests?per_page=50'),
        apiRequest<PageEnvelope<Booking>>('/bookings?per_page=50'),
      ]);
      setRequests(requestResponse.data);
      setBookings(bookingResponse.data);
    });
  };

  const saveAvailability = (days: boolean[], slots: string[]): Promise<boolean> => {
    return performAction(async () => {
      const response = await apiRequest<Envelope<AvailabilityDay[]>>('/mentor/availability', {
        method: 'PUT',
        body: {
          days: days.map((available, dayOfWeek) => ({
            day_of_week: dayOfWeek,
            available,
            slots: available ? slots.map(parseTimeRange).filter((slot): slot is { start: string; end: string } => slot !== null) : [],
          })),
        },
      });
      setAvailability(response.data.map((day) => day.available));
      const firstAvailable = response.data.find((day) => day.available);
      setAvailabilitySlots(firstAvailable?.slots.map(formatTimeRange) ?? []);
      const mentorsResponse = await apiRequest<PageEnvelope<Mentor>>('/mentors?per_page=50');
      setMentors(mentorsResponse.data);
    });
  };

  const clearNotifications = () => {
    void performAction(async () => {
      await apiRequest('/notifications/read', { method: 'POST' });
      setNotifications([]);
    });
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
  const content = (
    <View style={styles.appSurface}>
      {showHeader ? (
        <ScreenHeader
          title={headerTitle(screen, selectedMentor?.name ?? 'Mentor profile')}
          onBack={back}
          right={screen === 'notifications' || screen === 'profileNotifications' ? 'Clear' : undefined}
          onRight={clearNotifications}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {booting ? (
          <View style={styles.loading}><ActivityIndicator color={colors.blue} /><TextLabel size={12} color={colors.secondary}>Restoring your session…</TextLabel></View>
        ) : (
          <ScreenContent
            screen={screen}
            role={role}
            mentor={selectedMentor}
            mentors={mentors}
            favoriteMentors={likedProfiles}
            bookings={bookings}
            likedIds={likedIds}
            notifications={notifications}
            displayName={currentUser?.name ?? ''}
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
            availabilitySlots={availabilitySlots}
            dashboard={dashboard}
            reviews={reviews}
            media={media}
            loading={dataLoading}
            actionBusy={actionBusy}
            apiError={apiError}
            authBusy={authBusy}
            authError={authError}
            onDismissError={() => { setApiError(''); setAuthError(''); }}
            onNavigate={navigate}
            onSelectRole={chooseRole}
            onAuthenticate={authenticate}
            onLogout={logout}
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
            onCancelBooking={cancelBooking}
            onRequestDecision={decideRequest}
            onToggleAvailability={(index) =>
              setAvailability((days) => days.map((day, i) => (i === index ? !day : day)))
            }
            onSaveAvailability={saveAvailability}
          />
        )}
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

function localDateTimeToIso(date: string, time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  if (!match) throw new Error('Select a valid session time.');
  let hour = Number(match[1]) % 12;
  if (match[3] === 'PM') hour += 12;
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, hour, Number(match[2])).toISOString();
}

function parseTimeRange(value: string): { start: string; end: string } | null {
  const match = value.replace('–', '-').match(/^(\d{1,2})(?::(\d{2}))?-(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  const period = match[5].toUpperCase();
  const startHour = (Number(match[1]) % 12) + (period === 'PM' ? 12 : 0);
  const endHour = (Number(match[3]) % 12) + (period === 'PM' ? 12 : 0);
  return {
    start: `${`${startHour}`.padStart(2, '0')}:${(match[2] ?? '00').padStart(2, '0')}`,
    end: `${`${endHour}`.padStart(2, '0')}:${(match[4] ?? '00').padStart(2, '0')}`,
  };
}

function formatTimeRange(slot: { start: string; end: string }): string {
  const format = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}${minutes ? `:${`${minutes}`.padStart(2, '0')}` : ''} ${period}`;
  };
  return `${format(slot.start)}–${format(slot.end)}`;
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
  loading: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10 },
});
