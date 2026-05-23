import React from 'react';
import { View, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { EmptyStateIllustration } from './empty-state-illustration';

type TCategory = 'All' | 'Work' | 'Personal' | 'Urgent';

const EMPTY_CONTENT: Record<TCategory, { title: string; description: string }> = {
  Work: {
    title: 'No Professional Tasks Scheduled',
    description: 'Your work checklist is fully accomplished. Take a quick breather, or tap below to outline your next professional milestone and keep scaling your goals.',
  },
  Personal: {
    title: 'No Personal Goals Listed',
    description: 'Your personal space is perfectly clear. Take this window of opportunity to recharge, focus on self-care, or schedule your next exciting personal passion project.',
  },
  Urgent: {
    title: 'No High-Priority Actions',
    description: "Excellent job! All critical and time-sensitive tasks have been successfully resolved. You're fully ahead of schedule with zero critical blockers.",
  },
  All: {
    title: 'Your Workspace is Crystal Clear',
    description: "You've successfully completed all your scheduled goals! Celebrate this moment of peak productivity, or tap below to organize your next big achievement.",
  },
};

interface ITasksEmptyStateProps {
  filter: TCategory;
}

export const TasksEmptyState: React.FC<ITasksEmptyStateProps> = ({ filter }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { title, description } = EMPTY_CONTENT[filter];

  return (
    <View className="items-center justify-center py-6 px-4">
      <View className="items-center justify-center mb-6">
        <EmptyStateIllustration />
      </View>

      <Text className="text-[22px] font-black text-foreground text-center tracking-tight leading-7 mt-1 px-4">
        {title}
      </Text>
      <Text className="text-muted-foreground text-[14px] font-medium text-center max-w-[290px] mt-3.5 leading-5 px-2">
        {description}
      </Text>

      <Pressable
        onPress={() => router.push('/tasks/add' as any)}
        className="mt-6 px-5 py-2.5 bg-secondary/50 dark:bg-secondary/10 border border-border/40 rounded-full active:scale-95 flex-row items-center gap-2"
      >
        <Plus size={14} color={theme.foreground} />
        <Text className="text-xs font-bold text-foreground">Add first task</Text>
      </Pressable>
    </View>
  );
};
