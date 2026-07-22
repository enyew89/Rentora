import * as z from 'zod';

export const registrationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\d{10,}$/, 'Phone number must be at least 10 digits'),
  
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the Terms of Service and Privacy Policy'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});