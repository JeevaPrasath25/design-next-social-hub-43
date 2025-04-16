
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
import { useProfileForms } from '@/hooks/useProfileForms';

interface ProfileSettingsCardProps {
  user: User;
}

const ProfileSettingsCard: React.FC<ProfileSettingsCardProps> = ({ user }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  const {
    loading,
    enhancedLoading,
    onGeneralSubmit,
    onAboutMeSubmit,
    onEnhancedSubmit,
    updateUser
  } = useProfileForms(user, toast);

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
