import { Navbar, Container } from "react-bootstrap";
import logo from "../assets/logo.png";
import logo1 from "../assets/logo1.png";

const Header = () => {
  return (
    <header>
      <Navbar
        expand="md"
        collapseOnSelect
        style={{ backgroundColor: "#0E051A" }}
      >
        <Container className="d-flex justify-content-between align-items-center">
          {/* Left side: Logo and Text */}
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img
              src={logo1}
              alt="Proshop"
              style={{ height: "50px", width: "50px" }}
            />
            <span style={{ color: "#8D4FDE" }} className="fw-bold fs-6 ms-2">
              Speech to Speech Translation
            </span>
          </Navbar.Brand>

          {/* Right-aligned logo */}
          <div className="ms-auto">
            <img src={logo} alt="Right Logo" style={{ height: "50px" }} />
          </div>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
