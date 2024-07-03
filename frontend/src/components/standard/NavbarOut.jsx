import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Typography, Button } from '@material-tailwind/react';

const AppNavbar = () => {
  return (
    <Navbar className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-2">
        <Typography as="a" href="/" variant="h6" className="mr-4 cursor-pointer">
          ExamChain
        </Typography>
        <div className="flex space-x-4">
          <Link to="/">
            <Button variant="text">Home</Button>
          </Link>
          <Link to="/about">
            <Button variant="text">About</Button>
          </Link>
          <Link to="/contact">
            <Button variant="text">Contact</Button>
          </Link>
        </div>
      </div>
    </Navbar>
  );
};

export default AppNavbar;
