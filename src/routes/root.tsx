import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Root() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <Navbar bg="light" expand="md">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav
              variant="underline"
              activeKey={location.pathname}
              className="me-auto"
            >
              <Nav.Link as={Link} className="me-2" eventKey="/" to="/">
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                className="me-2"
                eventKey="/monte_carlo"
                to="/monte_carlo"
              >
                Monte Carlo
              </Nav.Link>
              <Nav.Link
                as={Link}
                className="me-2"
                to="mailto:songscaler+dev-feeback-pretire@gmail.com"
                target="_blank"
              >
                Feedback
              </Nav.Link>
              <Nav.Link
                as={Link}
                className="me-2"
                to="https://venmo.com/u/JohnMangel"
                target="_blank"
              >
                Tip The Dev (thanks! ＼(´∀｀)／)
              </Nav.Link>
            </Nav>
            {isAuthenticated && (
              <div className="d-flex align-items-center">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px' }}
                  />
                )}
                <span className="me-3">{user?.name}</span>
                <Button variant="outline-secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
}
