import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const {
    login,
    isLoading,
    error,
    isAuthenticated,
    hasDriveAccess,
    isFolderSelected,
    selectFolder,
  } = useAuth();

  // If the user is fully authenticated with a selected folder, redirect to the main app
  if (isAuthenticated && hasDriveAccess && isFolderSelected) {
    return <Navigate to="/monte_carlo" replace />;
  }

  const handleLoginClick = async () => {
    if (!isAuthenticated) {
      // Step 1: Authenticate with Google
      await login();
    } else if (!isFolderSelected) {
      // Step 2: Select a folder
      await selectFolder();
    }
  };

  // Determine button text based on authentication state
  let buttonText = 'Sign in with Google';
  if (isLoading) {
    buttonText = 'Please wait...';
  } else if (isAuthenticated && !isFolderSelected) {
    buttonText = 'Select a Google Drive Folder';
  }

  // Determine page heading and description based on authentication state
  let heading = 'Welcome';
  let description =
    'This application needs access to your Google Drive. Please click the button below to authorize.';

  if (isAuthenticated && !isFolderSelected) {
    heading = 'Select a Folder';
    description =
      'Please select a Google Drive folder that you want to use with this application.';
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="mb-3">{heading}</h2>
                <p className="mb-4">{description}</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLoginClick}
                  disabled={isLoading}
                >
                  {buttonText}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
