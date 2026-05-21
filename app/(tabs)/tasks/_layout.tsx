import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="add/index" options={{ presentation: 'transparentModal', animation: 'none' }} />
      <Stack.Screen name="edit/[id]/index" options={{ presentation: 'transparentModal', animation: 'none' }} />
    </Stack>
  );
}
