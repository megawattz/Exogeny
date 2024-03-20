import React from "react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-start">
        <a href="/" className="btn btn-ghost">
          My App
        </a>
      </div>
      <div className="navbar-end">
        <a href="/about" className="btn btn-ghost">
          About
        </a>
        <a href="/contact" className="btn btn-ghost">
          Contact
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
