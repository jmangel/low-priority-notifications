import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ListGroup, Spinner, Alert, Button } from 'react-bootstrap';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

const DriveFilesList: React.FC = () => {
  const {
    targetFolderId,
    isAuthenticated,
    hasDriveAccess,
    isFolderSelected,
    selectFolder,
  } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!isAuthenticated || !hasDriveAccess || !targetFolderId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Query files in the specified folder
        const response = await gapi.client.drive.files.list({
          q: `'${targetFolderId}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType, modifiedTime)',
          orderBy: 'modifiedTime desc',
        });

        setFiles(response.result.files);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to fetch files from Google Drive');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isAuthenticated, hasDriveAccess, targetFolderId]);

  if (!isFolderSelected) {
    return (
      <div className="text-center py-4">
        <Alert variant="info">
          <Alert.Heading>No Folder Selected</Alert.Heading>
          <p>
            You need to select a Google Drive folder to use with this
            application.
          </p>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={selectFolder}>
              Select a Folder
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading files...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Files in Selected Folder</h3>
        <Button variant="outline-secondary" size="sm" onClick={selectFolder}>
          Change Folder
        </Button>
      </div>

      {files.length === 0 ? (
        <Alert variant="info">No files found in the selected folder.</Alert>
      ) : (
        <ListGroup>
          {files.map((file) => (
            <ListGroup.Item
              key={file.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{file.name}</strong>
                <div className="text-muted small">{file.mimeType}</div>
              </div>
              <div className="text-muted small">
                {new Date(file.modifiedTime).toLocaleString()}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default DriveFilesList;
