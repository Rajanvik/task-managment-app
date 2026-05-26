export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Login {
  email: string;
  password?: string;
}

export interface Register {
  email: string;
  password?: string;
  name?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken?: string;
  user: User;
}
