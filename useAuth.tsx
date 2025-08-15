cat << 'EOF' > src/hooks/useAuth.tsx
import { createContext, useContext, ReactNode } from 'react';

type AuthContextValue = {
  user: null | { id: string };
};

const AuthContext = createContext<AuthContextValue>({ user: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={{ user: null }}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
EOF
