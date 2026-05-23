import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { authService, LoginPayload, RegisterPayload, AuthResponse } from '@/services/auth';
import { TMutationOptions, TMutationReturnType } from './types';

// 1. Hook types ki definition (Interface)
export interface IAuthDataHook {
  // Login ke liye hook type definition
  useLogin: (
    options?: TMutationOptions<AuthResponse, Error, LoginPayload>
  ) => TMutationReturnType<AuthResponse, LoginPayload>;

  // Register ke liye hook type definition
  useRegister: (
    options?: TMutationOptions<AuthResponse, Error, RegisterPayload>
  ) => TMutationReturnType<AuthResponse, RegisterPayload>;

  // Logout ke liye hook type definition
  useLogout: (
    options?: TMutationOptions<void, Error, void>
  ) => TMutationReturnType<void, void>;
}

// 2. Auth hooks ki actual implementation jise components me use karenge
export const AuthDataHook: IAuthDataHook = {
  // 🔐 Login Hook: Isse user login API trigger hoti hai aur toast message show hota hai
  useLogin(options) {
    return useMutation({
      mutationFn: authService.login, // services/auth.ts me likha login function call karo
      onSuccess: (data, variables, context) => {
        // Successful login hone par server message ya default toast message dikhao
        toast.success(data.message || "Login successful!");
        // Page level success logic ko run karo (jaise screen redirection)
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        // Error aane par error message toast popup me dikhao
        toast.error(error?.response?.data?.message || error.message || "Failed to login.");
        // Optional page level error logic call karo
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },

  // 📝 Register Hook: Isse naya account create hota hai aur toast display hota hai
  useRegister(options) {
    return useMutation({
      mutationFn: authService.register, // services/auth.ts me likha register function call karo
      onSuccess: (data, variables, context) => {
        // Account validation success hone par toast notification show karo
        toast.success(data.message || "Account created successfully!");
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        // Error details ko toast popup alert me user ko dikhao
        toast.error(error?.response?.data?.message || error.message || "Failed to register.");
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },

  // 🚪 Logout Hook: Isse active user session clear aur logout toast show hota hai
  useLogout(options) {
    const queryClient = useQueryClient(); // React Query cache clear karne ke liye client object
    return useMutation({
      mutationFn: authService.logout, // Logout ki API call karo
      onSuccess: (data, variables, context) => {
        // Safely screen session cached data completely clear and invalidate queries
        queryClient.clear(); 
        toast.success("Logged out successfully");
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        toast.error(error?.response?.data?.message || error.message || "Failed to logout.");
        (options?.onError as any)?.(error, variables, context);
      },
    });
  }
};
