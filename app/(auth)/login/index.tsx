import React from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthDataHook } from '@/hooks/data-hooks/use-auth';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { toast } from '@/lib/toast';
import { Icon } from '@/components/ui/icon';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZLogin, TLogin } from '@/lib/zod/user/login';

interface ILoginScreenProps {}

const LoginScreen: React.FC<ILoginScreenProps> = () => {
  const router = useRouter();

  const form = useForm<TLogin>({
    resolver: zodResolver(ZLogin),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 🔍 STEP 1: useLogin Hook call karo aur data save ke lifecycle events handle karo
  const { mutate, isPending } = AuthDataHook.useLogin({
    // 👉 onSuccess: Jab user details valid honge aur login successful ho jayega
    onSuccess: () => {
      router.replace('/home'); // 1. Home page/dashboard par le jao
      form.reset(); // 2. Form input values ko reset/clear karo
    },
  });

  // 🔍 STEP 2: Submit handler jo input details validation ke baad hit hoga
  function onSubmit(values: TLogin) {
    mutate(values); // Api call trigger karne ke liye mutate execute karo
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
              <Icon as={LogIn} size={40} className="text-foreground" />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">Welcome Back</Text>
            <Text className="text-sm text-muted-foreground text-center mt-2">
              Sign in to keep organizing your daily tasks
            </Text>
          </View>

          {/* Form container */}
          <View className="space-y-4">
            
            <Form {...form}>
              
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
                          placeholder="Enter your password"
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
                    <Text className="text-primary-foreground font-bold text-base">Login</Text>
                    <Icon as={LogIn} size={18} className="text-primary-foreground" />
                  </View>
                )}
              </Button>
            </Form>

            {/* Navigate to Register */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-muted-foreground">Don't have an account? </Text>
              <Button
                variant="link"
                className="p-0 h-auto"
                onPress={() => router.push('/register')}
              >
                <Text className="text-sm text-primary font-bold">Register</Text>
              </Button>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
