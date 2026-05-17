import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Perform redirection asynchronously after the root layout is cleanly mounted
    router.replace('/home');
  }, [router]);

  return <View className="flex-1 bg-background" />;
}
