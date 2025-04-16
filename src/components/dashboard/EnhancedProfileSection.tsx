
import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import EnhancedProfileForm from './profile/EnhancedProfileForm';
import EnhancedProfileDisplay from './profile/EnhancedProfileDisplay';
import { useEnhancedProfileForm } from '@/hooks/useEnhancedProfileForm';

interface EnhancedProfileSectionProps {
  user: User;
  updateUser: (user: User) => void;
}

const EnhancedProfileSection: React.FC<EnhancedProfileSectionProps> = ({ user, updateUser }) => {
  const toast = useToast();
  const { form, loading, isEditing, setIsEditing, handleSubmit } = useEnhancedProfileForm(user, toast, updateUser);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Professional Details</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EnhancedProfileForm 
            form={form} 
            onSubmit={handleSubmit} 
            loading={loading}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <EnhancedProfileDisplay user={user} />
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileSection;
