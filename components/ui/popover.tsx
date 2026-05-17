import * as React from 'react';
import { View, Platform, Pressable } from 'react-native';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { FadeIn, FadeOut } from 'react-native-reanimated';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover compound components must be rendered inside a Popover wrapper');
  }
  return context;
}

export function Popover({
  children,
  open,
  onOpenChange
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [localOpen, setLocalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : localOpen;

  const setOpen = React.useCallback((value: boolean) => {
    if (!isControlled) {
      setLocalOpen(value);
    }
    onOpenChange?.(value);
  }, [isControlled, onOpenChange]);

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen }}>
      <View className="relative z-30">{children}</View>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const context = usePopoverContext();
  const child = React.Children.only(children);

  return React.cloneElement(child, {
    onPress: (e: any) => {
      context.setOpen(!context.open);
      if (child.props.onPress) {
        child.props.onPress(e);
      }
    }
  } as any);
}

export function PopoverContent({
  children,
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  portalHost,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  align?: string;
  side?: string;
  sideOffset?: number;
  portalHost?: string;
}) {
  const context = usePopoverContext();

  if (!context.open) return null;

  return (
    <View 
      className={cn(
        "absolute top-[52px] left-0 right-0 z-50 bg-popover border border-border/40 rounded-2xl p-4 shadow-2xl",
        className
      )}
      style={{ elevation: 10 }}
      {...props}
    >
      <TextClassContext.Provider value="text-popover-foreground">
        <NativeOnlyAnimatedView entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          {children}
        </NativeOnlyAnimatedView>
      </TextClassContext.Provider>
    </View>
  );
}
