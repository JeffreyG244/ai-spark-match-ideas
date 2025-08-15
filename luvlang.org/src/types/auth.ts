
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}
