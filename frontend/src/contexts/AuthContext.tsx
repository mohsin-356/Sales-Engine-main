import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types/user';
import { api } from '@/lib/api';


// Using shared User type from '@/types/user'

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  handleLogout: () => void;
  isAuthenticated: boolean;
  users: User[];
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateUser: (user: User) => void;
  switchUser: (id: string, password: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Start unauthenticated

  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = async () => {
    const rows = await api.get('/users');
    const mapped: User[] = (rows || []).map((row: any) => ({
      id: String(row.id),
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      joinDate: row.join_date,
    }));
    setUsers(mapped);
  };

  // Load users from backend MySQL
  useEffect(() => {
    refreshUsers().catch(console.error);
  }, []);

  const login = async (email: string, password: string) => {
    // Use absolute backend URL as requested; login route only
    const res = await fetch('https://api.mindspire.org/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, email, password })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Invalid credentials');
    }
    const resp = await res.json();
    if (!resp?.user) throw new Error('Invalid credentials');
    const u: User = {
      id: String(resp.user.id),
      name: resp.user.name,
      email: resp.user.email,
      role: resp.user.role,
      status: resp.user.status,
      joinDate: resp.user.joinDate,
    } as User;
    setUser(u);
  };

  const logout = async () => {
    try { await api.post('/auth/logout', {}); } catch {}
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    setUser(updated);
  };

  const addUser = async (newUser: User) => {
    const payload = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      joinDate: newUser.joinDate,
      password: (newUser as any).password || '',
    };
    const row = await api.post('/users', payload);
    const inserted: User = {
      id: String(row.id),
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      joinDate: row.join_date,
    } as User;
    setUsers(prev => [...prev, inserted]);
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout().catch(error => {
      console.error('Logout failed:', error);
    });
  };

  const switchUser = (id: string, password: string) => {
    const found = users.find(u=>u.id===id);
    if(found){
      setUser(found);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      handleLogout,
      users,
      addUser,
      deleteUser,
      updateUser,
      switchUser,
      // not in interface earlier; but we can still keep available through context object
      // @ts-ignore
      refreshUsers,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};