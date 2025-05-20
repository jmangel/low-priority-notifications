import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DriveFilesList from './DriveFilesList';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../contexts/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(() => ({
      targetFolderId: 'mock-folder-id',
      isAuthenticated: true,
      hasDriveAccess: true,
      isFolderSelected: true,
      selectFolder: jest.fn(),
    })),
  };
});

// Set up mock for gapi
const mockGapi = {
  client: {
    drive: {
      files: {
        list: jest.fn().mockResolvedValue({
          result: {
            files: [
              {
                id: 'file-1',
                name: 'Test File 1',
                mimeType: 'text/plain',
                modifiedTime: '2023-01-01T12:00:00Z',
              },
              {
                id: 'file-2',
                name: 'Test File 2',
                mimeType: 'application/pdf',
                modifiedTime: '2023-01-02T14:30:00Z',
              },
            ],
          },
        }),
      },
    },
  },
};

// Set gapi in the global scope
(global as any).gapi = mockGapi;

describe('DriveFilesList', () => {
  test('renders file list when files are available', async () => {
    render(
      <AuthProvider>
        <DriveFilesList />
      </AuthProvider>
    );

    // Check heading is rendered
    expect(screen.getByText('Files in Selected Folder')).toBeInTheDocument();

    // Wait for first file to load
    await waitFor(() => {
      expect(screen.getByText('Test File 1')).toBeInTheDocument();
    });

    // Now check for the rest of the elements after they're loaded
    expect(screen.getByText('Test File 2')).toBeInTheDocument();
    expect(screen.getByText('text/plain')).toBeInTheDocument();
    expect(screen.getByText('application/pdf')).toBeInTheDocument();

    // Check if the "Change Folder" button is present
    expect(screen.getByText('Change Folder')).toBeInTheDocument();
  });

  test('shows a message when no files are found', async () => {
    // Override the mock for this test
    mockGapi.client.drive.files.list.mockResolvedValueOnce({
      result: { files: [] },
    });

    render(
      <AuthProvider>
        <DriveFilesList />
      </AuthProvider>
    );

    // Wait for the message to appear
    await waitFor(() => {
      expect(
        screen.getByText('No files found in the selected folder.')
      ).toBeInTheDocument();
    });
  });

  test('shows a "No Folder Selected" message when no folder is selected', async () => {
    // Override the useAuth hook to simulate no folder selected
    const { useAuth } = jest.requireMock('../contexts/AuthContext');
    const mockSelectFolder = jest.fn();
    useAuth.mockReturnValueOnce({
      targetFolderId: null,
      isAuthenticated: true,
      hasDriveAccess: true,
      isFolderSelected: false,
      selectFolder: mockSelectFolder,
    });

    render(
      <AuthProvider>
        <DriveFilesList />
      </AuthProvider>
    );

    // Check if the message and button are displayed
    expect(screen.getByText('No Folder Selected')).toBeInTheDocument();
    expect(screen.getByText('Select a Folder')).toBeInTheDocument();

    // Click the button and check if it calls selectFolder
    fireEvent.click(screen.getByText('Select a Folder'));
    expect(mockSelectFolder).toHaveBeenCalled();
  });
});
