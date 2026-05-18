import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, CheckCircle2, Calendar, CheckSquare, FileText } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';
import { useTasks } from '@/context/TaskContext';
import { toast } from '@/lib/toast';
import type { SubTask } from '@/app/(tabs)/tasks/data/task-data';

interface SubTaskItemProps {
  step: SubTask;
  taskId: string;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
}

function SubTaskItem({ step, taskId, toggleSubTask }: SubTaskItemProps) {
  const router = useRouter();
  const [localCompleted, setLocalCompleted] = React.useState(step.completed);

  React.useEffect(() => {
    setLocalCompleted(step.completed);
  }, [step.completed]);

  const handlePress = () => {
    const nextCompleted = !localCompleted;
    
    // 1. Instantly tick locally in the current frame
    setLocalCompleted(nextCompleted);

    // 2. Schedule the navigation push in the very next animation paint frame.
    // This allows the step tick to render instantly with zero lag,
    // and then launches the transition with zero stutters!
    requestAnimationFrame(() => {
      router.push({
        pathname: '/celebration',
        params: {
          title: nextCompleted ? 'Step Completed! 🎉' : 'Step Reactivated ⚙️',
          description: nextCompleted
            ? `Awesome! You completed the step: "${step.title}".`
            : `Step: "${step.title}" is now active again.`,
          type: nextCompleted ? 'complete' : 'add'
        }
      });
    });

    // 3. Defer store modifications until the slide animation is fully complete (600ms)
    setTimeout(() => {
      toggleSubTask(taskId, step.id);
    }, 600);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center gap-3 active:opacity-75 py-1"
    >
      {localCompleted ? (
        <CheckCircle2 size={20} color="#10b981" />
      ) : (
        <View className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
      )}
      <Text className={`text-base ${localCompleted ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'}`}>
        {step.title}
      </Text>
    </Pressable>
  );
}

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];
  const { tasks, toggleStatus, toggleSubTask } = useTasks();

  const task = tasks.find((t) => t.id === String(id));

  if (!task) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-xl font-bold text-foreground">Task not found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text className="font-bold">Go Back</Text>
        </Button>
      </View>
    );
  }

  const { title, description, category, status, dueDate, steps = [] } = task;
  const isCompleted = status === 'Completed';

  // Custom styling colors based on Category
  const getCategoryStyles = (cat: string) => {
    switch (String(cat).toLowerCase()) {
      case 'work':
        return { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' };
      case 'personal':
        return { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' };
      case 'urgent':
        return { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' };
      default:
        return { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' };
    }
  };

  const catStyle = getCategoryStyles(String(category || 'Work'));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Floating Header Back Button */}
      <View className="absolute top-14 left-6 z-20 flex-row items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          onPress={() => router.back()} 
          className="bg-card border border-border rounded-full h-11 w-11 shadow-lg shadow-black/15 flex items-center justify-center"
        >
          <ChevronLeft color={theme.foreground} size={20} />
        </Button>
        <View className="bg-card px-4 py-2 rounded-full border border-border shadow-md">
          <Text className="text-sm font-bold text-foreground tracking-wide">Task Details</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* BANNER WITH ABSTRACT PATTERNS */}
        <View className="h-64 bg-secondary/40 relative overflow-hidden justify-end pb-8 px-6">
          <View className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <View className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background to-transparent" />
          
          <View className="gap-2.5">
            <Badge variant="outline" className={`self-start ${catStyle.bg} ${catStyle.border} px-3 py-1`}>
              <Text className={`${catStyle.text} text-[10px] font-black uppercase tracking-widest`}>
                {String(category || 'Work')}
              </Text>
            </Badge>

            <Text className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {title || 'Untitled Task'}
            </Text>
          </View>
        </View>

        {/* DETAILS CONTAINER */}
        <View className="px-6 py-6 rounded-t-[40px] bg-background -mt-6 flex-1 min-h-[600px]">
          {/* STATS MATRIX */}
          <View className="flex-row items-center gap-4 bg-secondary/30 border border-border/5 rounded-[28px] p-4 mb-6">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center">
                <Calendar size={18} color={theme.primary} />
              </View>
              <View>
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Due Date</Text>
                <Text className="text-foreground text-sm font-semibold mt-0.5">{dueDate || 'Flexible'}</Text>
              </View>
            </View>

            <Separator orientation="vertical" className="h-8 opacity-40" />

            <View className="flex-1 flex-row items-center gap-3">
              <View className={`h-10 w-10 ${isCompleted ? 'bg-emerald-500/10' : 'bg-amber-500/10'} rounded-full items-center justify-center`}>
                <CheckCircle2 size={18} color={isCompleted ? '#10b981' : '#f59e0b'} />
              </View>
              <View>
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Status</Text>
                <Text className={`text-sm font-semibold mt-0.5 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {status || 'Pending'}
                </Text>
              </View>
            </View>
          </View>

          {/* TASK DESCRIPTION */}
          <View className="mb-6 bg-card border border-border/40 rounded-[28px] p-5 shadow-sm shadow-black/5">
            <View className="flex-row items-center gap-2 mb-3.5">
              <FileText size={18} color={theme.primary} />
              <Text className="text-base font-bold text-foreground">Task Overview</Text>
            </View>
            <Text className="text-muted-foreground text-base leading-7">
              {description || 'No detailed briefing was provided for this task. It represents a focal activity within your checklist queue designed to contribute towards your general weekly progress.'}
            </Text>
          </View>

          {/* SUB-TASKS / CHECKLIST */}
          {steps.length > 0 && (
            <View className="mb-8 bg-card border border-border/40 rounded-[28px] p-5 shadow-sm shadow-black/5">
              <View className="flex-row items-center gap-2 mb-4">
                <CheckSquare size={18} color={theme.primary} />
                <Text className="text-base font-bold text-foreground">Execution Steps</Text>
              </View>

              <View className="gap-3.5">
                {steps.map((step) => (
                  <SubTaskItem
                    key={step.id}
                    step={step}
                    taskId={task.id}
                    toggleSubTask={toggleSubTask}
                  />
                ))}
              </View>
            </View>
          )}

          {/* DYNAMIC ACTIONS */}
          <View className="pb-16 gap-4">
            <Button 
              onPress={() => {
                const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
                
                // 1. Instantly navigate to celebration modal in the next paint frame
                requestAnimationFrame(() => {
                  router.push({
                    pathname: '/celebration',
                    params: {
                      title: nextStatus === 'Completed' ? 'Victory! Task Completed 🥳' : 'Task Re-opened 🎯',
                      description: nextStatus === 'Completed'
                        ? `Fantastic job! You have successfully finished "${task.title}". Keep up the superb momentum!`
                        : `"${task.title}" has been set back to active. Let's conquer it again!`,
                      type: nextStatus === 'Completed' ? 'complete' : 'add'
                    }
                  });
                });
                
                // 2. Process database state alterations after the transition is fully complete (600ms)
                setTimeout(() => {
                  toggleStatus(task.id);
                }, 600);
              }}
              className={`h-14 rounded-2xl flex-row gap-2.5 shadow-xl ${isCompleted ? 'bg-secondary border border-border/30 shadow-black/5' : 'bg-primary shadow-primary/20'}`}
            >
              <CheckCircle2 size={20} color={isCompleted ? theme.foreground : theme.primaryForeground} />
              <Text className={`font-bold text-base ${isCompleted ? 'text-foreground' : 'text-primary-foreground'}`}>
                {isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
