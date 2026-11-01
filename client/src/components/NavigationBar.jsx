import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useLocation } from 'react-router-dom';

function NavigationBar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Navbar className="fb-navbar sticky-top" expand="lg">
      <Container fluid className="px-3 px-md-4">
        <Navbar.Brand as={Link} to="/" className="fb-brand">
          StudentHub
        </Navbar.Brand>

        {(
          <div className="d-flex align-items-center mx-auto gap-1">
            <Link
              to="/"
              className={`fb-nav-icon ${location.pathname === '/' ? 'active' : ''}`}
              title="Home"
            >
              <i className="bi bi-house-fill"></i>
            </Link>
            <span className="fb-nav-icon" title="Groups">
              <i className="bi bi-people-fill"></i>
            </span>
            <span className="fb-nav-icon" title="Messages">
              <i className="bi bi-chat-dots-fill"></i>
            </span>
            <span className="fb-nav-icon" title="Notifications">
              <i className="bi bi-bell-fill"></i>
            </span>
          </div>
        )}

        <div className="d-flex align-items-center gap-2 ms-auto">
          {(
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="border-0 bg-transparent p-0 d-flex align-items-center"
                id="user-menu"
              >
                <div className="fb-avatar fb-avatar-sm">
                  <i className="bi bi-person-fill"></i>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-sm border-0 mt-2">
                <Dropdown.Item as={Link} to="/">
                  <i className="bi bi-house me-2"></i>Home
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
