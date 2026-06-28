import React from 'react';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: any;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <Card className="border-none bg-card rounded-[32px] p-2 shadow-sm shadow-black/5 overflow-hidden gap-0">
      <CardHeader className="gap-0 py-3.5 px-4">
        <View className="bg-secondary/50 w-11 h-11 rounded-full items-center justify-center mb-3">
          <Icon size={22} as={icon} className="text-muted-foreground" />
        </View>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground mb-1.5">{title}</CardTitle>
        <CardDescription className="text-sm leading-5">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
