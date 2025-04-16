
import React, { useState } from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralProfileTab from './GeneralProfileTab';
import AboutMeTab from './AboutMeTab';
import ProfessionalTab from './ProfessionalTab';
import { updateUserProfile } from '@/lib/supabase';
import { updateEnhancedProfile } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface ProfileSettingsCardProps {
  user: User;
  updateUser: (user: User) => void;
}

const ProfileSettingsCard: React.FC<ProfileSettingsCardProps> = ({ user, updateUser }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const onGeneralSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(user.id, data);
      updateUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onAboutMeSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(user.id, data);
      updateUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your bio has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onEnhancedSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setEnhancedLoading(true);
      const updatedUser = await updateEnhancedProfile(user.id, data);
      updateUser({...user, ...updatedUser});
      
      toast({
        title: "Professional details updated",
        description: "Your professional information has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setEnhancedLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="about">About Me</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralProfileTab 
              user={user} 
              onSubmit={onGeneralSubmit} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="about">
            <AboutMeTab 
              user={user} 
              onSubmit={onAboutMeSubmit} 
              loading={loading} 
            />
          </TabsContent>

          <TabsContent value="professional">
            <ProfessionalTab 
              user={user} 
              onSubmit={onEnhancedSubmit} 
              loading={enhancedLoading} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t px-6 py-4">
        <h3 className="text-sm font-medium">Account Type</h3>
        <p className="text-sm text-muted-foreground">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Your account type cannot be changed.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProfileSettingsCard;
