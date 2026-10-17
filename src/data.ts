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
  date: string;
  time: string;
  status: 'Upcoming' | 'Past' | 'Cancelled';
  topic: string;
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

export const mentors: Mentor[] = [
  {
    id: 'rahul-sharma',
    name: 'Rahul Sharma',
    initials: 'RS',
    role: 'Senior Product Manager',
    company: 'TechFlow',
    experience: '12 years experience',
    rating: 4.9,
    reviews: 128,
    price: 49,
    skills: ['Technology', 'Career', 'Product'],
    availableThisWeek: true,
    bio: 'I help early-career professionals find clarity, build confidence, and take their next big career step. Currently leading product at TechFlow.',
    color: '#DCEAF3',
    skin: '#BB8067',
    hair: '#282C38',
    shirt: '#345778',
  },
  {
    id: 'priya-singh',
    name: 'Priya Singh',
    initials: 'PS',
    role: 'Growth Marketing Lead',
    company: 'Brightside',
    experience: '8 years experience',
    rating: 4.8,
    reviews: 96,
    price: 39,
    skills: ['Marketing', 'Business', 'Career'],
    availableThisWeek: true,
    bio: 'Growth strategist helping ambitious teams turn good ideas into measurable impact. Let’s make your next move a confident one.',
    color: '#F5E8E3',
    skin: '#D39A79',
    hair: '#392A26',
    shirt: '#A96F7F',
  },
  {
    id: 'amara-okafor',
    name: 'Amara Okafor',
    initials: 'AO',
    role: 'UX Design Director',
    company: 'Northstar',
    experience: '10 years experience',
    rating: 5.0,
    reviews: 74,
    price: 55,
    skills: ['Design', 'Technology', 'Career'],
    availableThisWeek: false,
    bio: 'Design leader, creative problem solver, and mentor. I’m passionate about helping designers grow their craft and find their voice.',
    color: '#EFE7F5',
    skin: '#8D5745',
    hair: '#252330',
    shirt: '#655A9C',
  },
  {
    id: 'vikas-saxena',
    name: 'Vikas Saxena',
    initials: 'VS',
    role: 'Finance Director',
    company: 'Apex Partners',
    experience: '15 years experience',
    rating: 4.9,
    reviews: 112,
    price: 59,
    skills: ['Finance', 'Business', 'Career'],
    availableThisWeek: true,
    bio: 'Finance leader and lifelong learner. I help future leaders strengthen their commercial skills and navigate the world of business.',
    color: '#E5EBE5',
    skin: '#C28E70',
    hair: '#33302D',
    shirt: '#527A70',
  },
  {
    id: 'neha-gupta',
    name: 'Neha Gupta',
    initials: 'NG',
    role: 'People & Culture Partner',
    company: 'PeopleFirst',
    experience: '7 years experience',
    rating: 4.9,
    reviews: 63,
    price: 42,
    skills: ['Business', 'Career', 'Leadership'],
    availableThisWeek: false,
    bio: 'People partner, empathetic listener, and career coach. I support thoughtful career changes and confident interview preparation.',
    color: '#F4EBDD',
    skin: '#CF9478',
    hair: '#352924',
    shirt: '#C17B49',
  },
  {
    id: 'daniel-lee',
    name: 'Daniel Lee',
    initials: 'DL',
    role: 'Software Engineering Manager',
    company: 'CloudNine',
    experience: '11 years experience',
    rating: 4.7,
    reviews: 89,
    price: 45,
    skills: ['Technology', 'Leadership', 'Career'],
    availableThisWeek: true,
    bio: 'Engineering manager focused on helping software developers grow into confident technical leaders.',
    color: '#E5EAF5',
    skin: '#E0B69C',
    hair: '#30343B',
    shirt: '#586DA4',
  },
];

export const initialBookings: Booking[] = [
  {
    id: 'booking-1',
    mentorId: 'rahul-sharma',
    date: 'Tue, 14 May',
    time: '10:30 AM',
    status: 'Upcoming',
    topic: 'Career consultation',
  },
  {
    id: 'booking-2',
    mentorId: 'priya-singh',
    date: 'Mon, 06 May',
    time: '2:00 PM',
    status: 'Past',
    topic: 'Growth marketing career',
  },
  {
    id: 'booking-3',
    mentorId: 'amara-okafor',
    date: 'Fri, 19 Apr',
    time: '11:00 AM',
    status: 'Past',
    topic: 'Portfolio review',
  },
];

export const notifications = [
  { id: 'n-1', name: 'Rahul Sharma', avatarId: 'rahul-sharma', text: 'Your upcoming session is confirmed.', time: '2 min ago', kind: 'Booking' },
  { id: 'n-2', name: 'Priya Singh', avatarId: 'priya-singh', text: 'shared a new career tip with you.', time: '1 hour ago', kind: 'Updates' },
  { id: 'n-3', name: 'Amara Okafor', avatarId: 'amara-okafor', text: 'accepted your mentorship request.', time: 'Yesterday', kind: 'Booking' },
  { id: 'n-4', name: 'Daniel Lee', avatarId: 'daniel-lee', text: 'has a new video about growing your career.', time: 'Yesterday', kind: 'Messages' },
  { id: 'n-5', name: 'Experience Connect', avatarId: 'rahul-sharma', text: 'Your weekly learning roundup is ready.', time: '2 days ago', kind: 'Updates' },
];

export const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:30 PM', '2:30 PM', '4:00 PM'];

export const weekdays = [
  { day: 'Mon', date: 13 },
  { day: 'Tue', date: 14 },
  { day: 'Wed', date: 15 },
  { day: 'Thu', date: 16 },
  { day: 'Fri', date: 17 },
  { day: 'Sat', date: 18 },
  { day: 'Sun', date: 19 },
];

export const requestSeed = [
  { id: 'booking-request-2', mentorId: 'priya-singh', date: 'Today, 2:00 PM', topic: 'Breaking into growth marketing' },
  { id: 'booking-request-3', mentorId: 'amara-okafor', date: 'Tomorrow, 11:30 AM', topic: 'Portfolio feedback & next steps' },
];
