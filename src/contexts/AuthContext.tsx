import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Define the scopes we need - read-only access to drive files
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  hasDriveAccess: boolean;
  targetFolderId: string | null;
  selectFolder: () => Promise<void>;
  isFolderSelected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDriveAccess, setHasDriveAccess] = useState<boolean>(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);
  const [isFolderSelected, setIsFolderSelected] = useState<boolean>(false);

  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        // Load the auth2 library
        await new Promise<void>((resolve) => {
          gapi.load('client:auth2', resolve);
        });

        // Initialize the Google API client
        await gapi.client.init({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: SCOPES.join(' '),
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          ],
        });

        // Check if user is already signed in
        const authInstance = gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();
        setIsAuthenticated(isSignedIn);

        // Listen for sign-in state changes
        authInstance.isSignedIn.listen((signedIn: boolean) => {
          setIsAuthenticated(signedIn);
          if (!signedIn) {
            setHasDriveAccess(false);
            setTargetFolderId(null);
            setIsFolderSelected(false);
          }
        });

        // If user is signed in, check if they have Drive access
        if (isSignedIn) {
          setHasDriveAccess(true);

          // Check if we have a stored folder ID in localStorage
          const storedFolderId = localStorage.getItem(
            'googleDriveTargetFolderId'
          );
          if (storedFolderId) {
            setTargetFolderId(storedFolderId);
            setIsFolderSelected(true);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Google auth:', err);
        setError('Failed to initialize Google authentication');
        setIsLoading(false);
      }
    };

    // Load the Google API client
    const loadGoogleAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        // Load the picker API
        gapi.load('picker', () => {
          // Also load the Google Picker script
          const pickerScript = document.createElement('script');
          pickerScript.src =
            'https://apis.google.com/js/api.js?onload=onApiLoad';
          document.body.appendChild(pickerScript);
        });
        initGoogleAuth();
      };
      script.onerror = () => {
        setError('Failed to load Google API');
        setIsLoading(false);
      };
      document.body.appendChild(script);
      return script;
    };

    const script = loadGoogleAPI();

    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn({
        scope: SCOPES.join(' '),
      });

      setHasDriveAccess(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in with Google');
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(() => {
      setIsAuthenticated(false);
      setHasDriveAccess(false);
      setTargetFolderId(null);
      setIsFolderSelected(false);
      localStorage.removeItem('googleDriveTargetFolderId');
    });
  };

  const selectFolder = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setIsLoading(true);

        // Create a folder picker view
        const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS);
        view.setMimeTypes('application/vnd.google-apps.folder');
        view.setSelectFolderEnabled(true);

        // Create the picker
        const picker = new google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(gapi.auth.getToken().access_token)
          .setDeveloperKey(process.env.REACT_APP_GOOGLE_PICKER_API_KEY)
          .setCallback((data: google.picker.PickerData) => {
            if (data.action === google.picker.Action.PICKED) {
              const folder = data.docs[0];
              setTargetFolderId(folder.id);
              setIsFolderSelected(true);

              // Store the selected folder ID in localStorage
              localStorage.setItem('googleDriveTargetFolderId', folder.id);
              setIsLoading(false);
              resolve();
            } else if (data.action === google.picker.Action.CANCEL) {
              setIsLoading(false);
              resolve();
            }
          })
          .build();

        picker.setVisible(true);
      } catch (err) {
        console.error('Error selecting folder:', err);
        setError('Failed to open folder picker');
        setIsLoading(false);
        reject(err);
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        hasDriveAccess,
        targetFolderId,
        selectFolder,
        isFolderSelected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
