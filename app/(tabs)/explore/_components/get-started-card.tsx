import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface IGetStartedCardProps {}

export const GetStartedCard: React.FC<IGetStartedCardProps> = () => {
  return (
    <Card className="border-none bg-muted/30 rounded-[32px] p-6 mt-4 items-center gap-4">
      <CardTitle className="text-lg font-bold text-center text-foreground">
        Ready to master your schedule?
      </CardTitle>
      <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/10">
        <Text className="font-bold">Get Started Now</Text>
      </Button>
    </Card>
  );
}
