
import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, GraduationCap, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const enhancedProfileSchema = z.object({
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  contact_email: z.string().email({ message: "Invalid email address" }).optional(),
  social_links: z.string().optional(),
});

type EnhancedProfileValues = z.infer<typeof enhancedProfileSchema>;

interface EnhancedProfileSectionProps {
  user: User;
  updateUser: (user: User) => void;
}

const EnhancedProfileSection: React.FC<EnhancedProfileSectionProps> = ({ user, updateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EnhancedProfileValues>({
    resolver: zodResolver(enhancedProfileSchema),
    defaultValues: {
      education: user?.education || '',
      experience: user?.experience || '',
      skills: user?.skills || '',
      contact_email: user?.contact_email || '',
      social_links: user?.social_links || '',
    },
  });

  const handleSubmit = async (data: EnhancedProfileValues) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update user profile in Supabase
      const updatedUser = {
        ...user,
        education: data.education || null,
        experience: data.experience || null,
        skills: data.skills || null,
        contact_email: data.contact_email || null,
        social_links: data.social_links || null,
      };
      
      const response = await fetch('/api/update-enhanced-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatedUser.id,
          education: updatedUser.education,
          experience: updatedUser.experience,
          skills: updatedUser.skills,
          contact_email: updatedUser.contact_email,
          social_links: updatedUser.social_links,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      updateUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your enhanced profile has been updated successfully",
      });
      
      setIsEditing(false);
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

  const formatSkillsList = (skillsString: string | null | undefined) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Professional Profile</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Professional Details'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="education" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
                
                <TabsContent value="education">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Educational Background</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add your educational background, degrees, certifications, etc."
                            className="min-h-32 resize-none"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Share your educational background and qualifications.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="experience">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Experience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add your work experience, projects, achievements, etc."
                            className="min-h-32 resize-none"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Detail your professional experience and work history.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="skills">
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Skills</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List your skills separated by commas (e.g., 3D Modeling, Sustainable Design, Interior Design)"
                            className="min-h-32 resize-none"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          List your architectural skills and areas of expertise (comma-separated).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="contact">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your.professional@email.com"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            A professional email for client inquiries.
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
                          <FormLabel>Social & Portfolio Links</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add your portfolio website, LinkedIn, etc."
                              className="min-h-24 resize-none"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Share your professional online presence.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Professional Profile'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="education" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="education">
                <div className="flex items-start space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Educational Background</h3>
                    {user.education ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{user.education}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No educational information added yet.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="experience">
                <div className="flex items-start space-x-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Professional Experience</h3>
                    {user.experience ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{user.experience}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No experience information added yet.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="skills">
                <div className="flex items-start space-x-2">
                  <Award className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Professional Skills</h3>
                    {user.skills ? (
                      <div className="flex flex-wrap gap-2">
                        {formatSkillsList(user.skills).map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No skills added yet.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact">
                <div>
                  <h3 className="text-lg font-medium mb-2">Professional Contact</h3>
                  {(user.contact_email || user.social_links) ? (
                    <div className="space-y-3">
                      {user.contact_email && (
                        <div>
                          <h4 className="text-sm font-medium">Email</h4>
                          <p className="text-sm text-muted-foreground">{user.contact_email}</p>
                        </div>
                      )}
                      
                      {user.social_links && (
                        <div>
                          <h4 className="text-sm font-medium">Portfolio & Social Links</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{user.social_links}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No contact information added yet.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileSection;
