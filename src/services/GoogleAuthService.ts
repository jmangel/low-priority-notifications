import { User } from '../types/user';

// Google API scopes we need
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Limited access to specific files only
  'https://www.googleapis.com/auth/drive.readonly', // Read-only access to Drive files
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

// Interface for Google OAuth token response
interface TokenResponse {
  access_token: string;
  error?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Interface for the file selection result
export interface FileSelectionResult {
  fileIds: string[];
  fileNames: string[];
  fileUrls: string[];
}

// Function to load the Google Identity Services library
const loadGoogleIdentityServices = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Function to load the Google API client (for Drive API and Picker)
const loadGoogleApiClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client:picker', () => {
        window.gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_PICKER_API_KEY,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            ],
          })
          .then(resolve)
          .catch(reject);
      });
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Function to load the Google Picker script
const loadGooglePickerScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.picker) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js?onload=onApiLoad';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Add a global onApiLoad function that the Google Picker API expects
      window.onApiLoad = () => {
        if (window.gapi) {
          window.gapi.load('picker', {
            callback: resolve,
            onerror: reject,
          });
        } else {
          reject(new Error('Google API not loaded'));
        }
      };
      // Manually trigger onApiLoad if needed
      if (window.gapi && window.gapi.load) {
        window.gapi.load('picker', {
          callback: resolve,
          onerror: reject,
        });
      }
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Main function to load all required Google libraries
export const loadGoogleApi = async (): Promise<void> => {
  try {
    // Load all libraries in sequence for better reliability
    await loadGoogleIdentityServices();
    await loadGoogleApiClient();
    await loadGooglePickerScript();
    console.log('Google APIs loaded successfully');
  } catch (error) {
    console.error('Error loading Google APIs:', error);
    throw error;
  }
};

// Function to authenticate with Google using the new Identity Services
export const authenticateWithGoogle = async (): Promise<User> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.google || !window.google.accounts) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      // Configure Google Identity Services
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
        scope: SCOPES.join(' '),
        callback: async (tokenResponse: TokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }

          try {
            // Use the access token to get user info
            const accessToken = tokenResponse.access_token;
            const response = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to fetch user info');
            }

            const userInfo = await response.json();

            const user: User = {
              id: userInfo.sub,
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture,
              accessToken: accessToken,
            };

            resolve(user);
          } catch (error) {
            console.error('Error fetching user info:', error);
            reject(error);
          }
        },
      });

      // Request an access token
      client.requestAccessToken();
    } catch (error: any) {
      console.error('Error during Google authentication:', error);

      if (error.error === 'popup_closed_by_user') {
        reject(
          new Error(
            'Authentication cancelled. Please try again and complete the sign-in process.'
          )
        );
      } else if (error.error === 'popup_blocked_by_browser') {
        reject(
          new Error(
            'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.'
          )
        );
      } else if (error.error === 'access_denied') {
        reject(
          new Error(
            'You denied the app permission to access your Google account. Please try again and allow access.'
          )
        );
      } else {
        reject(new Error('Failed to authenticate with Google'));
      }
    }
  });
};

// Function to create and show the Google Picker
export const showGooglePicker = (
  accessToken: string
): Promise<FileSelectionResult> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.google || !window.google.picker) {
        reject(
          new Error(
            'Google Picker not loaded. Please refresh the page and try again.'
          )
        );
        return;
      }

      // Try to create folder and file views
      // DB Files View
      const dbView = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes(
          'application/x-sqlite3,.db,.sqlite,.sqlite3,application/vnd.sqlite3'
        )
        .setMode(window.google.picker.DocsViewMode.LIST)
        .setLabel('Database Files');

      // General Files View as fallback
      const allFilesView =
        new window.google.picker.DocsView().setIncludeFolders(true);

      // Folder selection view
      const folderView = new window.google.picker.DocsView(
        window.google.picker.ViewId.FOLDERS
      )
        .setSelectFolderEnabled(true)
        .setLabel('Folders');

      // Create the picker
      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .addView(dbView)
        .addView(folderView)
        .addView(allFilesView) // Fallback view for all files
        .setOAuthToken(accessToken)
        .setDeveloperKey(process.env.REACT_APP_GOOGLE_PICKER_API_KEY)
        .setTitle('Select Database Files or a Folder')
        .setCallback((data: google.picker.PickerData) => {
          if (data.action === window.google.picker.Action.PICKED) {
            console.log('Files selected:', data.docs);

            const fileIds = data.docs.map((doc: any) => doc.id);
            const fileNames = data.docs.map((doc: any) => doc.name);
            const fileUrls = data.docs.map((doc: any) => doc.url);

            // Return more complete info about the selections
            resolve({
              fileIds,
              fileNames,
              fileUrls,
            });
          } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log('File picker cancelled');
            resolve({ fileIds: [], fileNames: [], fileUrls: [] });
          }
        })
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error('Error showing Google Picker:', error);
      reject(error);
    }
  });
};
