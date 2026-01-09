// Auth Feature - Re-exports from current locations
// TODO: Move files here physically later

// Pages
export { default as Login } from '../../pages/Login';
export { default as Register } from '../../pages/Register';
export { default as Profile } from '../../pages/Profile';

// Components
export { default as ProtectedRoute } from '../../components/auth/ProtectedRoute';
export { default as PulperiaRoute } from '../../components/auth/PulperiaRoute';

// Store
export { useAuthStore } from '../../stores/authStore';

// API
export { userApi } from '../../api/auth';
