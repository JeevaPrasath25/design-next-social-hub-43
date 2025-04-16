
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User } from '@/types';

const formSchema = z.object({
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AboutMeTabProps {
  user: User;
  onSubmit: (data: FormValues) => Promise<void>;
  loading: boolean;
}

const AboutMeTab: React.FC<AboutMeTabProps> = ({ user, onSubmit, loading }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: user?.bio || '',
    },
  });

  return (
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
  );
};

export default AboutMeTab;
