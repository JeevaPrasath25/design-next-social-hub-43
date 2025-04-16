
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { updateUserProfile } from '@/lib/supabase';
import { updateEnhancedProfile } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, Mail, Home, Briefcase, GraduationCap, Award } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  contact: z.string().optional(),
  bio: z.string().optional(),
});

const enhancedFormSchema = z.object({
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  contact_email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  social_links: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type EnhancedFormValues = z.infer<typeof enhancedFormSchema>;

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || '',
      contact: user?.contact || '',
      bio: user?.bio || '',
    },
  });

  const enhancedForm = useForm<EnhancedFormValues>({
    resolver: zodResolver(enhancedFormSchema),
    defaultValues: {
      education: user?.education || '',
      experience: user?.experience || '',
      skills: user?.skills || '',
      contact_email: user?.contact_email || '',
      social_links: user?.social_links || '',
    },
  });

  const onSubmit = async (data: FormValues) => {
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

  const onEnhancedSubmit = async (data: EnhancedFormValues) => {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <DashboardSidebar user={user} />
        <main className="flex-1 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Summary Card */}
              <div className="w-full md:w-1/3">
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
                        <User className="h-5 w-5 text-muted-foreground" />
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
              </div>
              
              {/* Profile Settings Card */}
              <div className="w-full md:w-2/3">
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
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    This is your public display name.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="contact"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Information</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Add your contact details (phone, address, etc.)"
                                      className="min-h-32"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This information will be visible to users who hire you.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="pt-4">
                              <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save changes'}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>
                      
                      <TabsContent value="about">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Biography</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Tell us about yourself, your experience, and your interests..."
                                      className="min-h-48"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This will be displayed on your public profile.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="pt-4">
                              <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save changes'}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>

                      <TabsContent value="professional">
                        <Form {...enhancedForm}>
                          <form onSubmit={enhancedForm.handleSubmit(onEnhancedSubmit)} className="space-y-6">
                            <FormField
                              control={enhancedForm.control}
                              name="experience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Professional Experience</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Describe your work experience, previous projects, etc."
                                      className="min-h-32"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Your professional experience will help clients assess your expertise.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={enhancedForm.control}
                              name="education"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Education</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="List your educational background, degrees, certifications, etc."
                                      className="min-h-24"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={enhancedForm.control}
                              name="skills"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Skills</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="List your skills and areas of expertise"
                                      className="min-h-24"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={enhancedForm.control}
                              name="contact_email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business Email</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="your.professional@email.com"
                                      type="email"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Your professional contact email for business inquiries.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={enhancedForm.control}
                              name="social_links"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Social Media & Portfolio Links</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="LinkedIn, personal website, Behance, etc. (one per line)"
                                      className="min-h-24"
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add your professional social media and portfolio links.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="pt-4">
                              <Button type="submit" disabled={enhancedLoading}>
                                {enhancedLoading ? 'Saving...' : 'Save Professional Details'}
                              </Button>
                            </div>
                          </form>
                        </Form>
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
