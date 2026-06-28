import { Eye, Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { type Task } from "@/lib/types/tasks";

interface TaskOptionsSheetProps {
  task: Task | null;
  visible: boolean;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskOptionsSheet: React.FC<TaskOptionsSheetProps> = ({
  task,
  visible,
  onClose,
  onView,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Options"
      description={`Manage task: ${task.title.length > 25 ? task.title.substring(0, 25) + "..." : task.title}`}
    >
      {/* 3-Column Compact Grid with Individual Icon Backgrounds */}
      <View className="flex-row w-full gap-2.5 pb-2 pt-1">
        {/* COLUMN 1: VIEW */}
        <Pressable
          onPress={onView}
          className="flex-1 items-center justify-center py-4 bg-secondary/10 active:bg-secondary/25 rounded-2xl border border-border/40"
        >
          <View className="w-9 h-9 rounded-xl bg-secondary/30 border border-border/40 items-center justify-center mb-1.5">
            <Icon as={Eye} className="text-foreground" size={16} />
          </View>
          <Text className="text-xs font-bold text-foreground">View</Text>
        </Pressable>

        {/* COLUMN 2: EDIT */}
        <Pressable
          onPress={onEdit}
          className="flex-1 items-center justify-center py-4 bg-secondary/10 active:bg-secondary/25 rounded-2xl border border-border/40"
        >
          <View className="w-9 h-9 rounded-xl bg-secondary/30 border border-border/40 items-center justify-center mb-1.5">
            <Icon as={Pencil} className="text-foreground" size={15} />
          </View>
          <Text className="text-xs font-bold text-foreground">Edit</Text>
        </Pressable>

        {/* COLUMN 3: DELETE (Destructive) */}
        <Pressable
          onPress={onDelete}
          className="flex-1 items-center justify-center py-4 bg-destructive/[0.03] active:bg-destructive/15 rounded-2xl border border-destructive/15"
        >
          <View className="w-9 h-9 rounded-xl bg-destructive/10 border border-destructive/20 items-center justify-center mb-1.5">
            <Icon as={Trash2} className="text-destructive" size={16} />
          </View>
          <Text className="text-xs font-bold text-destructive">Delete</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
};
