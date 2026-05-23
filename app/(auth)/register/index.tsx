import React from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthDataHook } from '@/hooks/data-hooks/use-auth';
import { User, Mail, Lock, UserPlus } from 'lucide-react-native';
import { toast } from '@/lib/toast';
import { Icon } from '@/components/ui/icon';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZRegister, TRegister } from '@/lib/zod/user/register';

interface IRegisterScreenProps {}

const RegisterScreen: React.FC<IRegisterScreenProps> = () => {
  const router = useRouter();

  const form = useForm<TRegister>({
    resolver: zodResolver(ZRegister),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // 🔍 STEP 1: useRegister Hook call karo aur data save ke lifecycle events handle karo
  const { mutate, isPending } = AuthDataHook.useRegister({
    // 👉 onSuccess: Jab account register ho jayega
    onSuccess: () => {
      router.replace('/login'); // 1. Login screen page par navigate karo
      form.reset(); // 2. Form fields clear/reset karo
    },
  });

  // confirmPassword sirf frontend validation ke liye — backend ko nahi bhejte
  function onSubmit(values: TRegister) {
    mutate({ name: values.name, email: values.email, password: values.password });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-8 py-10">
          
          {/* Header section */}
          <View className="mb-10 items-center">
            <View className="p-4 bg-primary/10 rounded-full mb-4">
              <Icon as={UserPlus} size={40} className="text-foreground" />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">Create Account</Text>
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
                      <View className="flex-row items-center bg-card border border-border rounded-xl px-3.5 h-12">
                        <Icon as={User} size={18} className="text-muted-foreground mr-3" />
                        <Input
                          placeholder="John Doe"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="words"
                          className="flex-1 text-foreground text-sm border-0 h-full shadow-none bg-transparent"
                        />
                      </View>
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
                      <View className="flex-row items-center bg-card border border-border rounded-xl px-3.5 h-12">
                        <Icon as={Mail} size={18} className="text-muted-foreground mr-3" />
                        <Input
                          placeholder="name@example.com"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          className="flex-1 text-foreground text-sm border-0 h-full shadow-none bg-transparent"
                        />
                      </View>
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
                      <View className="flex-row items-center bg-card border border-border rounded-xl px-3.5 h-12">
                        <Icon as={Lock} size={18} className="text-muted-foreground mr-3" />
                        <Input
                          placeholder="At least 6 characters"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry
                          autoCapitalize="none"
                          className="flex-1 text-foreground text-sm border-0 h-full shadow-none bg-transparent"
                        />
                      </View>
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
                      <View className="flex-row items-center bg-card border border-border rounded-xl px-3.5 h-12">
                        <Icon as={Lock} size={18} className="text-muted-foreground mr-3" />
                        <Input
                          placeholder="Re-enter your password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry
                          autoCapitalize="none"
                          className="flex-1 text-foreground text-sm border-0 h-full shadow-none bg-transparent"
                        />
                      </View>
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-primary-foreground font-bold text-base">Register</Text>
                    <Icon as={UserPlus} size={18} className="text-primary-foreground" />
                  </View>
                )}
              </Button>
            </Form>

            {/* Navigate to Login */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-muted-foreground">Already have an account? </Text>
              <Button
                variant="link"
                className="p-0 h-auto"
                onPress={() => router.push('/login')}
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
