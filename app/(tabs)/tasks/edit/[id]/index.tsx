import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { TaskForm } from '../../_components/task-form';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // In a real app, you would fetch the task data using this 'id'
  const mockInitialData = {
    title: 'Design meeting',
    description: 'Discuss the new features with the team',
    category: 'Work',
  };

  const handleEditSubmit = (task: { title: string; description: string; category: string }) => {
    // Add logic to update the task here
    console.log('Task updated:', id, task);
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
        <Text className="text-2xl font-bold text-foreground">Edit Task</Text>
        <Text className="text-base text-muted-foreground mt-1">Update your task details below.</Text>
      </View>
      
      <TaskForm 
        initialData={mockInitialData} 
        onSubmit={handleEditSubmit} 
        onCancel={handleCancel} 
      />
    </ScrollView>
  );
}
