import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  GraduationCap,
  Heart,
  HelpCircle,
  LockKeyhole,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  ListRow,
  Portrait,
  Rating,
  SectionTitle,
  TextField,
  TextLabel,
} from './components';
import {
  mentors as allMentors,
  notifications,
  requestSeed,
  timeSlots,
  weekdays,
  type Booking,
  type Mentor,
} from './data';
import { colors, spacing } from './theme';

export type ScreenName =
  | 'welcome'
  | 'auth'
  | 'choosePath'
  | 'home'
  | 'explore'
  | 'filters'
  | 'notifications'
  | 'mentorProfile'
  | 'media'
  | 'reviews'
  | 'selectTime'
  | 'payment'
  | 'confirmed'
  | 'bookings'
  | 'profile'
  | 'likedProfiles'
  | 'profileBookings'
  | 'profileNotifications'
  | 'mentorDashboard'
  | 'availability'
  | 'requests'
  | 'earnings';

type ScreenContentProps = {
  screen: ScreenName;
  role: 'learner' | 'mentor';
  mentor: Mentor;
  mentors: Mentor[];
  bookings: Booking[];
  likedIds: string[];
  query: string;
  category: string;
  categories: string[];
  selectedFilters: string[];
  priceFilter: string;
  availableOnly: boolean;
  filterRating: string;
  selectedDate: number;
  selectedTime: string;
  paymentMethod: string;
  notificationTab: string;
  activeBookingsTab: string;
  requests: string[];
  availability: boolean[];
  notificationsCleared: boolean;
  onNavigate: (screen: ScreenName, mentorId?: string) => void;
  onRoleChange: (role: 'learner' | 'mentor') => void;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onToggleFilter: (value: string) => void;
  onPriceFilterChange: (value: string) => void;
  onAvailableOnlyChange: (value: boolean) => void;
  onFilterRatingChange: (value: string) => void;
  onApplyFilters: () => void;
  onToggleLike: (id: string) => void;
  onSelectDate: (index: number) => void;
  onSelectTime: (time: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onNotificationTabChange: (tab: string) => void;
  onBookingsTabChange: (tab: string) => void;
  onBooking: () => void;
  onCancelBooking: (id: string) => void;
  onRequestDecision: (id: string) => void;
  onToggleAvailability: (index: number) => void;
};

const skillOptions = ['Technology', 'Business', 'Marketing', 'Finance', 'Design', 'Career', 'Leadership'];

export function ScreenContent(props: ScreenContentProps) {
  switch (props.screen) {
    case 'welcome': return <WelcomeScreen onNavigate={props.onNavigate} />;
    case 'auth': return <AuthScreen onNavigate={props.onNavigate} />;
    case 'choosePath': return <ChoosePathScreen {...props} />;
    case 'home': return <HomeScreen {...props} />;
    case 'explore': return <ExploreScreen {...props} />;
    case 'filters': return <FiltersScreen {...props} />;
    case 'notifications': return <NotificationsScreen {...props} />;
    case 'mentorProfile': return <MentorProfileScreen {...props} />;
    case 'media': return <MediaScreen {...props} />;
    case 'reviews': return <ReviewsScreen {...props} />;
    case 'selectTime': return <SelectTimeScreen {...props} />;
    case 'payment': return <PaymentScreen {...props} />;
    case 'confirmed': return <ConfirmedScreen {...props} />;
    case 'bookings': return <BookingsScreen {...props} />;
    case 'profile': return <ProfileScreen {...props} />;
    case 'likedProfiles': return <LikedProfilesScreen {...props} />;
    case 'profileBookings': return <BookingsScreen {...props} profileEntry />;
    case 'profileNotifications': return <NotificationsScreen {...props} />;
    case 'mentorDashboard': return <MentorDashboardScreen {...props} />;
    case 'availability': return <AvailabilityScreen {...props} />;
    case 'requests': return <RequestsScreen {...props} />;
    case 'earnings': return <EarningsScreen {...props} />;
  }
}

function WelcomeScreen({ onNavigate }: Pick<ScreenContentProps, 'onNavigate'>) {
  return (
    <View style={styles.welcome}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Heart size={22} color={colors.white} fill={colors.white} /></View>
        <View>
          <TextLabel size={19} weight="800" color={colors.navy}>Experience <TextLabel size={19} weight="800" color={colors.blue}>Connect</TextLabel></TextLabel>
          <TextLabel size={10} color={colors.secondary}>Real People · Real Experience · Real Learning</TextLabel>
        </View>
      </View>
      <View style={styles.welcomeArtwork}>
        <View style={styles.sunGlow} />
        <View style={styles.artWaves} />
        <View style={styles.artMentor}><Portrait mentor={allMentors[0]} height={224} /></View>
        <View style={styles.playBadge}><Play size={21} color={colors.white} fill={colors.white} /></View>
      </View>
      <View style={styles.welcomeCopy}>
        <TextLabel size={25} weight="800" style={{ textAlign: 'center' }}>Welcome!</TextLabel>
        <TextLabel size={14} color={colors.secondary} style={{ textAlign: 'center', marginTop: 9 }}>
          Learn from real people with real experience. Find a mentor, explore your path, and do your best work.
        </TextLabel>
        <Button label="Get Started" onPress={() => onNavigate('auth')} />
        <Pressable onPress={() => onNavigate('auth')} accessibilityRole="button">
          <TextLabel size={12} color={colors.secondary} style={{ textAlign: 'center', marginTop: 14 }}>
            Already have an account? <TextLabel size={12} color={colors.blue} weight="700">Log in</TextLabel>
          </TextLabel>
        </Pressable>
      </View>
    </View>
  );
}

function AuthScreen({ onNavigate }: Pick<ScreenContentProps, 'onNavigate'>) {
  const [mode, setMode] = useState<'Log In' | 'Sign Up'>('Log In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState('');
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const passwordValid = password.length >= 6;
  const tryContinue = () => {
    setSubmitted(true);
    if (emailValid && passwordValid) onNavigate('choosePath');
  };
  return (
    <View style={styles.auth}>
      <View style={[styles.brandRow, { alignSelf: 'center', marginTop: 24 }]}>
        <View style={styles.brandMark}><Heart size={20} color={colors.white} fill={colors.white} /></View>
        <View>
          <TextLabel size={17} weight="800" color={colors.navy}>Experience <TextLabel size={17} weight="800" color={colors.blue}>Connect</TextLabel></TextLabel>
          <TextLabel size={10} color={colors.secondary}>A better way to grow</TextLabel>
        </View>
      </View>
      <TextLabel size={24} weight="800" style={{ textAlign: 'center', marginTop: 31 }}>
        {mode === 'Log In' ? 'Welcome back' : 'Create your account'}
      </TextLabel>
      <TextLabel size={13} color={colors.secondary} style={{ textAlign: 'center', marginTop: 5, marginBottom: 22 }}>
        Your next step starts with a conversation.
      </TextLabel>
      <View style={styles.segmented}>
        {(['Log In', 'Sign Up'] as const).map((tab) => (
          <Pressable key={tab} onPress={() => { setMode(tab); setSubmitted(false); }} style={[styles.segment, mode === tab && styles.segmentActive]}>
            <TextLabel size={13} color={mode === tab ? colors.blue : colors.secondary} weight={mode === tab ? '700' : '500'}>{tab}</TextLabel>
          </Pressable>
        ))}
      </View>
      <TextField
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={submitted && !emailValid ? 'Enter a valid email address.' : undefined}
      />
      <TextField
        label="Password"
        placeholder="At least 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={submitted && !passwordValid ? 'Password must be at least 6 characters.' : undefined}
      />
      {mode === 'Log In' ? (
        <Pressable
          accessibilityRole="button"
          style={styles.forgotLink}
          onPress={() => setNotice(emailValid ? 'Password recovery is simulated in this demo.' : 'Enter your email address to continue.')}
        >
          <TextLabel size={12} color={colors.blue} weight="600">Forgot password?</TextLabel>
        </Pressable>
      ) : (
        <TextLabel size={11} color={colors.secondary} style={{ marginTop: -3, marginBottom: 14 }}>
          By continuing, you agree to our community guidelines.
        </TextLabel>
      )}
      {notice ? <TextLabel size={11} color={colors.blue} style={{ marginBottom: 10 }}>{notice}</TextLabel> : null}
      <Button label={mode === 'Log In' ? 'Log In' : 'Create account'} onPress={tryContinue} />
      <View style={styles.orDivider}><View style={styles.divider} /><TextLabel size={11} color={colors.muted}>or continue with</TextLabel><View style={styles.divider} /></View>
      <View style={styles.socialRow}>
        <Button variant="ghost" compact label="Google" icon={Sparkles} onPress={() => onNavigate('choosePath')} />
        <Button variant="ghost" compact label="Apple" icon={UserRound} onPress={() => onNavigate('choosePath')} />
      </View>
      <TextLabel size={10} color={colors.secondary} style={{ textAlign: 'center', marginTop: 8 }}>
        Social sign-in buttons continue with local demo access.
      </TextLabel>
      <TextLabel size={11} color={colors.secondary} style={{ textAlign: 'center', marginTop: 22 }}>
        Your next chapter can start today.
      </TextLabel>
    </View>
  );
}

function ChoosePathScreen(props: ScreenContentProps) {
  const [selected, setSelected] = useState<'learner' | 'mentor'>(props.role);
  return (
    <View style={styles.page}>
      <View style={styles.onboardingHeading}>
        <TextLabel size={24} weight="800" style={{ textAlign: 'center' }}>Choose Your Path</TextLabel>
        <TextLabel size={13} color={colors.secondary} style={{ textAlign: 'center', marginTop: 7 }}>
          How would you like to grow your experience?
        </TextLabel>
      </View>
      <PathCard
        title="Learner"
        description="Learn from real people, get guidance, grow your career."
        Icon={GraduationCap}
        selected={selected === 'learner'}
        onPress={() => setSelected('learner')}
      />
      <PathCard
        title="Mentor"
        description="Share your experience, help others grow, make a difference."
        Icon={BookOpen}
        selected={selected === 'mentor'}
        onPress={() => setSelected('mentor')}
      />
      <View style={{ flex: 1 }} />
      <Button
        label={`Continue as ${selected === 'learner' ? 'Learner' : 'Mentor'}`}
        icon={ArrowRight}
        onPress={() => {
          props.onRoleChange(selected);
          props.onNavigate(selected === 'learner' ? 'home' : 'mentorDashboard');
        }}
      />
    </View>
  );
}

function PathCard({
  title,
  description,
  Icon,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  Icon: typeof GraduationCap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.pathCard, selected && styles.pathCardSelected]}>
      <View style={[styles.pathIcon, selected && styles.pathIconSelected]}><Icon size={22} color={selected ? colors.white : colors.blue} /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <TextLabel size={15} weight="700">{title}</TextLabel>
        <TextLabel size={12} color={colors.secondary}>{description}</TextLabel>
      </View>
      <ChevronRight size={18} color={selected ? colors.blue : colors.muted} />
    </Pressable>
  );
}

function HomeScreen(props: ScreenContentProps) {
  return (
    <View style={styles.page}>
      <View style={styles.homeHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandMarkSmall}><Heart size={14} color={colors.white} fill={colors.white} /></View>
          <View>
            <TextLabel size={15} weight="800" color={colors.navy}>Experience <TextLabel size={15} weight="800" color={colors.blue}>Connect</TextLabel></TextLabel>
            <TextLabel size={9} color={colors.secondary}>Good morning, Alex</TextLabel>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => props.onNavigate('notifications')} style={styles.iconButton}>
          <Bell size={18} color={colors.navy} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>
      <View style={styles.homeSearch}>
        <Search size={17} color={colors.muted} />
        <TextInput
          value={props.query}
          onChangeText={props.onQueryChange}
          placeholder="Search mentors, professions..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search mentors"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Open search" onPress={() => props.onNavigate('explore')}>
          <ArrowRight size={17} color={colors.blue} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
        {props.categories.map((item) => (
          <Chip key={item} label={item} selected={props.category === item} onPress={() => props.onCategoryChange(item)} />
        ))}
      </ScrollView>
      <SectionTitle title="Meet your next mentor" action="See all" onAction={() => props.onNavigate('explore')} />
      <MentorCard mentor={allMentors[0]} onPress={() => props.onNavigate('mentorProfile', allMentors[0].id)} onLike={() => props.onToggleLike(allMentors[0].id)} liked={props.likedIds.includes(allMentors[0].id)} featured />
      <SectionTitle title="Popular this week" action="Explore" onAction={() => props.onNavigate('explore')} />
      <View style={styles.trendingGrid}>
        {[allMentors[2], allMentors[1]].map((mentor) => (
          <Pressable key={mentor.id} onPress={() => props.onNavigate('mentorProfile', mentor.id)} style={styles.trendingCard}>
            <Avatar mentor={mentor} size={66} />
            <TextLabel size={12} weight="700" numberOfLines={1} style={{ marginTop: 7 }}>{mentor.name}</TextLabel>
            <TextLabel size={10} color={colors.secondary} numberOfLines={1}>{mentor.skills[0]} mentor</TextLabel>
          </Pressable>
        ))}
        <Card style={styles.learnBanner}>
          <View style={styles.playCircle}><Play size={15} fill={colors.white} color={colors.white} /></View>
          <View style={{ flex: 1 }}>
            <TextLabel size={12} weight="700">Learn from experience</TextLabel>
            <TextLabel size={10} color={colors.secondary}>Fresh videos from our mentors</TextLabel>
          </View>
          <ChevronRight size={15} color={colors.muted} />
        </Card>
      </View>
    </View>
  );
}

function ExploreScreen(props: ScreenContentProps) {
  return (
    <View style={styles.page}>
      <View style={styles.pageIntro}>
        <TextLabel size={22} weight="800">Explore mentors</TextLabel>
        <TextLabel size={12} color={colors.secondary} style={{ marginTop: 4 }}>Find the right person to help you grow.</TextLabel>
      </View>
      <View style={styles.homeSearch}>
        <Search size={17} color={colors.muted} />
        <TextInput
          value={props.query}
          onChangeText={props.onQueryChange}
          placeholder="Search mentors, professions..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search mentors and professions"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Filters" onPress={() => props.onNavigate('filters')}>
          <SlidersHorizontal size={18} color={colors.blue} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalChips}>
        {props.categories.map((item) => (
          <Chip key={item} label={item} selected={props.category === item} onPress={() => props.onCategoryChange(item)} />
        ))}
      </ScrollView>
      <View style={styles.resultCountRow}>
        <TextLabel size={13} weight="700">{props.mentors.length} mentors</TextLabel>
        <TextLabel size={11} color={colors.secondary}>Recommended for you</TextLabel>
      </View>
      {props.mentors.map((mentor) => (
        <MentorCard
          key={mentor.id}
          mentor={mentor}
          onPress={() => props.onNavigate('mentorProfile', mentor.id)}
          onLike={() => props.onToggleLike(mentor.id)}
          liked={props.likedIds.includes(mentor.id)}
        />
      ))}
      {props.mentors.length === 0 ? (
        <Card style={styles.emptyState}>
          <Search size={24} color={colors.muted} />
          <TextLabel size={15} weight="700" style={{ marginTop: 12 }}>No mentors found</TextLabel>
          <TextLabel size={12} color={colors.secondary} style={{ textAlign: 'center', marginTop: 4 }}>Try another search or adjust your filters.</TextLabel>
          <Button label="Clear search" variant="secondary" compact onPress={() => { props.onQueryChange(''); props.onCategoryChange('All'); }} />
        </Card>
      ) : null}
    </View>
  );
}

function MentorCard({
  mentor,
  onPress,
  onLike,
  liked,
  featured = false,
}: {
  mentor: Mentor;
  onPress: () => void;
  onLike: () => void;
  liked: boolean;
  featured?: boolean;
}) {
  return (
    <View style={[styles.mentorCard, featured && styles.featuredMentorCard]}>
      {featured ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${mentor.name}'s profile`} onPress={onPress}>
          <Portrait mentor={mentor} height={160} />
        </Pressable>
      ) : null}
      <View style={styles.mentorInfo}>
        {!featured ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Open ${mentor.name}'s profile`} onPress={onPress}>
            <Avatar mentor={mentor} size={56} />
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${mentor.name}'s profile`} onPress={onPress} style={styles.mentorText}>
          <View style={styles.nameLine}>
            <TextLabel size={14} weight="700" numberOfLines={1} style={{ flexShrink: 1 }}>{mentor.name}</TextLabel>
            <CheckCircle2 size={14} color={colors.blue} />
          </View>
          <TextLabel size={11} color={colors.secondary} numberOfLines={1}>{mentor.role}</TextLabel>
          <View style={styles.mentorMeta}>
            <Rating value={mentor.rating} />
            <TextLabel size={10} color={colors.secondary}>· {mentor.experience.split(' ')[0]} yrs</TextLabel>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={liked ? `Unlike ${mentor.name}` : `Like ${mentor.name}`} onPress={onLike} hitSlop={9} style={styles.likeButton}>
          <Heart size={18} color={liked ? colors.red : colors.secondary} fill={liked ? colors.red : 'transparent'} />
        </Pressable>
      </View>
      {featured ? <TextLabel size={11} color={colors.secondary} style={styles.featuredBio} numberOfLines={2}>{mentor.bio}</TextLabel> : null}
      <View style={styles.chipRow}>
        {mentor.skills.slice(0, featured ? 3 : 2).map((skill) => <Chip key={skill} label={skill} />)}
      </View>
      <View style={styles.cardFooter}>
        <TextLabel size={12} color={colors.secondary}>From <TextLabel size={13} color={colors.text} weight="700">${mentor.price}</TextLabel><TextLabel size={11} color={colors.secondary}> / session</TextLabel></TextLabel>
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.viewProfileLink}>
          <TextLabel size={11} color={colors.blue} weight="700">View profile</TextLabel>
          <ChevronRight size={12} color={colors.blue} />
        </Pressable>
      </View>
    </View>
  );
}

function FiltersScreen(props: ScreenContentProps) {
  return (
    <View style={styles.page}>
      <View style={styles.filterSection}>
        <SectionTitle title="Profession" />
        <View style={styles.chipRow}>
          {skillOptions.map((skill) => <Chip key={skill} label={skill} selected={props.selectedFilters.includes(skill)} onPress={() => props.onToggleFilter(skill)} />)}
        </View>
      </View>
      <View style={styles.filterSection}>
        <SectionTitle title="Trending skills" />
        <View style={styles.chipRow}>
          {['Product strategy', 'Leadership', 'UX research', 'Startups'].map((skill) => (
            <Chip key={skill} label={skill} selected={props.selectedFilters.includes(skill)} onPress={() => props.onToggleFilter(skill)} />
          ))}
        </View>
      </View>
      <View style={styles.filterSection}>
        <SectionTitle title="Consultation fee" />
        <TextLabel size={12} color={colors.secondary}>Set a comfortable price per session</TextLabel>
        <View style={styles.priceTrack}><View style={styles.priceTrackActive} /><View style={styles.trackHandle} /><View style={[styles.trackHandle, { left: '71%' }]} /></View>
        <View style={styles.priceRange}><TextLabel size={12} weight="600">$20</TextLabel><TextLabel size={12} weight="600">$100+</TextLabel></View>
        <View style={styles.chipRow}>{['Any price', '$20–$50', '$50–$80'].map((item) => <Chip key={item} label={item} selected={props.priceFilter === item} onPress={() => props.onPriceFilterChange(item)} />)}</View>
      </View>
      <View style={styles.filterSection}>
        <SectionTitle title="Minimum rating" />
        <View style={styles.chipRow}>
          {['Any', '4.0+', '4.5+', '5.0'].map((item) => <Chip key={item} label={`${item} ${item !== 'Any' ? '★' : ''}`} selected={props.filterRating === item} onPress={() => props.onFilterRatingChange(item)} />)}
        </View>
      </View>
      <View style={styles.switchRow}>
        <View><TextLabel size={13} weight="600">Available this week</TextLabel><TextLabel size={11} color={colors.secondary}>Only show mentors with open times</TextLabel></View>
        <Switch value={props.availableOnly} onValueChange={props.onAvailableOnlyChange} trackColor={{ false: colors.border, true: colors.blue }} />
      </View>
      <View style={styles.filterButtons}>
        <Button label="Clear all" variant="ghost" onPress={() => { props.selectedFilters.forEach(props.onToggleFilter); props.onFilterRatingChange('Any'); props.onPriceFilterChange('Any price'); props.onAvailableOnlyChange(false); }} />
        <Button label="Show mentors" onPress={props.onApplyFilters} />
      </View>
    </View>
  );
}

function NotificationsScreen(props: ScreenContentProps) {
  const tabs = ['All', 'Bookings', 'Likes', 'Messages'];
  const filtered = notifications.filter((item) => {
    if (props.notificationsCleared) return false;
    if (props.notificationTab === 'All') return true;
    if (props.notificationTab === 'Likes') return item.kind === 'Updates';
    return item.kind === props.notificationTab;
  });
  return (
    <View style={styles.page}>
      <View style={styles.pageIntro}>
        <TextLabel size={21} weight="800">Stay in the loop</TextLabel>
        <TextLabel size={12} color={colors.secondary} style={{ marginTop: 4 }}>Your latest activity and learning updates.</TextLabel>
      </View>
      <View style={styles.segmented}>
        {tabs.map((tab) => (
          <Pressable key={tab} onPress={() => props.onNotificationTabChange(tab)} style={[styles.segment, props.notificationTab === tab && styles.segmentActive]}>
            <TextLabel size={11} color={props.notificationTab === tab ? colors.blue : colors.secondary} weight={props.notificationTab === tab ? '700' : '500'}>{tab}</TextLabel>
          </Pressable>
        ))}
      </View>
      {filtered.map((item) => {
        const person = allMentors.find((mentor) => mentor.id === item.avatarId) ?? allMentors[0];
        return (
          <Card key={item.id} style={styles.notificationCard}>
            <Avatar mentor={person} size={44} />
            <View style={{ flex: 1, gap: 3 }}>
              <TextLabel size={12} numberOfLines={2}><TextLabel size={12} weight="700">{item.name} </TextLabel>{item.text}</TextLabel>
              <TextLabel size={10} color={colors.secondary}>{item.time}</TextLabel>
            </View>
            <View style={styles.unreadDot} />
          </Card>
        );
      })}
      {filtered.length === 0 ? <EmptyNotice label={props.notificationsCleared ? 'You’re all caught up.' : 'No notifications in this tab.'} /> : null}
    </View>
  );
}

function MentorProfileScreen(props: ScreenContentProps) {
  const mentor = props.mentor;
  return (
    <View style={styles.page}>
      <View style={styles.profileHero}>
        <Portrait mentor={mentor} height={205} />
        <Pressable style={styles.profileHeart} onPress={() => props.onToggleLike(mentor.id)} accessibilityRole="button" accessibilityLabel="Save mentor">
          <Heart size={19} color={props.likedIds.includes(mentor.id) ? colors.red : colors.navy} fill={props.likedIds.includes(mentor.id) ? colors.red : colors.white} />
        </Pressable>
      </View>
      <Card style={styles.profileSummary}>
        <View style={styles.nameLine}>
          <TextLabel size={19} weight="800">{mentor.name}</TextLabel>
          <CheckCircle2 size={17} color={colors.blue} />
        </View>
        <TextLabel size={12} color={colors.secondary} style={{ marginTop: 3 }}>{mentor.role} at {mentor.company}</TextLabel>
        <View style={[styles.mentorMeta, { marginTop: 8 }]}><Rating value={mentor.rating} reviews={mentor.reviews} /><TextLabel size={11} color={colors.secondary}>· {mentor.experience}</TextLabel></View>
        <View style={styles.profileStats}>
          <StatCell value="12+" label="Years" />
          <StatCell value={`${mentor.reviews}`} label="Reviews" />
          <StatCell value="98%" label="Response" />
        </View>
        <Button label="Book consultation" icon={CalendarCheck} onPress={() => props.onNavigate('selectTime', mentor.id)} />
      </Card>
      <SectionTitle title="About" />
      <TextLabel size={13} color={colors.secondary} style={{ marginBottom: 18 }}>{mentor.bio}</TextLabel>
      <SectionTitle title="Areas of expertise" />
      <View style={[styles.chipRow, { marginBottom: 18 }]}>{mentor.skills.map((skill) => <Chip key={skill} label={skill} />)}</View>
      <Card style={{ paddingVertical: 4 }}>
        <ListRow title="Media & highlights" subtitle="Videos, articles and helpful resources" icon={Play} onPress={() => props.onNavigate('media', mentor.id)} />
        <View style={styles.hairline} />
        <ListRow title="Reviews" subtitle={`${mentor.reviews} learner experiences`} icon={Star} onPress={() => props.onNavigate('reviews', mentor.id)} />
      </Card>
    </View>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return <View style={styles.statCell}><TextLabel size={15} weight="800" color={colors.navy}>{value}</TextLabel><TextLabel size={10} color={colors.secondary}>{label}</TextLabel></View>;
}

function MediaScreen(props: ScreenContentProps) {
  const [playing, setPlaying] = useState(false);
  const mentor = props.mentor;
  return (
    <View style={styles.page}>
      <SectionTitle title="Introduction video" />
      <Pressable accessibilityRole="button" accessibilityLabel={playing ? 'Pause introduction video' : 'Play introduction video'} onPress={() => setPlaying((value) => !value)} style={styles.videoCard}>
        <Portrait mentor={mentor} height={190} />
        <View style={styles.videoOverlay}><View style={styles.videoPlay}><Play size={20} color={colors.white} fill={colors.white} /></View></View>
        <View style={styles.videoDuration}><TextLabel size={10} color={colors.white} weight="600">2:14</TextLabel></View>
      </Pressable>
      <TextLabel size={11} color={colors.secondary} style={{ marginTop: 7, marginBottom: 20 }}>{playing ? 'Playing locally · ' : ''}Meet {mentor.name.split(' ')[0]} and hear how they can help.</TextLabel>
      <SectionTitle title="More videos" action="See all" onAction={() => setPlaying(true)} />
      <View style={styles.videoGrid}>
        {['Growing into leadership', 'A portfolio that stands out', 'Finding your next role'].map((title, index) => (
          <Pressable key={title} style={styles.smallVideo} onPress={() => setPlaying(true)} accessibilityRole="button">
            <View style={[styles.smallVideoArt, { backgroundColor: [mentor.color, '#E8F0FC', '#F6ECE3'][index] }]}>
              <Avatar mentor={allMentors[index]} size={48} />
              <View style={styles.smallPlay}><Play size={12} color={colors.white} fill={colors.white} /></View>
            </View>
            <TextLabel size={11} weight="600" numberOfLines={2} style={{ marginTop: 6 }}>{title}</TextLabel>
            <TextLabel size={10} color={colors.secondary}>{[8, 12, 6][index]} min · {mentor.name.split(' ')[0]}</TextLabel>
          </Pressable>
        ))}
      </View>
      <SectionTitle title="Articles & resources" />
      {['My guide to thoughtful career moves', 'Five ways to make your portfolio shine'].map((title) => (
        <Card key={title} style={{ marginBottom: 9, paddingVertical: 4 }}>
          <ListRow title={title} subtitle="A practical read · 5 min" icon={BookOpen} onPress={() => setPlaying(true)} />
        </Card>
      ))}
    </View>
  );
}

function ReviewsScreen(props: ScreenContentProps) {
  const ratingBars = [83, 12, 4, 1, 0];
  return (
    <View style={styles.page}>
      <Card style={styles.ratingOverview}>
        <View style={styles.bigRating}><TextLabel size={38} weight="800">{props.mentor.rating.toFixed(1)}</TextLabel><Rating value={props.mentor.rating} /><TextLabel size={10} color={colors.secondary}>{props.mentor.reviews} verified reviews</TextLabel></View>
        <View style={{ flex: 1, gap: 7 }}>
          {ratingBars.map((value, index) => (
            <View key={index} style={styles.ratingBarRow}>
              <TextLabel size={10} color={colors.secondary}>{5 - index} ★</TextLabel>
              <View style={styles.ratingTrack}><View style={[styles.ratingFill, { width: `${value}%` }]} /></View>
              <TextLabel size={10} color={colors.secondary}>{value}%</TextLabel>
            </View>
          ))}
        </View>
      </Card>
      <View style={[styles.reviewSummary, { marginTop: 15 }]}>
        <TextLabel size={13} weight="700">Learners love {props.mentor.name.split(' ')[0]}</TextLabel>
        <Chip label="Most helpful" selected />
      </View>
      {[
        { name: 'Maya R.', initials: 'MR', text: 'An incredibly thoughtful mentor. I left with a clear plan and the confidence to make my next move.', time: '2 weeks ago' },
        { name: 'Arjun K.', initials: 'AK', text: 'Practical advice, generous with their time, and genuinely interested in helping me succeed.', time: '1 month ago' },
        { name: 'Sofia L.', initials: 'SL', text: 'The portfolio feedback was detailed and immediately useful. Highly recommend booking a session.', time: '1 month ago' },
      ].map((review, index) => (
        <Card key={review.name} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={[styles.initialAvatar, { backgroundColor: ['#DFEAF7', '#F7EADD', '#EBE5F7'][index] }]}><TextLabel size={12} weight="700" color={colors.navy}>{review.initials}</TextLabel></View>
            <View style={{ flex: 1 }}><TextLabel size={12} weight="700">{review.name}</TextLabel><TextLabel size={10} color={colors.secondary}>{review.time}</TextLabel></View>
            <Rating value={5} />
          </View>
          <TextLabel size={12} color={colors.secondary} style={{ marginTop: 11 }}>{review.text}</TextLabel>
          <TextLabel size={10} color={colors.green} weight="600" style={{ marginTop: 9 }}>✓ Verified consultation</TextLabel>
        </Card>
      ))}
    </View>
  );
}

function SelectTimeScreen(props: ScreenContentProps) {
  return (
    <View style={styles.page}>
      <Card style={styles.bookingMentor}>
        <Avatar mentor={props.mentor} size={48} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <TextLabel size={13} weight="700">{props.mentor.name}</TextLabel>
          <TextLabel size={11} color={colors.secondary}>{props.mentor.role}</TextLabel>
          <Rating value={props.mentor.rating} />
        </View>
        <TextLabel size={12} color={colors.text} weight="700">${props.mentor.price}<TextLabel size={10} color={colors.secondary}> / 30m</TextLabel></TextLabel>
      </Card>
      <SectionTitle title="Select date" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
        {weekdays.map((item, index) => (
          <Pressable key={item.day} onPress={() => props.onSelectDate(index)} style={[styles.datePill, props.selectedDate === index && styles.datePillSelected]}>
            <TextLabel size={10} color={props.selectedDate === index ? colors.white : colors.secondary} weight="600">{item.day}</TextLabel>
            <TextLabel size={15} color={props.selectedDate === index ? colors.white : colors.text} weight="700">{item.date}</TextLabel>
          </Pressable>
        ))}
      </ScrollView>
      <SectionTitle title="Available time slots" />
      <View style={styles.timeGrid}>
        {timeSlots.map((time) => (
          <Pressable key={time} onPress={() => props.onSelectTime(time)} style={[styles.timeSlot, props.selectedTime === time && styles.timeSlotSelected]}>
            <TextLabel size={12} color={props.selectedTime === time ? colors.white : colors.text} weight="600">{time}</TextLabel>
          </Pressable>
        ))}
      </View>
      <Card style={styles.durationCard}>
        <View style={styles.durationIcon}><Clock3 size={18} color={colors.blue} /></View>
        <View style={{ flex: 1 }}><TextLabel size={13} weight="700">Session duration</TextLabel><TextLabel size={11} color={colors.secondary}>One-on-one video consultation</TextLabel></View>
        <TextLabel size={12} weight="700" color={colors.blue}>30 min</TextLabel>
      </Card>
      <View style={{ flex: 1, minHeight: 22 }} />
      <View style={styles.summaryLine}><TextLabel size={12} color={colors.secondary}>Total</TextLabel><TextLabel size={18} weight="800">${props.mentor.price}</TextLabel></View>
      <Button label="Continue to payment" icon={ArrowRight} onPress={() => props.onNavigate('payment', props.mentor.id)} />
    </View>
  );
}

function PaymentScreen(props: ScreenContentProps) {
  return (
    <View style={styles.page}>
      <SectionTitle title="Booking summary" />
      <Card style={styles.bookingSummary}>
        <Avatar mentor={props.mentor} size={48} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <TextLabel size={13} weight="700">{props.mentor.name}</TextLabel>
          <TextLabel size={11} color={colors.secondary}>Career consultation</TextLabel>
        </View>
      </Card>
      <Card style={styles.detailCard}>
        <SummaryRow label="Date & time" value={`${weekdays[props.selectedDate].day}, ${weekdays[props.selectedDate].date} May · ${props.selectedTime}`} />
        <SummaryRow label="Duration" value="30 minutes" />
        <SummaryRow label="Consultation fee" value={`$${props.mentor.price}.00`} />
        <SummaryRow label="Platform fee" value="$0.00" />
        <View style={styles.hairline} />
        <SummaryRow label="Total amount" value={`$${props.mentor.price}.00`} strong />
      </Card>
      <SectionTitle title="Select payment method" />
      {[
        { label: 'UPI', detail: 'Google Pay, PhonePe', Icon: SmartphoneMark },
        { label: 'Card', detail: 'Credit or debit card', Icon: CreditCard },
        { label: 'Wallet', detail: 'Balance: $120.00', Icon: Wallet },
      ].map(({ label, detail, Icon }) => (
        <Pressable key={label} onPress={() => props.onPaymentMethodChange(label)} style={[styles.paymentOption, props.paymentMethod === label && styles.paymentOptionSelected]}>
          <View style={styles.paymentIcon}><Icon size={17} color={colors.blue} /></View>
          <View style={{ flex: 1 }}><TextLabel size={13} weight="700">{label}</TextLabel><TextLabel size={10} color={colors.secondary}>{detail}</TextLabel></View>
          <View style={[styles.radio, props.paymentMethod === label && styles.radioSelected]}>{props.paymentMethod === label ? <View style={styles.radioDot} /> : null}</View>
        </Pressable>
      ))}
      <View style={styles.secureNotice}><ShieldCheck size={16} color={colors.green} /><TextLabel size={10} color={colors.secondary}>Your payment details stay private. This is a local demo checkout.</TextLabel></View>
      <View style={{ flex: 1, minHeight: 15 }} />
      <Button label={`Pay $${props.mentor.price}.00`} icon={LockKeyhole} onPress={props.onBooking} />
      <TextLabel size={10} color={colors.secondary} style={{ textAlign: 'center', marginTop: 9 }}>No payment will be processed.</TextLabel>
    </View>
  );
}

function SmartphoneMark(props: { size: number; color: string }) {
  return <CircleDollarSign size={props.size} color={props.color} />;
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <TextLabel size={12} color={strong ? colors.text : colors.secondary} weight={strong ? '700' : '400'}>{label}</TextLabel>
      <TextLabel size={12} color={colors.text} weight={strong ? '800' : '600'}>{value}</TextLabel>
    </View>
  );
}

function ConfirmedScreen(props: ScreenContentProps) {
  const [calendarAdded, setCalendarAdded] = useState(false);
  return (
    <View style={styles.confirmedPage}>
      <View style={styles.successIcon}><Check size={37} color={colors.white} strokeWidth={3} /></View>
      <TextLabel size={23} weight="800" style={{ textAlign: 'center', marginTop: 18 }}>Consultation booked!</TextLabel>
      <TextLabel size={13} color={colors.secondary} style={{ textAlign: 'center', marginTop: 8, maxWidth: 290 }}>
        Your session with {props.mentor.name} is confirmed. We’re excited for you to connect.
      </TextLabel>
      <Card style={styles.confirmationCard}>
        <View style={styles.confirmationMentor}><Avatar mentor={props.mentor} size={48} /><View style={{ marginLeft: 10 }}><TextLabel size={13} weight="700">{props.mentor.name}</TextLabel><TextLabel size={11} color={colors.secondary}>{props.mentor.role}</TextLabel></View></View>
        <View style={styles.hairline} />
        <SummaryRow label="Date" value={`${weekdays[props.selectedDate].day}, ${weekdays[props.selectedDate].date} May`} />
        <SummaryRow label="Time" value={props.selectedTime} />
        <SummaryRow label="Duration" value="30 minutes" />
        <SummaryRow label="Location" value="Video call" />
      </Card>
      <Button label="View booking details" onPress={() => props.onNavigate('bookings')} />
      <Button label={calendarAdded ? 'Calendar reminder added' : 'Add to calendar'} variant="secondary" onPress={() => setCalendarAdded(true)} />
      <Button label="Back to home" variant="secondary" onPress={() => props.onNavigate('home')} />
      <TextLabel size={10} color={colors.secondary} style={{ textAlign: 'center', marginTop: 9 }}>
        {calendarAdded ? 'Calendar reminder preview saved locally.' : 'No external calendar or payment service is connected.'}
      </TextLabel>
    </View>
  );
}

function BookingsScreen(props: ScreenContentProps & { profileEntry?: boolean }) {
  const filtered = props.bookings.filter((booking) => booking.status === props.activeBookingsTab);
  return (
    <View style={styles.page}>
      <View style={styles.pageIntro}>
        <TextLabel size={21} weight="800">My bookings</TextLabel>
        <TextLabel size={12} color={colors.secondary} style={{ marginTop: 4 }}>Keep your learning journey on track.</TextLabel>
      </View>
      <View style={styles.segmented}>
        {['Upcoming', 'Past', 'Cancelled'].map((tab) => (
          <Pressable key={tab} onPress={() => props.onBookingsTabChange(tab)} style={[styles.segment, props.activeBookingsTab === tab && styles.segmentActive]}>
            <TextLabel size={12} color={props.activeBookingsTab === tab ? colors.blue : colors.secondary} weight={props.activeBookingsTab === tab ? '700' : '500'}>{tab}</TextLabel>
          </Pressable>
        ))}
      </View>
      {filtered.map((booking) => {
        const mentor = allMentors.find((item) => item.id === booking.mentorId) ?? allMentors[0];
        return (
          <Card key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingTop}><Avatar mentor={mentor} size={48} /><View style={{ flex: 1, marginLeft: 10 }}><TextLabel size={13} weight="700">{mentor.name}</TextLabel><TextLabel size={11} color={colors.secondary}>{booking.topic}</TextLabel></View><View style={[styles.statusPill, booking.status === 'Cancelled' && styles.statusPillCancelled]}><TextLabel size={9} color={booking.status === 'Cancelled' ? colors.red : colors.green} weight="700">{booking.status}</TextLabel></View></View>
            <View style={styles.bookingFacts}><View style={styles.fact}><CalendarDays size={13} color={colors.blue} /><TextLabel size={10} color={colors.secondary}>{booking.date}</TextLabel></View><View style={styles.fact}><Clock3 size={13} color={colors.blue} /><TextLabel size={10} color={colors.secondary}>{booking.time}</TextLabel></View></View>
            <View style={styles.bookingActions}>
              {booking.status === 'Upcoming' ? (
                <>
                  <Button compact label="Reschedule" variant="secondary" onPress={() => props.onNavigate('selectTime', mentor.id)} />
                  <Button compact label="Cancel" variant="ghost" onPress={() => props.onCancelBooking(booking.id)} />
                </>
              ) : (
                <Button compact label={booking.status === 'Cancelled' ? 'Book again' : 'View details'} variant="secondary" onPress={() => props.onNavigate('mentorProfile', mentor.id)} />
              )}
              {booking.status === 'Upcoming' ? <Button compact circle label="" accessibilityLabel={`Message ${mentor.name}`} icon={MessageCircle} variant="ghost" onPress={() => props.onNavigate('notifications')} /> : null}
            </View>
          </Card>
        );
      })}
      {filtered.length === 0 ? <EmptyNotice label={`No ${props.activeBookingsTab.toLowerCase()} bookings yet.`} /> : null}
      <Button label="Find a mentor" variant="secondary" onPress={() => props.onNavigate('explore')} />
    </View>
  );
}

function ProfileScreen(props: ScreenContentProps) {
  const [showSwitchHint, setShowSwitchHint] = useState(false);
  return (
    <View style={styles.page}>
      <View style={styles.profileAccount}>
        <View style={styles.selfAvatar}><TextLabel size={20} weight="800" color={colors.blue}>AS</TextLabel></View>
        <View style={{ flex: 1, marginLeft: 13 }}><TextLabel size={16} weight="800">Alex Morgan</TextLabel><TextLabel size={11} color={colors.secondary}>Learner · Member since 2024</TextLabel></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => setShowSwitchHint(true)} style={styles.editIcon}><UserRound size={17} color={colors.blue} /></Pressable>
      </View>
      {showSwitchHint ? <TextLabel size={11} color={colors.green} style={{ marginBottom: 12 }}>Your demo profile is ready to explore.</TextLabel> : null}
      <SectionTitle title="Your account" />
      <Card style={styles.menuCard}>
        <ListRow title="My bookings" subtitle="Upcoming and past sessions" icon={CalendarDays} onPress={() => props.onNavigate('profileBookings')} />
        <View style={styles.hairline} />
        <ListRow title="Liked profiles" subtitle={`${props.likedIds.length} mentors saved`} icon={Heart} onPress={() => props.onNavigate('likedProfiles')} />
        <View style={styles.hairline} />
        <ListRow title="Saved resources" subtitle="Articles and videos to revisit" icon={BookOpen} onPress={() => props.onNavigate('media', allMentors[0].id)} />
        <View style={styles.hairline} />
        <ListRow title="Reviews" subtitle="Share your learning experience" icon={Star} onPress={() => props.onNavigate('reviews', allMentors[0].id)} />
      </Card>
      <SectionTitle title="Preferences" />
      <Card style={styles.menuCard}>
        <ListRow title="Notifications" subtitle="Booking updates and messages" icon={Bell} onPress={() => props.onNavigate('profileNotifications')} />
        <View style={styles.hairline} />
        <ListRow title="Help & support" subtitle="We’re here to help" icon={HelpCircle} onPress={() => setShowSwitchHint(true)} />
        <View style={styles.hairline} />
        <ListRow title="Settings" subtitle="Account and privacy" icon={LockKeyhole} onPress={() => setShowSwitchHint(true)} />
      </Card>
      <Button label="Switch to mentor dashboard" icon={Briefcase} variant="secondary" onPress={() => { props.onRoleChange('mentor'); props.onNavigate('mentorDashboard'); }} />
      <Pressable accessibilityRole="button" onPress={() => props.onNavigate('welcome')} style={styles.signOut}>
        <TextLabel size={12} color={colors.red} weight="600">Sign out of demo</TextLabel>
      </Pressable>
    </View>
  );
}

function LikedProfilesScreen(props: ScreenContentProps) {
  const liked = allMentors.filter((mentor) => props.likedIds.includes(mentor.id));
  return (
    <View style={styles.page}>
      <TextLabel size={13} color={colors.secondary} style={{ marginBottom: 14 }}>Mentors you’ve saved for later.</TextLabel>
      {liked.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} onPress={() => props.onNavigate('mentorProfile', mentor.id)} onLike={() => props.onToggleLike(mentor.id)} liked />)}
      {liked.length === 0 ? <EmptyNotice label="You haven’t saved any mentors yet." /> : null}
      <Button label="Discover mentors" variant="secondary" onPress={() => props.onNavigate('explore')} />
    </View>
  );
}

function MentorDashboardScreen(props: ScreenContentProps) {
  const upcoming = props.bookings.filter((booking) => booking.status === 'Upcoming').length;
  return (
    <View style={styles.page}>
      <View style={styles.dashboardHeader}>
        <View style={styles.selfAvatar}><TextLabel size={17} weight="800" color={colors.blue}>RS</TextLabel></View>
        <View style={{ flex: 1, marginLeft: 11 }}><TextLabel size={16} weight="800">Hello, Rahul</TextLabel><TextLabel size={11} color={colors.secondary}>Ready to make an impact?</TextLabel></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => props.onNavigate('notifications')}><Bell size={18} color={colors.navy} /></Pressable>
      </View>
      <Card style={styles.earningsHero}>
        <TextLabel size={11} color="#E3ECFF">Your earnings this month</TextLabel>
        <TextLabel size={29} weight="800" color={colors.white} style={{ marginTop: 3 }}>$2,450</TextLabel>
        <TextLabel size={10} color="#D3E1FF" style={{ marginTop: 4 }}>↑ 12% from last month</TextLabel>
        <View style={styles.earningsHeroBottom}><TextLabel size={10} color={colors.white}>8 sessions completed</TextLabel><ArrowRight size={15} color={colors.white} /></View>
      </Card>
      <View style={styles.dashboardStats}>
        <MetricCard label="Upcoming" value={`${upcoming}`} sub="sessions" Icon={CalendarCheck} />
        <MetricCard label="Rating" value="4.9" sub="128 reviews" Icon={Star} />
      </View>
      <SectionTitle title="Quick actions" />
      <Card style={styles.menuCard}>
        <ListRow title="Manage availability" subtitle="Set your open days and time slots" icon={Clock3} onPress={() => props.onNavigate('availability')} />
        <View style={styles.hairline} />
        <ListRow title="Consultation requests" subtitle={`${props.requests.length} requests to review`} icon={UserRound} onPress={() => props.onNavigate('requests')} />
        <View style={styles.hairline} />
        <ListRow title="Earnings & reviews" subtitle="Track progress and learner feedback" icon={BarChart3} onPress={() => props.onNavigate('earnings')} />
      </Card>
      <SectionTitle title="Upcoming sessions" action="See all" onAction={() => props.onNavigate('bookings')} />
      <BookingPreview booking={props.bookings.find((booking) => booking.status === 'Upcoming')} onPress={() => props.onNavigate('bookings')} />
      <Button label="Preview learner experience" variant="secondary" onPress={() => { props.onRoleChange('learner'); props.onNavigate('home'); }} />
    </View>
  );
}

function MetricCard({ label, value, sub, Icon }: { label: string; value: string; sub: string; Icon: typeof Star }) {
  return <Card style={styles.metricCard}><View style={styles.metricIcon}><Icon size={15} color={colors.blue} /></View><TextLabel size={10} color={colors.secondary} style={{ marginTop: 8 }}>{label}</TextLabel><TextLabel size={19} weight="800">{value}</TextLabel><TextLabel size={10} color={colors.secondary}>{sub}</TextLabel></Card>;
}

function BookingPreview({ booking, onPress }: { booking?: Booking; onPress: () => void }) {
  if (!booking) return <EmptyNotice label="No upcoming sessions scheduled." />;
  const mentor = allMentors.find((person) => person.id === booking.mentorId) ?? allMentors[0];
  return (
    <Card style={{ marginBottom: 17 }}>
      <View style={styles.bookingTop}><Avatar mentor={mentor} size={43} /><View style={{ flex: 1, marginLeft: 10 }}><TextLabel size={12} weight="700">{mentor.name}</TextLabel><TextLabel size={10} color={colors.secondary}>{booking.date} · {booking.time}</TextLabel></View><ChevronRight size={15} color={colors.muted} /></View>
      <Button compact label="View session" variant="secondary" onPress={onPress} />
    </Card>
  );
}

function AvailabilityScreen(props: ScreenContentProps) {
  const [saved, setSaved] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(['9:00–10:00 AM', '10:00–11:00 AM']);
  const toggleSlot = (slot: string) => setSelectedSlots((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]);
  return (
    <View style={styles.page}>
      <TextLabel size={12} color={colors.secondary} style={{ marginBottom: 16 }}>Let learners know when you’re available for a conversation.</TextLabel>
      <SectionTitle title="Set weekly availability" />
      <Card style={{ marginBottom: 18 }}>
        {weekdays.map((item, index) => (
          <View key={item.day} style={styles.dayRow}>
            <View style={styles.dayName}><TextLabel size={12} weight="600">{item.day}</TextLabel><TextLabel size={10} color={colors.secondary}>{item.date} May</TextLabel></View>
            <View style={styles.dayToggle}><TextLabel size={10} color={props.availability[index] ? colors.green : colors.secondary}>{props.availability[index] ? 'Available' : 'Off'}</TextLabel><Switch value={props.availability[index]} onValueChange={() => props.onToggleAvailability(index)} trackColor={{ false: colors.border, true: colors.blue }} /></View>
          </View>
        ))}
      </Card>
      <SectionTitle title="Available time slots" action="Add a slot" onAction={() => toggleSlot('4:00–5:00 PM')} />
      <View style={styles.chipRow}>
        {['9:00–10:00 AM', '10:00–11:00 AM', '1:00–2:00 PM', '2:30–3:30 PM', '4:00–5:00 PM'].map((slot) => <Chip key={slot} label={slot} selected={selectedSlots.includes(slot)} onPress={() => toggleSlot(slot)} />)}
      </View>
      <View style={{ flex: 1, minHeight: 25 }} />
      {saved ? <TextLabel size={12} color={colors.green} weight="600" style={{ textAlign: 'center', marginBottom: 10 }}>Availability updated in this demo.</TextLabel> : null}
      <Button label="Save availability" onPress={() => setSaved(true)} />
    </View>
  );
}

function RequestsScreen(props: ScreenContentProps) {
  const visibleRequests = requestSeed.filter((request) => props.requests.includes(request.id));
  return (
    <View style={styles.page}>
      <TextLabel size={12} color={colors.secondary} style={{ marginBottom: 17 }}>Connect with learners who are ready to grow.</TextLabel>
      <SectionTitle title={`New requests (${visibleRequests.length})`} />
      {visibleRequests.map((request) => {
        const mentor = allMentors.find((person) => person.id === request.mentorId) ?? allMentors[0];
        return (
          <Card key={request.id} style={styles.requestCard}>
            <View style={styles.bookingTop}><Avatar mentor={mentor} size={46} /><View style={{ flex: 1, marginLeft: 10 }}><TextLabel size={13} weight="700">{mentor.name}</TextLabel><TextLabel size={10} color={colors.secondary}>Learner · {request.date}</TextLabel></View></View>
            <TextLabel size={12} weight="600" style={{ marginTop: 12 }}>{request.topic}</TextLabel>
            <TextLabel size={11} color={colors.secondary} style={{ marginTop: 4 }}>30-minute career consultation · Video call</TextLabel>
            <View style={styles.requestActions}>
              <Button compact label="Accept" icon={Check} onPress={() => props.onRequestDecision(request.id)} />
              <Button compact label="Decline" icon={X} variant="ghost" onPress={() => props.onRequestDecision(request.id)} />
            </View>
          </Card>
        );
      })}
      {visibleRequests.length === 0 ? <EmptyNotice label="You’re all caught up. New requests will show here." /> : null}
    </View>
  );
}

const earningsPeriods = {
  'This month': {
    total: '$2,450',
    trend: '↑ 12.8%',
    comparison: 'compared to last month',
    sessions: '8 sessions',
    range: 'May 1 – 31',
    chart: [45, 64, 52, 82, 58, 92, 68, 55, 77, 50, 87, 66],
  },
  'Last month': {
    total: '$2,173',
    trend: '↑ 8.2%',
    comparison: 'compared to April',
    sessions: '7 sessions',
    range: 'Apr 1 – 30',
    chart: [38, 54, 72, 46, 63, 81, 44, 72, 61, 88, 52, 70],
  },
  'All time': {
    total: '$8,640',
    trend: '54 sessions',
    comparison: 'earned while mentoring',
    sessions: 'Since Jan 2024',
    range: 'Jan – May',
    chart: [35, 49, 58, 74, 52, 86, 65, 77, 56, 91, 73, 99],
  },
};
const earningPeriodNames: (keyof typeof earningsPeriods)[] = ['This month', 'Last month', 'All time'];

function EarningsScreen(props: ScreenContentProps) {
  const [period, setPeriod] = useState<keyof typeof earningsPeriods>('This month');
  const summary = earningsPeriods[period];
  return (
    <View style={styles.page}>
      <Card style={styles.earningsCard}>
        <View style={styles.earningsTop}><View><TextLabel size={11} color={colors.secondary}>Total earnings</TextLabel><TextLabel size={27} weight="800" style={{ marginTop: 2 }}>{summary.total}</TextLabel></View><View style={styles.earningsIcon}><CircleDollarSign size={22} color={colors.blue} /></View></View>
        <View style={styles.earningsFooter}><TextLabel size={10} color={colors.green} weight="700">{summary.trend}</TextLabel><TextLabel size={10} color={colors.secondary}> {summary.comparison}</TextLabel><View style={{ flex: 1 }} /><TextLabel size={11} color={colors.secondary}>{summary.sessions}</TextLabel></View>
      </Card>
      <View style={styles.periodTabs}>
        {earningPeriodNames.map((item) => <Chip key={item} label={item} selected={period === item} onPress={() => setPeriod(item)} />)}
      </View>
      <SectionTitle title="Earnings overview" />
      <Card style={{ marginBottom: 18 }}>
        <View style={styles.chartHeader}><TextLabel size={12} weight="600">Session earnings</TextLabel><TextLabel size={10} color={colors.secondary}>{summary.range}</TextLabel></View>
        <View style={styles.chart}>
          {summary.chart.map((height, index) => <View key={index} style={styles.chartColumn}><View style={[styles.chartBar, { height }]} /><TextLabel size={8} color={colors.muted}>{['1','3','5','7','9','11','13','15','17','19','21','23'][index]}</TextLabel></View>)}
        </View>
        <View style={styles.chartLabels}><TextLabel size={9} color={colors.muted}>$0</TextLabel><TextLabel size={9} color={colors.muted}>$500</TextLabel><TextLabel size={9} color={colors.muted}>$1,000</TextLabel></View>
      </Card>
      <SectionTitle title="Recent activity" action="View all" onAction={() => props.onNavigate('bookings')} />
      {[
        { name: 'Rahul Sharma', amount: '+$49.00', time: 'Today · 10:30 AM', id: 'rahul-sharma' },
        { name: 'Priya Singh', amount: '+$39.00', time: 'May 08 · 2:00 PM', id: 'priya-singh' },
        { name: 'Amara Okafor', amount: '+$55.00', time: 'May 04 · 11:00 AM', id: 'amara-okafor' },
      ].map((item) => {
        const mentor = allMentors.find((person) => person.id === item.id) ?? allMentors[0];
        return <Card key={item.name} style={styles.activityCard}><Avatar mentor={mentor} size={40} /><View style={{ flex: 1, marginLeft: 10 }}><TextLabel size={12} weight="700">{item.name}</TextLabel><TextLabel size={10} color={colors.secondary}>{item.time}</TextLabel></View><TextLabel size={12} color={colors.green} weight="700">{item.amount}</TextLabel></Card>;
      })}
      <SectionTitle title="Recent reviews" />
      <Card style={styles.reviewCard}><Rating value={5} /><TextLabel size={12} color={colors.secondary} style={{ marginTop: 8 }}>“A genuinely helpful session that gave me a clear direction.”</TextLabel><TextLabel size={10} weight="600" style={{ marginTop: 7 }}>— Maya R.</TextLabel></Card>
    </View>
  );
}

function EmptyNotice({ label }: { label: string }) {
  return (
    <Card style={styles.emptyState}>
      <Sparkles size={21} color={colors.blue} />
      <TextLabel size={12} color={colors.secondary} style={{ textAlign: 'center', marginTop: 6 }}>{label}</TextLabel>
    </Card>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingTop: spacing.md, paddingBottom: spacing.md },
  welcome: { flex: 1, justifyContent: 'space-between', paddingTop: 28, paddingBottom: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  brandMarkSmall: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  welcomeArtwork: { height: 310, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 19, overflow: 'hidden', borderRadius: 26, backgroundColor: '#EEF4FF' },
  sunGlow: { position: 'absolute', width: 210, height: 210, borderRadius: 120, backgroundColor: '#D7E6FF', top: 22 },
  artWaves: { position: 'absolute', height: 100, bottom: 0, left: -18, right: -18, backgroundColor: '#DFEAF8', borderTopLeftRadius: 100, borderTopRightRadius: 115 },
  artMentor: { position: 'absolute', bottom: 0, width: '77%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  playBadge: { position: 'absolute', width: 49, height: 49, borderRadius: 28, backgroundColor: colors.blue, borderWidth: 4, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  welcomeCopy: { gap: 4 },
  auth: { flex: 1, justifyContent: 'center', paddingHorizontal: 1 },
  segmented: { minHeight: 43, flexDirection: 'row', padding: 4, backgroundColor: '#EEF2F7', borderRadius: 13, marginBottom: 19 },
  segment: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 35 },
  segmentActive: { backgroundColor: colors.white, shadowColor: '#22314D', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  forgotLink: { alignSelf: 'flex-end', paddingVertical: 5, marginTop: -8, marginBottom: 12 },
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  divider: { height: 1, backgroundColor: colors.border, flex: 1 },
  socialRow: { flexDirection: 'row', gap: 10 },
  onboardingHeading: { marginTop: 24, marginBottom: 32 },
  pathCard: { padding: 15, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 112, marginBottom: 14 },
  pathCardSelected: { borderColor: colors.blue, backgroundColor: '#F7FAFF' },
  pathIcon: { width: 47, height: 47, borderRadius: 15, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  pathIconSelected: { backgroundColor: colors.blue },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  iconButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: colors.red, right: 8, top: 7, borderWidth: 1, borderColor: colors.white },
  homeSearch: { minHeight: 48, backgroundColor: colors.white, borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 11 },
  searchInput: { flex: 1, fontSize: 12, color: colors.text, paddingVertical: 9 },
  horizontalChips: { gap: 7, paddingBottom: 19 },
  pageIntro: { marginBottom: 15 },
  resultCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  mentorCard: { backgroundColor: colors.white, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 13, marginBottom: 13 },
  featuredMentorCard: { paddingTop: 0, overflow: 'hidden' },
  mentorInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  mentorText: { flex: 1, gap: 3 },
  viewProfileLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mentorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  likeButton: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' },
  featuredBio: { marginTop: 10, marginBottom: 9 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 12 },
  trendingCard: { width: '48%', minHeight: 129, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 11 },
  learnBanner: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  playCircle: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 23, marginBottom: 14 },
  filterSection: { marginBottom: 22 },
  priceTrack: { height: 4, borderRadius: 3, backgroundColor: colors.border, marginTop: 22, marginBottom: 7 },
  priceTrackActive: { position: 'absolute', left: '16%', right: '24%', height: 4, backgroundColor: colors.blue },
  trackHandle: { position: 'absolute', left: '16%', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.white, borderWidth: 3, borderColor: colors.blue },
  priceRange: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 15 },
  filterButtons: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
  notificationCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, marginBottom: 9 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.blue },
  profileHero: { position: 'relative', marginHorizontal: -spacing.page, marginTop: -spacing.md },
  profileHeart: { position: 'absolute', right: 14, top: 13, width: 39, height: 39, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  profileSummary: { marginTop: -1, marginBottom: 20, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  profileStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16, marginBottom: 15, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  statCell: { alignItems: 'center', gap: 2 },
  hairline: { height: 1, backgroundColor: colors.border },
  videoCard: { position: 'relative', borderRadius: 17, overflow: 'hidden' },
  videoOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#142D5522' },
  videoPlay: { width: 49, height: 49, borderRadius: 25, backgroundColor: '#2468E8E8', alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  videoDuration: { position: 'absolute', right: 9, bottom: 9, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, backgroundColor: '#18253CC9' },
  videoGrid: { flexDirection: 'row', gap: 9, marginBottom: 20 },
  smallVideo: { flex: 1 },
  smallVideoArt: { height: 91, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  smallPlay: { position: 'absolute', right: 6, bottom: 6, width: 23, height: 23, borderRadius: 12, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  ratingOverview: { flexDirection: 'row', alignItems: 'center', gap: 19, paddingVertical: 19 },
  bigRating: { alignItems: 'center', gap: 4, width: 104 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingTrack: { flex: 1, height: 6, backgroundColor: '#EEF1F5', borderRadius: 4, overflow: 'hidden' },
  ratingFill: { height: 6, borderRadius: 4, backgroundColor: colors.orange },
  reviewSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  reviewCard: { marginBottom: 11 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  initialAvatar: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bookingMentor: { flexDirection: 'row', alignItems: 'center', marginBottom: 21 },
  dateList: { gap: 8, paddingBottom: 20 },
  datePill: { width: 54, height: 67, borderRadius: 13, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  datePillSelected: { backgroundColor: colors.blue, borderColor: colors.blue },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 20 },
  timeSlot: { width: '31%', minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  timeSlotSelected: { backgroundColor: colors.blue, borderColor: colors.blue },
  durationCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  durationIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  summaryLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  bookingSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailCard: { paddingVertical: 4, marginBottom: 20 },
  summaryRow: { minHeight: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  paymentOption: { minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.white, marginBottom: 9 },
  paymentOptionSelected: { borderColor: colors.blue, backgroundColor: '#F6F9FF' },
  paymentIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleBlue },
  radio: { width: 19, height: 19, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.blue },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.blue },
  secureNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  confirmedPage: { flex: 1, alignItems: 'stretch', justifyContent: 'center', paddingVertical: 26 },
  successIcon: { width: 68, height: 68, borderRadius: 35, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blue },
  confirmationCard: { width: '100%', marginTop: 23, marginBottom: 18, paddingVertical: 8 },
  confirmationMentor: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  bookingCard: { marginBottom: 12 },
  bookingTop: { flexDirection: 'row', alignItems: 'center' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15, backgroundColor: colors.paleGreen },
  statusPillCancelled: { backgroundColor: colors.paleRed },
  bookingFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 12, marginTop: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bookingActions: { flexDirection: 'row', gap: 7, paddingTop: 12, alignItems: 'center' },
  profileAccount: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, marginBottom: 23 },
  selfAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  editIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  menuCard: { paddingVertical: 4, marginBottom: 19 },
  signOut: { alignSelf: 'center', paddingVertical: 14 },
  dashboardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  earningsHero: { backgroundColor: colors.navy, borderColor: colors.navy, padding: 19, marginBottom: 13 },
  earningsHeroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11, marginTop: 10, borderTopWidth: 1, borderTopColor: '#FFFFFF35' },
  dashboardStats: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  metricCard: { flex: 1, padding: 12 },
  metricIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  dayRow: { minHeight: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  dayName: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  dayToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  requestCard: { marginBottom: 12 },
  requestActions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  earningsCard: { marginBottom: 14 },
  earningsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' },
  earningsFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  periodTabs: { flexDirection: 'row', gap: 7, marginBottom: 18 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  chart: { height: 111, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: colors.border },
  chartColumn: { flex: 1, alignItems: 'center', gap: 4 },
  chartBar: { width: '53%', backgroundColor: '#6C9AF4', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  activityCard: { flexDirection: 'row', alignItems: 'center', padding: 11, marginBottom: 8 },
});
