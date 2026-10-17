import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../../App';
import * as api from '../services/api';
import type { AppUser, Booking, Mentor } from '../data';

jest.mock('lucide-react-native', () => new Proxy({}, {
  get: () => () => null,
}));

jest.mock('../services/api', () => {
  const actual = jest.requireActual('../services/api');
  return {
    ...actual,
    apiRequest: jest.fn(),
    readAuthToken: jest.fn().mockResolvedValue(null),
    saveAuthToken: jest.fn().mockResolvedValue(undefined),
    clearAuthToken: jest.fn().mockResolvedValue(undefined),
  };
});

const apiRequestMock = jest.mocked(api.apiRequest);
const learner: AppUser = {
  id: '11',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  role: 'learner',
};
const mentor: Mentor = {
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
  bio: 'Career mentoring.',
  color: '#DCEAF3',
  skin: '#BB8067',
  hair: '#282C38',
  shirt: '#345778',
};
const booking: Booking = {
  id: 'booking-1',
  mentorId: mentor.id,
  mentor,
  scheduledAt: '2026-10-20T09:00:00.000Z',
  date: 'Tue, 20 Oct',
  time: '9:00 AM',
  status: 'Upcoming',
  topic: 'Career consultation',
  durationMinutes: 30,
  price: 49,
};

function setupApiMock() {
  apiRequestMock.mockImplementation(async <T,>(
    path: string,
    options?: Parameters<typeof api.apiRequest>[1],
  ): Promise<T> => {
    if (path === '/auth/register') {
      expect(options?.body).toEqual({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      });
      return { data: { user: learner, token: 'test-token' } } as T;
    }
    if (path === '/me/role') return { data: { ...learner, role: 'learner' } } as T;
    if (path.startsWith('/mentors?')) return { data: [mentor], meta: { current_page: 1, last_page: 1, total: 1 } } as T;
    if (path.startsWith('/bookings?')) return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } } as T;
    if (path === '/favorites') return { data: [] } as T;
    if (path.startsWith('/notifications')) return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } } as T;
    if (path === '/bookings' && options?.method === 'POST') {
      expect(options.body).toMatchObject({
        mentor_id: mentor.id,
        topic: 'Career consultation',
      });
      expect((options.body as { scheduled_at: string }).scheduled_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      return { data: booking } as T;
    }
    throw new Error(`Unexpected API request: ${path}`);
  });
}

describe('learner booking journey', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    jest.mocked(api.readAuthToken).mockResolvedValue(null);
    setupApiMock();
  });

  it('registers, selects a role, browses a mentor, and creates a persisted booking', async () => {
    await render(<App />);

    await fireEvent.press(screen.getByRole('button', { name: 'Get Started' }));
    await fireEvent.press(screen.getByText('Sign Up'));
    await fireEvent.changeText(screen.getByLabelText('Full name'), 'Alex Morgan');
    await fireEvent.changeText(screen.getByLabelText('Email address'), 'alex@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));

    await screen.findByText('Choose Your Path');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue as Learner' }));
    await screen.findByText('Good morning, Alex Morgan');

    await fireEvent.press(screen.getByRole('tab', { name: 'Explore' }));
    await screen.findByText('Explore mentors');
    await screen.findByText('1 mentors');
    await fireEvent.press(screen.getAllByLabelText("Open Rahul Sharma's profile")[0]);
    await screen.findByText('Senior Product Manager at TechFlow');
    await fireEvent.press(screen.getByRole('button', { name: 'Book consultation' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue to payment' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirm booking · $49.00' }));

    await screen.findByText('Consultation booked!');
    expect(apiRequestMock).toHaveBeenCalledWith('/bookings', expect.objectContaining({ method: 'POST' }));
  });

  it('shows server validation errors rather than proceeding with fake demo access', async () => {
    apiRequestMock.mockImplementation(async <T,>(path: string): Promise<T> => {
      if (path === '/auth/login') {
        throw new api.ApiError('The provided credentials are incorrect.', 422, {
          email: ['The provided credentials are incorrect.'],
        });
      }
      throw new Error(`Unexpected API request: ${path}`);
    });
    await render(<App />);

    await fireEvent.press(screen.getByRole('button', { name: 'Get Started' }));
    await fireEvent.changeText(screen.getByLabelText('Email address'), 'wrong@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
    await fireEvent.press(screen.getByRole('button', { name: 'Log In' }));

    await screen.findByText('The provided credentials are incorrect.');
    expect(screen.queryByText('Choose Your Path')).toBeNull();
  });

  it('restores the stored session and revokes it on sign out', async () => {
    jest.mocked(api.readAuthToken).mockResolvedValue('saved-token');
    apiRequestMock.mockImplementation(async <T,>(path: string): Promise<T> => {
      if (path === '/me') return { data: learner } as T;
      if (path.startsWith('/bookings?') || path.startsWith('/notifications?')) {
        return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } } as T;
      }
      if (path === '/favorites') return { data: [] } as T;
      if (path.startsWith('/mentors?')) {
        return { data: [mentor], meta: { current_page: 1, last_page: 1, total: 1 } } as T;
      }
      if (path === '/auth/logout') return { message: 'Signed out successfully.' } as T;
      throw new Error(`Unexpected API request: ${path}`);
    });

    await render(<App />);
    await screen.findByText('Good morning, Alex Morgan');
    expect(apiRequestMock).toHaveBeenCalledWith('/me');

    await fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    await screen.findByText('Welcome!');
    expect(apiRequestMock).toHaveBeenCalledWith('/auth/logout', expect.objectContaining({ method: 'POST' }));
    expect(api.clearAuthToken).toHaveBeenCalled();
  });
});
