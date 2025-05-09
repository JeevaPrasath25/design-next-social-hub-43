
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, User, LogOut, Plus, 
  Heart, Bookmark, Users, ImagePlus 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    goToDashboard, 
    goToAIGenerator,
    goToProfile, 
    goToExploreArchitects 
  } = useNavigation();

  return (
    <header className="border-b bg-white sticky top-0 z-20">
      <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Logo size="medium" />
        
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <button
                onClick={goToDashboard}
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </button>
              
              {user.role === 'architect' && (
                <Link 
                  to="/post/create"
                  className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Post Design
                </Link>
              )}
              
              <button
                onClick={goToAIGenerator}
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <ImagePlus className="w-4 h-4 mr-1" />
                AI Generator
              </button>
              
              <button
                onClick={goToExploreArchitects}
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <Users className="w-4 h-4 mr-1" />
                Find Architects
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-normal">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToDashboard}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToAIGenerator}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    <span>AI Generator</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goToExploreArchitects()}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Find Architects</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/saved'}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Saved Designs</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Log in
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="font-normal">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToDashboard}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToAIGenerator}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    <span>AI Generator</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={goToExploreArchitects}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Find Architects</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/saved'}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Saved Designs</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => window.location.href = '/login'}>
                    Log in
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/register'}>
                    Sign up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
