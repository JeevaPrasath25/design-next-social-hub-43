
import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { updateEnhancedProfile } from '@/lib/api';

const enhancedProfileSchema = z.object({
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  contact_email: z.string().email({ message: 'Please enter a valid email address' }).optional().or(z.literal('')),
  social_links: z.string().optional(),
});

type EnhancedProfileFormValues = z.infer<typeof enhancedProfileSchema>;

interface EnhancedProfileSectionProps {
  user: User;
  updateUser: (user: User) => void;
}

const EnhancedProfileSection: React.FC<EnhancedProfileSectionProps> = ({ user, updateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EnhancedProfileFormValues>({
    resolver: zodResolver(enhancedProfileSchema),
    defaultValues: {
      education: user?.education || '',
      experience: user?.experience || '',
      skills: user?.skills || '',
      contact_email: user?.contact_email || '',
      social_links: user?.social_links || '',
    },
  });

  const handleSubmit = async (data: EnhancedProfileFormValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update enhanced profile in Supabase
      const updatedUser = await updateEnhancedProfile(user.id, data);
      
      // Update user context with new data
      updateUser({
        ...user,
        ...updatedUser
      });
      
      toast({
        title: "Profile updated",
        description: "Your enhanced profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating enhanced profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your education background"
                        className="min-h-24 resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your educational background, degrees, and certifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your work experience"
                        className="min-h-24 resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your work history and relevant professional experience.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your skills and expertise"
                        className="min-h-24 resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      List your technical skills, expertise, and specializations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.professional@email.com"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A professional email address for client inquiries.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="social_links"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media & Portfolio Links</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Links to your portfolio, LinkedIn, etc."
                        className="min-h-24 resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Share links to your portfolio, professional social media, or other websites.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Details'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
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
            
            {!user.education && !user.experience && !user.skills && !user.contact_email && !user.social_links && (
              <p className="text-muted-foreground italic">
                No professional details added yet. Click 'Edit Details' to add your information.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileSection;
