import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { TaskForm } from '../_components/task-form';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAddSubmit = (task: { title: string; description: string; category: string }) => {
    // Add logic to save the task here
    console.log('Task added:', task);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-foreground">Create New Task</Text>
        <Text className="text-base text-muted-foreground mt-1">Fill in the details below to add a new task.</Text>
      </View>
      
      <TaskForm onSubmit={handleAddSubmit} onCancel={handleCancel} />
    </ScrollView>
  );
}
