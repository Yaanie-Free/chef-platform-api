import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <a href="/" className="text-xl font-bold">ChefPlatform</a>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:text-gray-300">Chefs</a></li>
            <li><a href="/" className="hover:text-gray-300">About</a></li>
            <li><a href="/" className="hover:text-gray-300">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;