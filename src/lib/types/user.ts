export type UserRole = "USER" | "ADMIN" | "MODERATOR";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_verified: boolean;
  verified_at?: string; // ISO date string or null
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface UserExistsResponse {
  email: string;
  exists: boolean;
  role?: UserRole; // Use the UserRole type
}
