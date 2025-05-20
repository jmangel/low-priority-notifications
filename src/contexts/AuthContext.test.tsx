import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Properly declare and set up mock for gapi
const mockGapi = {
  load: jest.fn((api, callback) => {
    callback();
  }),
  client: {
    init: jest.fn().mockResolvedValue({}),
    drive: {
      files: {
        get: jest.fn().mockResolvedValue({}),
        list: jest.fn().mockResolvedValue({ result: { files: [] } }),
      },
    },
  },
  auth2: {
    getAuthInstance: jest.fn().mockReturnValue({
      isSignedIn: {
        get: jest.fn().mockReturnValue(false),
        listen: jest.fn(),
      },
      signIn: jest.fn().mockResolvedValue({}),
      signOut: jest.fn().mockResolvedValue({}),
    }),
  },
  auth: {
    getToken: jest.fn().mockReturnValue({ access_token: 'mock-token' }),
  },
};

// Set gapi in the global scope
(global as any).gapi = mockGapi;

// Mock the google picker API
(global as any).google = {
  picker: {
    Action: {
      PICKED: 'picked',
      CANCEL: 'cancel',
    },
    ViewId: {
      FOLDERS: 'folders',
    },
    DocsView: jest.fn().mockImplementation(() => ({
      setMimeTypes: jest.fn().mockReturnThis(),
      setSelectFolderEnabled: jest.fn().mockReturnThis(),
    })),
    PickerBuilder: jest.fn().mockImplementation(() => ({
      addView: jest.fn().mockReturnThis(),
      setOAuthToken: jest.fn().mockReturnThis(),
      setDeveloperKey: jest.fn().mockReturnThis(),
      setCallback: jest.fn((callback) => {
        // Store the callback for later use in tests
        (global as any).mockPickerCallback = callback;
        return {
          build: jest.fn().mockReturnValue({
            setVisible: jest.fn(),
          }),
        };
      }),
    })),
  },
};

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Create a test component that uses the useAuth hook
const TestComponent = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    isFolderSelected,
    targetFolderId,
    selectFolder,
  } = useAuth();
  return (
    <div>
      <div data-testid="loading-state">{isLoading.toString()}</div>
      <div data-testid="auth-state">{isAuthenticated.toString()}</div>
      <div data-testid="error-state">{error || 'no error'}</div>
      <div data-testid="folder-selected">{isFolderSelected.toString()}</div>
      <div data-testid="folder-id">{targetFolderId || 'no folder'}</div>
      <button onClick={selectFolder} data-testid="select-folder-btn">
        Select Folder
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the document.createElement and appendChild methods
    const originalCreateElement = document.createElement;
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'script') {
        const scriptElement = {
          src: '',
          onload: jest.fn(),
          onerror: jest.fn(),
        };
        setTimeout(() => scriptElement.onload(), 0);
        return scriptElement;
      }
      return originalCreateElement(tagName);
    });

    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Clear localStorage mock
    mockLocalStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('provides authentication state to consumers', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially, it should be loading
    expect(screen.getByTestId('loading-state').textContent).toBe('true');

    // Wait for loading to complete
    await screen.findByText('false', { exact: true });

    // After loading, check auth state (false in this mock)
    expect(screen.getByTestId('auth-state').textContent).toBe('false');
    expect(screen.getByTestId('error-state').textContent).toBe('no error');
    expect(screen.getByTestId('folder-selected').textContent).toBe('false');
    expect(screen.getByTestId('folder-id').textContent).toBe('no folder');
  });

  test('loads folder from localStorage if available', async () => {
    // Setup localStorage with a folder ID
    mockLocalStorage.setItem('googleDriveTargetFolderId', 'stored-folder-id');

    // Also make authentication return true
    mockGapi.auth2.getAuthInstance().isSignedIn.get.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await screen.findByText('false', { exact: true });

    // Check if the folder was loaded from localStorage
    expect(screen.getByTestId('folder-selected').textContent).toBe('true');
    expect(screen.getByTestId('folder-id').textContent).toBe(
      'stored-folder-id'
    );
  });

  test('allows selecting a folder through the Google Picker', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await screen.findByText('false', { exact: true });

    // Click the select folder button
    fireEvent.click(screen.getByTestId('select-folder-btn'));

    // Wait for the Picker to be initialized
    await waitFor(() => {
      expect(google.picker.PickerBuilder).toHaveBeenCalled();
    });

    // Simulate the user selecting a folder using the Picker
    (global as any).mockPickerCallback({
      action: google.picker.Action.PICKED,
      docs: [{ id: 'selected-folder-id', name: 'Test Folder' }],
    });

    // Check if the folder ID was set correctly
    await waitFor(() => {
      expect(screen.getByTestId('folder-selected').textContent).toBe('true');
    });

    // Also check the folder ID
    expect(screen.getByTestId('folder-id').textContent).toBe(
      'selected-folder-id'
    );

    // Check if the folder ID was saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'googleDriveTargetFolderId',
      'selected-folder-id'
    );
  });
});
