import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { signUpWithEmail } from '@/firebase/auth';
import { UserRole } from '@/contexts/AuthContext';

// Define form schema
const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }),
  role: z.enum(['investor', 'startup'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  setError: (error: string | null) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ setError }) => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      role: 'investor',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Register the user with Firebase
      await signUpWithEmail({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        role: data.role as UserRole,
      });
      
      // Redirect to appropriate dashboard based on role
      const redirectPath = data.role === 'investor' ? '/investor/dashboard' : '/startup/dashboard';
      setLocation(redirectPath);
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
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
                  <Input placeholder="name@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
                <FormLabel>I am a</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-1"
                  >
                    <div className="flex items-center space-x-2 rounded-md border p-2 flex-1 cursor-pointer">
                      <RadioGroupItem value="investor" id="investor" />
                      <Label htmlFor="investor" className="cursor-pointer">Investor</Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-2 flex-1 cursor-pointer">
                      <RadioGroupItem value="startup" id="startup" />
                      <Label htmlFor="startup" className="cursor-pointer">Startup Founder</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
            )}
            Create Account
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm text-gray-500">
        By signing up, you agree to our{' '}
        <a href="#" className="hover:text-primary underline underline-offset-4">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="hover:text-primary underline underline-offset-4">
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default SignUpForm;