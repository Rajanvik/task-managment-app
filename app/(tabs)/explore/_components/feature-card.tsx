import React from 'react';
import { View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <Card className="border-none bg-card rounded-[32px] p-2 shadow-sm shadow-black/5 overflow-hidden gap-0">
      <CardHeader className="gap-0 py-2 px-3">
        <View className="bg-secondary/50 w-11 h-11 rounded-full items-center justify-center mb-1">
          <IconSymbol size={22} name={icon as any} color="gray" />
        </View>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">{title}</CardTitle>
        <CardDescription className="text-sm leading-5 -mt-0.5">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
