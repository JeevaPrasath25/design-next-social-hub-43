
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User } from '@/types';

const enhancedFormSchema = z.object({
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  contact_email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  social_links: z.string().optional(),
});

type EnhancedFormValues = z.infer<typeof enhancedFormSchema>;

interface ProfessionalTabProps {
  user: User;
  onSubmit: (data: EnhancedFormValues) => Promise<void>;
  loading: boolean;
}

const ProfessionalTab: React.FC<ProfessionalTabProps> = ({ user, onSubmit, loading }) => {
  const form = useForm<EnhancedFormValues>({
    resolver: zodResolver(enhancedFormSchema),
    defaultValues: {
      education: user?.education || '',
      experience: user?.experience || '',
      skills: user?.skills || '',
      contact_email: user?.contact_email || '',
      social_links: user?.social_links || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Professional Details'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfessionalTab;
