import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { googleLogout } from '@react-oauth/google';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

export interface SelectedFile {
  id: string;
  name: string;
  url: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedFiles: SelectedFile[];
  hasSelectedFiles: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setSelectedFiles: (files: SelectedFile[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));

        // Load selected files from localStorage if available
        const storedFiles = localStorage.getItem('selectedFiles');
        if (storedFiles) {
          setSelectedFiles(JSON.parse(storedFiles));
        }
      } catch (error) {
        console.error('Failed to parse stored data', error);
        localStorage.removeItem('user');
        localStorage.removeItem('selectedFiles');
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('selectedFiles');
    }
  }, [user]);

  // Update localStorage when selected files change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      localStorage.setItem('selectedFiles', JSON.stringify(selectedFiles));
    } else if (user) {
      // Only remove if we're logged in but have no files
      localStorage.removeItem('selectedFiles');
    }
  }, [selectedFiles, user]);

  const logout = () => {
    // Use Google's logout functionality
    googleLogout();

    // Revoke token if we have one
    if (user?.accessToken) {
      // This helps to properly revoke access tokens
      fetch(`https://oauth2.googleapis.com/revoke?token=${user.accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).catch((error) => {
        console.error('Error revoking token:', error);
      });
    }

    // Clear user from state and localStorage
    setUser(null);
    setSelectedFiles([]);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedFiles');

    // Redirect to login page (will happen automatically due to route protection)
    console.log('Logged out successfully');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    selectedFiles,
    hasSelectedFiles: selectedFiles.length > 0,
    setUser,
    logout,
    setSelectedFiles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
