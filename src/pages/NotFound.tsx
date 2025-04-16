
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">404</h1>
        <p className="mt-6 text-xl text-gray-600">Sorry, we couldn't find that page.</p>
        <div className="mt-10">
          <Button asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
