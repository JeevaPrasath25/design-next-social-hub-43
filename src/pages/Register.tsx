
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/types';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['architect', 'homeowner'], { required_error: 'Please select a role.' }),
});

type FormValues = z.infer<typeof formSchema>;

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'architect',
    },
  });

  // Function to create default accounts
  const createDefaultAccount = async (role: UserRole) => {
    setLoading(true);
    try {
      const email = role === 'architect' ? 'architect@yopmail.com' : 'homeowner@yopmail.com';
      const username = role === 'architect' ? 'DefaultArchitect' : 'DefaultHomeowner';
      const password = 'Test@123';
      
      await registerUser(email, password, username, role);
      
      toast({
        title: `Default ${role} account created`,
        description: `Email: ${email}, Password: Test@123`,
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: `Failed to create default ${role} account`,
        description: error.message || `An error occurred creating the ${role} account`,
        variant: "destructive",
        duration: 5000,
      });
      console.error(`Error creating default ${role} account:`, error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      await registerUser(data.email, data.password, data.username, data.role);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="large" className="mb-2" />
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join Design Next and connect with architectural designs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="******" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select your role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="architect" id="architect" />
                          <Label htmlFor="architect">Architect</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="homeowner" id="homeowner" />
                          <Label htmlFor="homeowner">Homeowner</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 space-y-3">
            <div className="text-sm text-center text-muted-foreground mb-2">Or create default accounts:</div>
            <div className="flex space-x-3">
              <Button 
                type="button" 
                className="flex-1" 
                variant="outline" 
                onClick={() => createDefaultAccount('architect')}
                disabled={loading}
              >
                Create Architect Account
              </Button>
              <Button 
                type="button" 
                className="flex-1" 
                variant="outline" 
                onClick={() => createDefaultAccount('homeowner')}
                disabled={loading}
              >
                Create Homeowner Account
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
