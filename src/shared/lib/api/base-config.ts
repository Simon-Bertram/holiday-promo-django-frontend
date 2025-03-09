// Create a base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const endpoints = {
  // Dashboard endpoints
  userCount: `${API_BASE_URL}/api/dashboard/user-count`,

  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login/`,
  requestMagicCode: `${API_BASE_URL}/api/auth/magic-code/request/`,
  verifyMagicCode: `${API_BASE_URL}/api/auth/magic-code/verify/`,
  adminLogin: `${API_BASE_URL}/api/auth/admin-login/`,
  register: `${API_BASE_URL}/api/auth/register/`,
  logout: `${API_BASE_URL}/api/auth/logout/`,
  refresh: `${API_BASE_URL}/api/auth/refresh/`,
  checkUserExists: `${API_BASE_URL}/api/auth/check-user/`,

  // User endpoints
  getCurrentUser: `${API_BASE_URL}/api/user/me/`,
  updateUser: `${API_BASE_URL}/api/user/me/`,
  deleteAccount: `${API_BASE_URL}/api/user/delete/`,

  // Admin user management endpoints
  listUsers: `${API_BASE_URL}/api/admin/users/`,
  deleteUser: `${API_BASE_URL}/api/admin/users/`,
};
