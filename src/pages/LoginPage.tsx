import React, { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Alert,
  Spinner,
  Card,
  ListGroup,
} from 'react-bootstrap';
import { useAuth, SelectedFile } from '../contexts/AuthContext';
import {
  authenticateWithGoogle,
  loadGoogleApi,
  showGooglePicker,
  FileSelectionResult,
} from '../services/GoogleAuthService';
import { Navigate } from 'react-router-dom';
import { validateGoogleConfig } from '../utils/ConfigValidator';

const LoginPage: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    hasSelectedFiles,
    selectedFiles,
    setUser,
    setSelectedFiles,
    logout,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    // Validate configuration on component mount
    const { isValid, errors } = validateGoogleConfig();
    if (!isValid) {
      setConfigErrors(errors);
    }

    const initGoogleApi = async () => {
      try {
        await loadGoogleApi();
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
        setError(
          'Failed to initialize Google services. Please ensure you have a stable internet connection and try again later.'
        );
        setIsInitializing(false);
      }
    };

    if (isValid) {
      initGoogleApi();
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Display guidance to user
      console.log(
        'Please complete the Google authentication in the popup window'
      );

      const user = await authenticateWithGoogle();
      setUser(user);
      setIsAuthenticating(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.message || 'Failed to authenticate with Google. Please try again.'
      );
      setIsAuthenticating(false);
    }
  };

  const handleFileSelection = async () => {
    if (!user?.accessToken) return;

    try {
      setIsPickerOpen(true);
      setError(null);

      const result: FileSelectionResult = await showGooglePicker(
        user.accessToken
      );

      if (result.fileIds.length > 0) {
        const files: SelectedFile[] = result.fileIds.map((id, index) => ({
          id,
          name: result.fileNames[index] || `File ${index + 1}`,
          url: result.fileUrls[index] || '',
        }));

        setSelectedFiles(files);
      } else {
        setError('You need to select at least one file or folder to continue.');
      }

      setIsPickerOpen(false);
    } catch (error: any) {
      console.error('File selection error:', error);
      setError(
        error.message || 'Failed to open file picker. Please try again.'
      );
      setIsPickerOpen(false);
    }
  };

  // Render the file selection section
  const renderFileSelection = () => (
    <div className="text-center">
      <p>Welcome, {user?.name}!</p>

      {hasSelectedFiles ? (
        <div className="mb-4">
          <h5 className="mb-3">Selected Files/Folders:</h5>
          <ListGroup className="mb-3 text-start">
            {selectedFiles.map((file) => (
              <ListGroup.Item
                key={file.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="text-truncate me-2">{file.name}</div>
                <small className="text-muted">
                  {file.name.endsWith('.db') ||
                  file.name.endsWith('.sqlite') ||
                  file.name.endsWith('.sqlite3')
                    ? 'Database File'
                    : 'Folder'}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleFileSelection}
            >
              Change Selection
            </Button>
            <Button variant="primary" size="sm" as="a" href="#/monte_carlo">
              Continue to App
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Alert variant="info">
            Please select the database files or folder you want to access.
          </Alert>
          <Button
            variant="primary"
            size="lg"
            className="w-100 mt-3"
            onClick={handleFileSelection}
            disabled={isPickerOpen}
          >
            {isPickerOpen ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Opening file picker...
              </>
            ) : (
              'Select Files or Folder'
            )}
          </Button>
          <p className="text-muted mt-2">
            <small>
              You can select database files (.db, .sqlite, .sqlite3) or a folder
              containing them.
              <br />
              The app needs access to read these files to function properly.
            </small>
          </p>
        </>
      )}

      <div className="mt-3">
        <Button variant="outline-secondary" size="sm" onClick={logout}>
          Sign Out & Restart
        </Button>
      </div>
    </div>
  );

  // Redirect to main app if user is authenticated and has selected files
  if (isAuthenticated && !isLoading && hasSelectedFiles) {
    return <Navigate to="/monte_carlo" />;
  }

  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <Card className="shadow-sm" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Body className="p-5">
          <h1 className="text-center mb-4">Welcome</h1>
          <p className="text-center mb-4">
            Sign in with your Google account to access and analyze your files.
          </p>

          {configErrors.length > 0 && (
            <Alert variant="danger">
              <strong>Configuration errors detected:</strong>
              <ul className="mb-0 mt-2">
                {configErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
              <p className="mt-2 mb-0">
                Please check your environment variables and Google OAuth
                configuration.
              </p>
            </Alert>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {isInitializing || isLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Initializing...</p>
            </div>
          ) : !isAuthenticated ? (
            <>
              <Button
                variant="primary"
                size="lg"
                className="w-100 mt-3"
                onClick={handleLogin}
                disabled={isAuthenticating || configErrors.length > 0}
              >
                {isAuthenticating ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in with Google'
                )}
              </Button>
              <div className="mt-3 text-muted small">
                <p>
                  <strong>Note:</strong> A popup window will open for
                  authentication. Please ensure popups are not blocked for this
                  site.
                </p>
                <p>
                  Make sure to complete the authentication process in the popup
                  window.
                </p>
              </div>
            </>
          ) : (
            renderFileSelection()
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
