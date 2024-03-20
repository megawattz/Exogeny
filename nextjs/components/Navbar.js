import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-transparent py-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <a href="#" className="text-white text-2xl font-bold">
            <img style={{ width: "30vw" }} src="image/ExoPlaneteer.png" />
          </a>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-white">
                Planets
              </a>
            </li>
            <li>
              <a href="#" className="text-white">
                Contracts
              </a>
            </li>
            <li>
              <a href="#" className="text-white">
                Communications
              </a>
            </li>
            <li>
              <a href="#" className="text-white">
                More
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
