import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';

// UI primitives
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { BottomSheet } from '@/components/ui/bottom-sheet';

// State, schemas, and types
import { TaskDataHook } from '@/hooks/data-hooks/use-task';
import { useTheme } from '@/hooks/use-theme';
import { parseLocalDate, formatLocalDate } from '@/lib/date';
import { ZCreateTask, TCreateTask } from '@/lib/zod/tasks';   // index.ts se

// ──────────────────────────────────────────
// Add Task Screen — BottomSheet modal route
// ──────────────────────────────────────────
interface IAddTaskScreenProps {}

const AddTaskScreen: React.FC<IAddTaskScreenProps> = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [triggerWidth, setTriggerWidth] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [newStepText, setNewStepText] = useState('');
  const [formSteps, setFormSteps] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);

  // dueDate bhi form ke andar — example pattern jaisa
  const form = useForm<TCreateTask>({
    resolver: zodResolver(ZCreateTask),
    defaultValues: {
      title: '',
      description: '',
      category: 'Work' as any,
      dueDate: formatLocalDate(new Date()),
    },
  });

  const { mutate: createTask, isPending: isLoading } = TaskDataHook.useCreateTask({
    onSuccess: (_, variables) => {
      form.reset();
      setFormSteps([]);
      router.back();
      router.push({
        pathname: '/celebration',
        params: {
          title: 'Task Successfully Created',
          description: `"${variables.title}" has been added to your checklist. Let's make progress!`,
          type: 'add',
        },
      });
    },
  });

  function onSubmit(values: TCreateTask) {
    createTask({
      title: values.title,
      description: values.description || '',
      category: values.category as any,
      dueDate: values.dueDate,
      steps: formSteps.map((s) => ({ title: s.title, completed: false })),
    });
  }

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setFormSteps((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newStepText.trim(), completed: false },
    ]);
    setNewStepText('');
  };

  return (
    <BottomSheet
      visible
      onClose={() => router.back()}
      title="New Task"
      description="Please fill out the details below."
    >
      <Form {...form}>
        <View className="gap-4 py-1">

          {/* Task Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-foreground/70 ml-1">Task Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Design meeting"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    editable={!isLoading}
                    className="h-11 border-none bg-secondary/20 rounded-xl px-4 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date — form field ke andar, example pattern jaisa */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="gap-2 relative z-30">
                <FormLabel className="text-sm font-bold text-foreground/70 ml-1">Due Date</FormLabel>
                <FormControl>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 border border-border/40 bg-secondary/20 rounded-xl px-4 flex-row items-center justify-between"
                        disabled={isLoading}
                      >
                        <Text className="text-foreground text-sm font-semibold">
                          {field.value
                            ? parseLocalDate(field.value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'Pick a date'}
                        </Text>
                        <Text className="text-muted-foreground text-xs">📅</Text>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none bg-transparent">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseLocalDate(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? formatLocalDate(date) : field.value);
                          setIsCalendarOpen(false);
                        }}
                        className="border border-border/45 shadow-2xl"
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="z-10">
                <FormLabel className="text-sm font-bold text-foreground/70 ml-1">Notes</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Details..."
                    value={field.value || ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    editable={!isLoading}
                    multiline
                    numberOfLines={3}
                    className="h-24 border-none bg-secondary/20 rounded-xl px-4 py-3 text-sm"
                    textAlignVertical="top"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category / Priority */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)} className="z-10">
                <FormLabel className="text-sm font-bold text-foreground/70 ml-1">Priority</FormLabel>
                <Select
                  value={{ value: field.value?.toLowerCase() ?? 'work', label: field.value ?? 'Work' }}
                  onValueChange={(val) => field.onChange(val?.label || 'Work')}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 border-none bg-secondary/20 rounded-xl px-4">
                      <SelectValue className="text-foreground text-sm" placeholder="Select Priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    side="top"
                    portalHost="bottom-sheet"
                    insets={{ top: insets.top, bottom: insets.bottom, left: 12, right: 12 }}
                    className="rounded-xl border-none shadow-xl"
                    style={triggerWidth ? { width: triggerWidth } : undefined}
                  >
                    <SelectGroup>
                      <SelectItem label="Work" value="work" className="h-10" />
                      <SelectItem label="Personal" value="personal" className="h-10" />
                      <SelectItem label="Urgent" value="urgent" className="h-10" />
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Execution Steps */}
          <View className="gap-2 z-10">
            <Text className="text-sm font-bold text-foreground/70 ml-1">Execution Steps</Text>
            <View className="flex-row gap-2">
              <Input
                placeholder="Add step..."
                value={newStepText}
                onChangeText={setNewStepText}
                editable={!isLoading}
                className="flex-1 h-11 border-none bg-secondary/20 rounded-xl px-4 text-base"
              />
              <Button
                onPress={handleAddStep}
                className="h-11 w-11 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                <Plus size={18} color={theme.primaryForeground} />
              </Button>
            </View>
            {formSteps.length > 0 && (
              <View className="bg-secondary/10 border border-border/20 rounded-xl p-3 gap-2 mt-1">
                {formSteps.map((step) => (
                  <View key={step.id} className="flex-row items-center justify-between py-1 px-1">
                    <Text className="text-foreground text-sm flex-1 mr-2 font-medium">{step.title}</Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => setFormSteps((prev) => prev.filter((s) => s.id !== step.id))}
                      className="h-6 w-6 rounded-full bg-destructive/10 border border-destructive/10 items-center justify-center"
                    >
                      <X size={11} color="#ef4444" />
                    </Button>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4 z-10">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text className="font-bold text-foreground text-sm">Dismiss</Text>
            </Button>
            {/* Example pattern: form.handleSubmit(onSubmit) seedha */}
            <Button
              className="flex-[2] h-11 rounded-xl shadow-lg shadow-primary/20 flex-row items-center justify-center gap-2"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading && <Spinner size={16} color={theme.primaryForeground} />}
              <Text className="font-bold text-base text-primary-foreground">Add Task</Text>
            </Button>
          </View>

        </View>
      </Form>
    </BottomSheet>
  );
};

export default AddTaskScreen;
