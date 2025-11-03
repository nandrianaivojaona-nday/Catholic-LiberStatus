import React, { createContext, useState, useContext, ReactNode } from 'react';
import { mockData } from '../data/mockData';
import { User } from '../types';
import LoginModal from '../components/LoginModal';

interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const signIn = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    // In a real app, this would be an API call.
    const user = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser({ ...user, fullName: user.username });
      closeLoginModal();
      return { success: true };
    }
    return { success: false, error: 'loginModal.invalidCredentials' };
  };

  const signOut = () => {
    setCurrentUser(null);
    window.location.hash = '/';
  };

  return (
    <AuthContext.Provider value={{ currentUser, signIn, signOut, openLoginModal }}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
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