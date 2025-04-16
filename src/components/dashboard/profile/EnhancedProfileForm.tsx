
import React from 'react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';

const enhancedProfileSchema = z.object({
  education: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  contact_email: z.string().email({ message: 'Please enter a valid email address' }).optional().or(z.literal('')),
  social_links: z.string().optional(),
});

export type EnhancedProfileFormValues = z.infer<typeof enhancedProfileSchema>;

export { enhancedProfileSchema };

interface EnhancedProfileFormProps {
  form: UseFormReturn<EnhancedProfileFormValues>;
  onSubmit: (data: EnhancedProfileFormValues) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
}

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ 
  form, 
  onSubmit, 
  loading, 
  onCancel 
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Details'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EnhancedProfileForm;
