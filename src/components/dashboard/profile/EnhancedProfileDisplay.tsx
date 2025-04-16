
import React from 'react';
import { User } from '@/types';

interface EnhancedProfileDisplayProps {
  user: User;
}

const EnhancedProfileDisplay: React.FC<EnhancedProfileDisplayProps> = ({ user }) => {
  if (!user.education && !user.experience && !user.skills && !user.contact_email && !user.social_links) {
    return (
      <p className="text-muted-foreground italic">
        No professional details added yet. Click 'Edit Details' to add your information.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {user.education && (
        <div>
          <h3 className="text-lg font-medium mb-2">Education</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{user.education}</p>
        </div>
      )}
      
      {user.experience && (
        <div>
          <h3 className="text-lg font-medium mb-2">Experience</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{user.experience}</p>
        </div>
      )}
      
      {user.skills && (
        <div>
          <h3 className="text-lg font-medium mb-2">Skills</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{user.skills}</p>
        </div>
      )}
      
      {user.contact_email && (
        <div>
          <h3 className="text-lg font-medium mb-2">Professional Email</h3>
          <p className="text-sm text-muted-foreground">{user.contact_email}</p>
        </div>
      )}
      
      {user.social_links && (
        <div>
          <h3 className="text-lg font-medium mb-2">Social Media & Portfolio</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{user.social_links}</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedProfileDisplay;
