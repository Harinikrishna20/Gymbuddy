import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
const SESSION_TOKEN_KEY = 'gymbooker-token';

const normalizeUser = (user) => ({
  id: user.id || user._id,
  fullName: user.name || user.fullName,
  email: user.email,
  role: user.role,
});

const normalizeClass = (classItem) => ({
  ...classItem,
  id: classItem._id || classItem.id,
  bookedSeats: classItem.bookedSeats ?? 0,
  availableSeats: classItem.availableSeats ?? Math.max(classItem.capacity - (classItem.bookedSeats ?? 0), 0),
});

const normalizeBooking = (booking) => {
  const populatedClass = booking.gymClass && typeof booking.gymClass === 'object'
    ? normalizeClass(booking.gymClass)
    : null;
  const status = booking.bookingStatus || booking.status;

  return {
    ...booking,
    id: booking._id || booking.id,
    memberId: booking.user?._id || booking.user,
    classId: populatedClass?.id || booking.gymClass,
    gymClass: populatedClass,
    status: status === 'confirmed' ? 'upcoming' : status,
  };
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const fetchClasses = async () => {
  const response = await api.get('/classes');
  return response.data.data.map(normalizeClass);
};

const fetchUserData = async (role) => {
  if (role === 'admin') {
    const [dashboardResponse, bookingsResponse] = await Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/bookings'),
    ]);

    return {
      bookings: [],
      adminBookings: bookingsResponse.data.data,
      dashboardStats: dashboardResponse.data.data,
    };
  }

  const response = await api.get('/bookings/my');
  return {
    bookings: response.data.data.map(normalizeBooking),
    adminBookings: [],
    dashboardStats: null,
  };
};

export function AuthProvider({ children }) {
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshClasses = async () => {
    setClassesLoading(true);
    setClassesError('');

    try {
      setClasses(await fetchClasses());
    } catch (error) {
      setClassesError(getErrorMessage(error, 'Unable to load classes from the server.'));
    } finally {
      setClassesLoading(false);
    }
  };

  const refreshUserData = async (role) => {
    setDataLoading(true);
    setDataError('');

    try {
      const result = await fetchUserData(role);
      setBookings(result.bookings);
      setAdminBookings(result.adminBookings);
      setDashboardStats(result.dashboardStats);
    } catch (error) {
      setDataError(getErrorMessage(error, 'Unable to load account data from the server.'));
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      try {
        const loadedClasses = await fetchClasses();
        if (isActive) setClasses(loadedClasses);
      } catch (error) {
        if (isActive) setClassesError(getErrorMessage(error, 'Unable to load classes from the server.'));
      } finally {
        if (isActive) setClassesLoading(false);
      }

      const token = localStorage.getItem(SESSION_TOKEN_KEY);
      if (token) {
        try {
          const profileResponse = await api.get('/users/profile');
          const sessionUser = normalizeUser(profileResponse.data.data);
          const userData = await fetchUserData(sessionUser.role);

          if (isActive) {
            setUser(sessionUser);
            setBookings(userData.bookings);
            setAdminBookings(userData.adminBookings);
            setDashboardStats(userData.dashboardStats);
          }
        } catch (error) {
          if (error.response?.status === 401) localStorage.removeItem(SESSION_TOKEN_KEY);
          if (isActive) setDataError(getErrorMessage(error, 'Unable to restore your account session.'));
        }
      }

      if (isActive) setAuthLoading(false);
    };

    initialize();
    return () => {
      isActive = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const sessionUser = normalizeUser(response.data.data.user);
      localStorage.setItem(SESSION_TOKEN_KEY, response.data.data.token);
      setUser(sessionUser);
      await refreshUserData(sessionUser.role);
      return { success: true, user: sessionUser };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to log in. Please try again.') };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/auth/register', { name: fullName, email, password });
      const sessionUser = normalizeUser(response.data.data.user);
      localStorage.setItem(SESSION_TOKEN_KEY, response.data.data.token);
      setUser(sessionUser);
      await refreshUserData(sessionUser.role);
      return { success: true, user: sessionUser };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to create your account. Please try again.') };
    }
  };

  const addBooking = async (classId) => {
    if (!user) return { success: false, message: 'Please log in to book a class.' };

    try {
      await api.post('/bookings', { gymClassId: classId });
      await Promise.all([refreshClasses(), refreshUserData(user.role)]);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to book this class.') };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      await Promise.all([refreshClasses(), refreshUserData(user.role)]);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to cancel this booking.') };
    }
  };

  const addClass = async (newClass) => {
    try {
      await api.post('/classes', newClass);
      await refreshClasses();
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to create this class.') };
    }
  };

  const updateClass = async (classId, updatedClass) => {
    try {
      await api.put(`/classes/${classId}`, updatedClass);
      await refreshClasses();
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to update this class.') };
    }
  };

  const deleteClass = async (classId) => {
    try {
      await api.delete(`/classes/${classId}`);
      await refreshClasses();
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Unable to delete this class.') };
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    setUser(null);
    setBookings([]);
    setAdminBookings([]);
    setDashboardStats(null);
  };

  const value = {
    user,
    classes,
    classesLoading,
    classesError,
    bookings,
    adminBookings,
    dashboardStats,
    dataLoading,
    dataError,
    authLoading,
    login,
    register,
    addBooking,
    cancelBooking,
    addClass,
    updateClass,
    deleteClass,
    refreshClasses,
    refreshUserData,
    logout,
    isAdmin: user?.role === 'admin',
    isLoggedIn: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
