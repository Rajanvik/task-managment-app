import React from 'react';
import { View } from 'react-native';
import { Loader, type LucideProps } from 'lucide-react-native';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 16, ...props }: LucideProps & { className?: string }) {
  return (
    <Loader
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      size={size}
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}

export function SpinnerCustom() {
  return (
    <View className="flex-row items-center gap-4">
      <Spinner />
    </View>
  );
}
