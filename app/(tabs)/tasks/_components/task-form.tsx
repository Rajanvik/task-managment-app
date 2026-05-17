import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';

// Custom UI primitives
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// State, schemas, and styling utils
import { useTasks } from '@/context/TaskContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';
import { createTaskSchema, CreateTaskFormValues } from '@/lib/zod/tasks/create';
import { type SubTask } from '@/app/(tabs)/tasks/data/task-data';

// ==========================================
// Types & Interface Definitions
// ==========================================
interface TaskFormProps {
  initialData?: {
    title: string;
    description: string;
    category: string;
    dueDate?: string;
    steps?: SubTask[];
  };
  onSubmit: (task: { 
    title: string; 
    description: string; 
    category: string;
    dueDate?: string;
    steps?: SubTask[];
  }) => void;
  onCancel: () => void;
}

// ==========================================
// Timezone-Safe Date Helper Methods
// ==========================================
/**
 * Safely parses a YYYY-MM-DD string into a local midnight Date object
 * to prevent negative timezone offset day-shifting.
 */
const parseLocalDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);
  
  return new Date(year, month, day);
};

/**
 * Timezone-safe local date formatter converting a local Date object 
 * into a YYYY-MM-DD string without timezone or daylight shifts.
 */
const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// ==========================================
// Clean Component Implementation
// ==========================================
export function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];

  // 1. Component State Definitions
  const [triggerWidth, setTriggerWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [newStepText, setNewStepText] = useState('');
  
  // Dynamic local date picker hook, backed by timezone-safe parsers
  const [dueDate, setDueDate] = useState<Date>(parseLocalDate(initialData?.dueDate));

  // 2. Retrieve global subtask checklist state & modifiers from TaskContext
  const { formSteps, initFormSteps, addFormStep, removeFormStep } = useTasks();

  // 3. Sync draft steps & selected due date on initialData mount / changes
  useEffect(() => {
    initFormSteps(initialData?.steps || []);
  }, [initialData]);

  useEffect(() => {
    setDueDate(parseLocalDate(initialData?.dueDate));
  }, [initialData?.dueDate]);

  // 4. Form controller instantiation with zod validation schema
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'Work',
    },
  });

  // 5. Actions Handlers
  const handleFormSubmit = async (data: CreateTaskFormValues) => {
    console.log('Form validation success! Submitting draft task details...', data);
    setIsLoading(true);
    
    // Simulate slight backend network latency for high fidelity UX feedback
    await new Promise((resolve) => setTimeout(resolve, 800)); 
    
    onSubmit({
      title: data.title,
      description: data.description || '',
      category: data.category,
      dueDate: formatLocalDate(dueDate), // Zero offset shift formatting
      steps: formSteps, // Managed globally inside TaskContext!
    });
    
    setIsLoading(false);
    form.reset();
  };

  const handleAddNewStep = () => {
    if (!newStepText.trim()) return;
    addFormStep(newStepText.trim());
    setNewStepText('');
  };

  return (
    <Form {...form}>
      <View className="gap-4 py-1">
        
        {/* FIELD 1: Task Title Input */}
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
                  className="h-11 border-none bg-secondary/20 rounded-xl px-4 text-base focus:bg-secondary/30"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* FIELD 2: Timezone-Safe Due Date Popover Selector */}
        <View className="gap-2 relative z-30">
          <FormLabel className="text-sm font-bold text-foreground/70 ml-1">Due Date</FormLabel>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border border-border/40 bg-secondary/20 rounded-xl px-4 flex-row items-center justify-between"
                disabled={isLoading}
              >
                <Text className="text-foreground text-sm font-semibold">
                  {dueDate ? dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Pick a date'}
                </Text>
                <Text className="text-muted-foreground text-xs">📅</Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none bg-transparent">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setIsCalendarOpen(false);
                }}
                className="border border-border/45 shadow-2xl"
              />
            </PopoverContent>
          </Popover>
        </View>

        {/* FIELD 3: Scrollable Notes Text Area */}
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
                  className="h-24 border-none bg-secondary/20 rounded-xl px-4 py-3 text-sm focus:bg-secondary/30"
                  textAlignVertical="top"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* FIELD 4: Dynamic Priority Select Dropdown */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)} className="z-10">
              <FormLabel className="text-sm font-bold text-foreground/70 ml-1">Priority</FormLabel>
              <Select
                value={{ value: field.value.toLowerCase(), label: field.value }}
                onValueChange={(val) => field.onChange(val?.label || 'Work')}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-11 border-none bg-secondary/20 rounded-xl px-4">
                    <SelectValue
                      className="text-foreground text-sm"
                      placeholder="Select Category"
                    />
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

        {/* FIELD 5: Checklist Builder / Execution Steps Manager */}
        <View className="gap-2 z-10">
          <Text className="text-sm font-bold text-foreground/70 ml-1">Execution Steps</Text>
          <View className="flex-row gap-2">
            <Input
              placeholder="Add step..."
              value={newStepText}
              onChangeText={setNewStepText}
              editable={!isLoading}
              className="flex-1 h-11 border-none bg-secondary/20 rounded-xl px-4 text-base focus:bg-secondary/30"
            />
            <Button
              onPress={handleAddNewStep}
              className="h-11 w-11 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              <Plus size={18} color={theme.primaryForeground} />
            </Button>
          </View>

          {/* Sub-checklist rendering */}
          {formSteps.length > 0 && (
            <View className="bg-secondary/10 border border-border/20 rounded-xl p-3 gap-2 mt-1">
              {formSteps.map((step) => (
                <View key={step.id} className="flex-row items-center justify-between py-1 px-1">
                  <Text className="text-foreground text-sm flex-1 mr-2 font-medium">{step.title}</Text>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => removeFormStep(step.id)}
                    className="h-6 w-6 rounded-full bg-destructive/10 active:bg-destructive/20 border border-destructive/10 items-center justify-center"
                  >
                    <X size={11} color="#ef4444" />
                  </Button>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ACTION CONTROL BUTTONS (Dismiss & Submit) */}
        <View className="flex-row gap-3 mt-4 z-10">
          <Button variant="outline" className="flex-1 h-11 rounded-xl" onPress={onCancel} disabled={isLoading}>
            <Text className="font-bold text-foreground text-sm">Dismiss</Text>
          </Button>
          <Button 
            className="flex-[2] h-11 rounded-xl shadow-lg shadow-primary/20 flex-row items-center justify-center gap-2" 
            onPress={async () => {
              console.log("Add/Update Task button tapped!");
              const isValid = await form.trigger();
              
              if (isValid) {
                form.handleSubmit(handleFormSubmit)();
              }
            }} 
            disabled={isLoading}
          >
            {isLoading && <Spinner size={16} color={theme.primaryForeground} />}
            <Text className="font-bold text-base text-primary-foreground">
              {initialData ? 'Update Task' : 'Add Task'}
            </Text>
          </Button>
        </View>

      </View>
    </Form>
  );
}
