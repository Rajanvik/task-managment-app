import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface IFaqAccordionProps {}

export const FaqAccordion: React.FC<IFaqAccordionProps> = () => {
  return (
    <View className="bg-muted/30 rounded-3xl p-5 mb-6">
      <Text className="text-lg font-bold mb-3 text-foreground">
        Common Questions
      </Text>
      <Accordion type="single" collapsible>
        <AccordionItem
          value="item-1"
          className="border-none mb-1.5 bg-background rounded-xl"
        >
          <AccordionTrigger className="px-4 py-2">
            <Text className="font-semibold text-sm">
              How to create a task?
            </Text>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <Text className="text-muted-foreground text-xs">
              Click the "+" button in the Tasks tab.
            </Text>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-2"
          className="border-none bg-background rounded-xl"
        >
          <AccordionTrigger className="px-4 py-2">
            <Text className="font-semibold text-sm">
              Can I sync my data?
            </Text>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <Text className="text-muted-foreground text-xs">
              Yes, syncing is automatic across devices.
            </Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </View>
  );
}
