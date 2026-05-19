import React from 'react';
import { View } from 'react-native';
import { Target, Trophy, Sparkles } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME } from '@/lib/theme';

interface ProgressCardProps {
  completedTasks: number;
  progressPercentage: number;
}

export function ProgressCard({ completedTasks, progressPercentage }: ProgressCardProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme];
  const isFinished = progressPercentage === 100;

  return (
    <Card className="mb-3 bg-card border border-border/10 shadow-xl rounded-3xl overflow-hidden">
      {/* Compact Decorative Background Accents */}
      <View className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-6 -mt-6" />
      <View className={`absolute -bottom-8 -left-8 w-16 h-16 ${isFinished ? 'bg-amber-500/5' : 'bg-green-500/5'} rounded-full`} />

      <View className="p-5">
        {/* Header section */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className={`h-10 w-10 ${isFinished ? 'bg-amber-500/10' : 'bg-green-500/10'} rounded-2xl items-center justify-center`}>
              {isFinished ? (
                <Trophy size={21} color="#f59e0b" />
              ) : (
                <Target size={21} color="#22c55e" />
              )}
            </View>
            <View className="justify-center">
              <Text className="text-lg font-black text-foreground leading-5 tracking-tight">
                Weekly Goals
              </Text>
              <Text className={`text-[10px] font-black ${isFinished ? 'text-amber-500' : 'text-green-600'} uppercase tracking-widest leading-3`}>
                Productivity
              </Text>
            </View>
          </View>

          <Badge
            variant="default"
            className={`border-none px-2.5 py-1 rounded-full ${isFinished ? 'bg-amber-500/10' : 'bg-green-500/10'}`}
          >
            <Text className={`font-black text-[9px] tracking-wider uppercase ${isFinished ? 'text-amber-600' : 'text-green-600'}`}>
              {isFinished ? "FINISHED" : "ON TRACK"}
            </Text>
          </Badge>
        </View>

        {/* Compact Progress Bar Container with Snug Margins */}
        <View className="bg-secondary/20 rounded-xl p-2.5 mb-2 border border-border/5">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-muted-foreground text-xs font-semibold">
              Completion Level
            </Text>
            <Text className="font-black text-primary text-sm">
              {progressPercentage}%
            </Text>
          </View>

          <View className="h-2 bg-muted rounded-full overflow-hidden mb-1">
            <View
              className={`h-full rounded-full ${isFinished ? 'bg-amber-500' : 'bg-primary'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </View>

          <Text className="text-muted-foreground text-[10px] font-medium">
            {completedTasks} tasks completed successfully
          </Text>
        </View>

        {/* Compact Footer with Crisp and Increased Size for Motivation Message */}
        <View className="flex-row items-center gap-1.5 border-t border-border/10 pt-1.5 mt-0.5">
          <View className="h-4.5 w-4.5 bg-primary/10 rounded-full items-center justify-center">
            <Sparkles size={9} color={theme.primary} />
          </View>
          <Text className="text-xs text-muted-foreground font-bold flex-1 leading-snug">
            {isFinished
              ? "All goals achieved successfully! Great work! 🏆"
              : "Complete pending items to reach 100%!"}
          </Text>
        </View>
      </View>
    </Card>
  );
}
