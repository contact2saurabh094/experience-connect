export type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  experience: string;
  rating: number;
  reviews: number;
  price: number;
  skills: string[];
  availableThisWeek: boolean;
  bio: string;
  color: string;
  skin: string;
  hair: string;
  shirt: string;
};

export type Booking = {
  id: string;
  mentorId: string;
  mentor?: Mentor;
  learner?: { id: string; name: string };
  scheduledAt: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Pending' | 'Past' | 'Cancelled';
  topic: string;
  durationMinutes: number;
  price: number;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'mentor';
};

export type AppNotification = {
  id: string;
  name: string;
  avatarId: string | null;
  text: string;
  time: string;
  kind: string;
  read: boolean;
};

export type AvailabilityDay = {
  dayOfWeek: number;
  available: boolean;
  slots: { start: string; end: string }[];
};

export type MentorDashboard = {
  upcomingCount: number;
  pendingCount: number;
  completedCount: number;
  rating: number;
  reviews: number;
  earningsThisMonth: number;
  earningsAllTime: number;
  earningsLastMonth: number;
  upcoming: Booking[];
  recentReviews: MentorReview[];
};

export type MentorReview = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  text: string;
  time: string;
  verified: boolean;
};

export type MentorMedia = {
  id: string;
  kind: 'video' | 'article';
  title: string;
  description: string;
  duration: string | null;
  coverColor: string;
  url: string | null;
};

export const categories = [
  'All',
  'Technology',
  'Business',
  'Marketing',
  'Finance',
  'Design',
  'Career',
];

export const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:30 PM', '2:30 PM', '4:00 PM'];

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startDate = new Date();
startDate.setDate(startDate.getDate() + 1);

export const weekdays = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + index);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const dayOfMonth = `${date.getDate()}`.padStart(2, '0');
  return {
    day: weekdayLabels[date.getDay()],
    date: date.getDate(),
    isoDate: `${year}-${month}-${dayOfMonth}`,
  };
});
