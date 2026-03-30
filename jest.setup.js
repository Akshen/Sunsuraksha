jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 19.076, longitude: 72.877, accuracy: 20 },
  }),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue(null),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([{ city: 'Mumbai' }]),
  Accuracy: { Balanced: 3 },
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: true }) }) }),
      upsert: () => Promise.resolve({ error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  }),
}));
