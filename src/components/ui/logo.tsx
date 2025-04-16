
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl',
  };

  return (
    <Link to="/" className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-violet-700">
        DesigNest
      </span>
    </Link>
  );
};

export default Logo;
