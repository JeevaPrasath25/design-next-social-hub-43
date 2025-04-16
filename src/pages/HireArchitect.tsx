
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types';
import { getUserById, hireArchitect, getProfileStats } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import { ArrowLeft, BriefcaseIcon, Copy, Mail, Phone, User as UserIcon } from 'lucide-react';

const HireArchitect: React.FC = () => {
  const { architectId } = useParams<{ architectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [architect, setArchitect] = useState<User | null>(null);
  const [isHired, setIsHired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchArchitect = async () => {
      if (!architectId || !user) return;

      try {
        setLoading(true);
        const architectData = await getUserById(architectId);
        
        if (!architectData || architectData.role !== 'architect') {
          toast({
            title: "Architect not found",
            description: "Could not find the architect you're looking for",
            variant: "destructive",
          });
          navigate('/homeowner-dashboard');
          return;
        }
        
        setArchitect(architectData);
        
        // Check if already hired
        const stats = await getProfileStats(architectId, user.id);
        setIsHired(!!stats.is_hired);
      } catch (error) {
        console.error('Error fetching architect details:', error);
        toast({
          title: "Error loading architect",
          description: "Please try again later",
          variant: "destructive",
        });
        navigate('/homeowner-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchArchitect();
  }, [architectId, user, navigate, toast]);

  const handleHire = async () => {
    if (!user || !architect || !architectId) return;

    try {
      setSubmitting(true);
      await hireArchitect(user.id, architectId);
      setIsHired(true);
      
      toast({
        title: "Architect hired",
        description: `You've successfully hired ${architect.username}`,
      });
    } catch (error) {
      console.error('Error hiring architect:', error);
      toast({
        title: "Error",
        description: "Could not hire architect",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Contact information copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <div className="text-center py-12">
            Loading architect details...
          </div>
        </main>
      </div>
    );
  }

  if (!architect) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container px-4 py-8">
          <Alert>
            <AlertDescription>
              Could not find the architect you're looking for.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/homeowner-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Hire {architect.username}
                </CardTitle>
                <CardDescription>
                  Connect with this architect to bring your design to life
                </CardDescription>
              </div>
              {isHired && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Already Hired
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isHired ? (
              <>
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="font-medium text-green-800 mb-2">You've hired {architect.username}</h3>
                  <p className="text-green-700">
                    You can now contact the architect directly using the information below.
                  </p>
                </div>
                
                {architect.contact ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {architect.contact.split('\n').map((line, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <p className="text-gray-700">{line}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(line)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
                    This architect hasn't provided contact details yet. Please visit their profile to message them.
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Next Steps</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Contact the architect using the information above</li>
                    <li>Discuss your project requirements and timeline</li>
                    <li>Arrange a consultation to review designs in detail</li>
                    <li>Finalize project details and contracts outside of DesignNext</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Why hire {architect.username}?</h3>
                  <p className="text-blue-700">
                    When you hire an architect, you'll get access to their contact information and can discuss your project details directly.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">What happens when you hire an architect?</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>You'll get access to their contact information</li>
                    <li>The architect will be notified that you're interested in their services</li>
                    <li>You can discuss project details and pricing directly</li>
                    <li>The architect's profile will show as "Hired" by you</li>
                  </ul>
                </div>
                
                {architect.bio && (
                  <div>
                    <h3 className="font-medium mb-2">About {architect.username}</h3>
                    <p className="text-gray-700">{architect.bio}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(`/architect/${architect.id}`)}>
              View Profile
            </Button>
            
            {!isHired && (
              <Button 
                onClick={handleHire}
                disabled={submitting}
                className="gap-2"
              >
                <BriefcaseIcon className="h-4 w-4" />
                {submitting ? "Processing..." : "Hire Architect"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default HireArchitect;
