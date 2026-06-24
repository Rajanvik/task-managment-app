import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';

interface StatsGridProps {
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
}

export function StatsGrid({ completedTasks, pendingTasks, totalTasks }: StatsGridProps) {
  return (
    <View className="flex-row gap-3 mb-3">
      <Card className="flex-1 bg-secondary/40 border border-border/5 rounded-3xl p-5 items-center justify-center">
        <Text className="text-foreground font-black text-2xl">
          {completedTasks.toString().padStart(2, "0")}
        </Text>
        <Text className="text-muted-foreground font-bold text-[10px] uppercase tracking-tighter -mt-5">
          Completed
        </Text>
      </Card>

      <Card className="flex-1 bg-secondary/40 border border-border/5 rounded-3xl p-5 items-center justify-center">
        <Text className="text-foreground font-black text-2xl">
          {pendingTasks.toString().padStart(2, "0")}
        </Text>
        <Text className="text-muted-foreground font-bold text-[10px] uppercase tracking-tighter -mt-5">
          Pending
        </Text>
      </Card>

      <Card className="flex-1 bg-secondary/40 border border-border/5 rounded-3xl p-5 items-center justify-center">
        <Text className="text-foreground font-black text-2xl">
          {totalTasks.toString().padStart(2, "0")}
        </Text>
        <Text className="text-muted-foreground font-bold text-[10px] uppercase tracking-tighter -mt-5">
          Total
        </Text>
      </Card>
    </View>
  );
}
