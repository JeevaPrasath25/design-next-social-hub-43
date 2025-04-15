
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <Logo size="medium" />
          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Discover and connect with</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brandPurple to-brandPurpleDark">
              architectural designs
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-md mx-auto">
            Design Next connects architects with homeowners. Showcase your designs or find the perfect architect for your next project.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/register')} className="gap-2">
                  Get Started <ArrowRight size={16} />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  Log in
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-muted-foreground text-sm">
        <div className="container px-4 sm:px-6 lg:px-8">
          Design Next - A platform for architectural design
        </div>
      </footer>
    </div>
  );
};

export default Index;
