import "../styles/Navbar.css";
function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>BookBeautiq</h2>
      </div>

      <ul className="nav-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Explore</a></li>
        <li><a href="#">For Businesses</a></li>
        <li><a href="#">About</a></li>
      </ul>

      <button className="signin-btn">
        Sign In
      </button>
    </nav>
  );
}

export default Navbar;