import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { AuthDataHook } from "@/lib/data-hooks/auth";
import { useRouter } from "expo-router";
import { Lock, LogIn, Mail } from "lucide-react-native";
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
import { TLogin, ZLogin } from "@/lib/zod/user/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface ILoginScreenProps {}

const LoginScreen: React.FC<ILoginScreenProps> = () => {
  const router = useRouter(); // Sirf Register button navigation ke liye (login redirect useRouteGuard karta hai)
  const form = useForm<TLogin>({
    resolver: zodResolver(ZLogin),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 🔍 STEP 1: useLogin Hook call karo aur data save ke lifecycle events handle karo
  // Login success ke baad /home par navigate karo.
  // useRouteGuard DOUBLE navigate nahi karta kyunki:
  //   - Yahan navigate karte hain → segments change hokar (tabs)/home ban jaate hain
  //   - useRouteGuard home pe check karta hai → condition false (not isRoot, not inAuthGroup) → kuch nahi karta
  // isliye production APK me crash nahi hoga.
  const { mutate, isPending } = AuthDataHook.useLogin({
    onSuccess: () => {
      form.reset(); // Form inputs clear karo
      // Production APK me navigator fully mount hone ka wait karo, phir navigate karo
      setTimeout(() => {
        router.replace('/home' as any);
      }, 200);
    },
  });

  // 🔍 STEP 2: Submit handler jo input details validation ke baad hit hoga
  function onSubmit(values: TLogin) {
    mutate(values); // Api call trigger karne ke liye mutate execute karo
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
              <Icon as={LogIn} size={40} className="text-foreground" />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center">
              Welcome Back
            </Text>
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
                        placeholder="Enter your password"
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
                      Login
                    </Text>
                    <Icon
                      as={LogIn}
                      size={18}
                      className="text-primary-foreground"
                    />
                  </View>
                )}
              </Button>
            </Form>

            {/* Navigate to Register */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-muted-foreground">
                Don't have an account?{" "}
              </Text>
              <Button
                variant="link"
                className="p-0 h-auto"
                onPress={() => router.push("/register")}
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
