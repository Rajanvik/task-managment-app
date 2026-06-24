import { toast } from "@/lib/toast";
import { AuthService } from "@/services/auth";
import { AuthResponse, Login, Register } from "@/lib/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TMutationOptions, TMutationReturnType } from "../../types/types";

// 1. Hook types ki definition (Interface)
export interface IAuthDataHook {
  // Login ke liye hook type definition
  useLogin: (
    options?: TMutationOptions<AuthResponse, Error, Login>,
  ) => TMutationReturnType<AuthResponse, Login>;

  // Register ke liye hook type definition
  useRegister: (
    options?: TMutationOptions<AuthResponse, Error, Register>,
  ) => TMutationReturnType<AuthResponse, Register>;

  // Logout ke liye hook type definition
  useLogout: (
    options?: TMutationOptions<void, Error, void>,
  ) => TMutationReturnType<void, void>;
}

// 2. Auth hooks ki actual implementation jise components me use karenge
export const AuthDataHook: IAuthDataHook = {
  // 🔐 Login Hook: Isse user login API trigger hoti hai aur toast message show hota hai
  useLogin(options) {
    return useMutation({
      mutationFn: async (data) => await AuthService.login(data), // services/auth.ts me likha login function call karo
      onSuccess: (data, variables, context) => {
        // Successful login hone par server message ya default toast message dikhao
        toast.success(data.message || "Login successful!");
        // Page level success logic ko run karo (jaise screen redirection)
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        // Error aane par error message toast popup me dikhao
        toast.error(
          error?.response?.data?.message || error.message || "Failed to login.",
        );
        // Optional page level error logic call karo
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },

  // 📝 Register Hook: Isse naya account create hota hai aur toast display hota hai
  useRegister(options) {
    return useMutation({
      mutationFn: async (data) => await AuthService.register(data), // services/auth.ts me likha register function call karo
      onSuccess: (data, variables, context) => {
        // Account validation success hone par toast notification show karo
        toast.success(data.message || "Account created successfully!");
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        // Error details ko toast popup alert me user ko dikhao
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Failed to register.",
        );
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },

  // 🚪 Logout Hook: Isse active user session clear aur logout toast show hota hai
  useLogout(options) {
    const queryClient = useQueryClient(); // React Query cache clear karne ke liye client object
    return useMutation({
      mutationFn: async () => await AuthService.logout(), // Logout ki API call karo
      onSuccess: (data, variables, context) => {
        // Safely screen session cached data completely clear and invalidate queries
        queryClient.clear();
        toast.success("Logged out successfully");
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            "Failed to logout.",
        );
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },
};
