import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type TCategory = 'All' | 'Work' | 'Personal' | 'Urgent';
const CATEGORIES: TCategory[] = ['All', 'Work', 'Personal', 'Urgent'];

interface ICategoryFilterChipsProps {
  active: TCategory;
  onChange: (cat: TCategory) => void;
}

export const CategoryFilterChips: React.FC<ICategoryFilterChipsProps> = ({ active, onChange }) => {
  return (
    <View className="mb-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onChange(cat)}
              className={cn(
                'px-4 py-2 rounded-2xl mr-2 border active:scale-95',
                isActive ? 'bg-foreground border-foreground' : 'bg-secondary/20 border-border/40'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-extrabold',
                  isActive ? 'text-background' : 'text-muted-foreground'
                )}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
