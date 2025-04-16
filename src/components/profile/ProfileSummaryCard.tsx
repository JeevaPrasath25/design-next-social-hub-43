
import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Mail, GraduationCap, Briefcase } from 'lucide-react';

interface ProfileSummaryCardProps {
  user: User;
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ user }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-0 text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url || ''} alt={user.username} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl font-bold">{user.username}</CardTitle>
        <CardDescription className="mt-2 text-lg capitalize">
          {user.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          {user.contact && (
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{user.contact}</span>
            </div>
          )}
          {user.contact_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{user.contact_email}</span>
            </div>
          )}
          {user.education && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <span>Education: {user.education.substring(0, 30)}...</span>
            </div>
          )}
          {user.experience && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <span>Experience: {user.experience.substring(0, 30)}...</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full">
          <p className="text-sm text-muted-foreground">
            {user.bio || "No bio available. Add one in your profile settings!"}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProfileSummaryCard;
