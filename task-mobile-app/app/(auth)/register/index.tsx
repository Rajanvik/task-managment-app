import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { AuthDataHook } from "@/lib/data-hooks/auth";
import { useRouter } from "expo-router";
import { Lock, Mail, User, UserPlus } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { TRegister, ZRegister } from "@/lib/zod/user/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface IRegisterScreenProps {}

const RegisterScreen: React.FC<IRegisterScreenProps> = () => {
  const router = useRouter();

  const form = useForm<TRegister>({
    resolver: zodResolver(ZRegister),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 🔍 STEP 1: useRegister Hook call karo aur data save ke lifecycle events handle karo
  const { mutate, isPending } = AuthDataHook.useRegister({
    onSuccess: () => {
      form.reset(); // Form fields clear/reset karo
      // Small delay so navigator is fully ready in production APK builds
      setTimeout(() => {
        router.replace("/login"); // Login screen par navigate karo
      }, 100);
    },
  });

  // confirmPassword sirf frontend validation ke liye — backend ko nahi bhejte
  function onSubmit(values: TRegister) {
    mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-8 py-10">
          {/* Header section */}
          <View className="mb-10 items-center">
            <View className="p-4 bg-primary/10 rounded-full mb-4">
              <Icon as={UserPlus} size={40} className="text-foreground" />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">
              Create Account
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-2">
              Join us to track priorities and stay organized
            </Text>
          </View>

          {/* Form container */}
          <View className="space-y-4">
            <Form {...form}>
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        icon={User}
                        placeholder="John Doe"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        icon={Mail}
                        placeholder="name@example.com"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        icon={Lock}
                        placeholder="At least 6 characters"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        icon={Lock}
                        placeholder="Re-enter your password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                onPress={form.handleSubmit(onSubmit)}
                disabled={isPending}
                className="w-full mt-6 h-12 rounded-xl bg-primary items-center justify-center flex-row shadow-sm"
              >
                {isPending ? (
                  <Spinner size={16} className="text-primary-foreground" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-primary-foreground font-bold text-base">
                      Register
                    </Text>
                    <Icon
                      as={UserPlus}
                      size={18}
                      className="text-primary-foreground"
                    />
                  </View>
                )}
              </Button>
            </Form>

            {/* Navigate to Login */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-muted-foreground">
                Already have an account?{" "}
              </Text>
              <Button
                variant="link"
                className="p-0 h-auto"
                onPress={() => router.push("/login")}
              >
                <Text className="text-sm text-primary font-bold">Login</Text>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
