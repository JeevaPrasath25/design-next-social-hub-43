
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl'
  };

  return (
    <Link to="/" className={cn("font-bold flex items-center", className)}>
      <div className={cn("text-primary", sizeClasses[size])}>
        Design<span className="text-foreground">Next</span>
      </div>
    </Link>
  );
};

export default Logo;
