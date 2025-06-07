import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Collapse,
} from '@material-tailwind/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const NavList = () => (
  <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/" className="flex items-center hover:text-blue-500 transition-colors">
        Home
      </Link>
    </Typography>
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/all-exams-results" className="flex items-center hover:text-blue-500 transition-colors">
        Results
      </Link>
    </Typography>
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/student" className="flex items-center hover:text-blue-500 transition-colors">
        Student
      </Link>
    </Typography>
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/organization" className="flex items-center hover:text-blue-500 transition-colors">
        Organization
      </Link>
    </Typography>
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/admin" className="flex items-center hover:text-blue-500 transition-colors">
        Admin
      </Link>
    </Typography>
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/about" className="flex items-center hover:text-blue-500 transition-colors">
        About
      </Link>
    </Typography>
    <Typography as="li" variant="small" color="blue-gray" className="p-1 font-medium">
      <Link to="/contact" className="flex items-center hover:text-blue-500 transition-colors">
        Contact
      </Link>
    </Typography>
  </ul>
);

const AppNavbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  return (
    <Navbar className="mx-auto max-w-screen-xl px-4 py-2">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as="a"
          href="/"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5"
        >
          ExamChain
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          className="lg:hidden"
          onClick={toggleIsNavOpen}
        >
          {isNavOpen ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={isNavOpen}>
        <NavList />
      </Collapse>
    </Navbar>
  );
};

export default AppNavbar;
