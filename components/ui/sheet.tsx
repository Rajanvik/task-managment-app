import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { cn } from '@/lib/utils';
import * as SheetPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Text, View, type ViewProps } from 'react-native';
import { FadeIn, FadeOut, SlideInDown, SlideOutDown, SlideInUp, SlideOutUp, SlideInLeft, SlideOutLeft, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;
const SheetClose = SheetPrimitive.Close;

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function SheetOverlay({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SheetPrimitive.Overlay>, 'asChild'> & {
  children?: React.ReactNode;
}) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        'absolute bottom-0 left-0 right-0 top-0 bg-black/50 p-2',
        Platform.select({
          web: 'animate-in fade-in-0 fixed cursor-default [&>*]:cursor-auto',
        }),
        className
      )}
      {...props}
      asChild={Platform.OS !== 'web'}>
      <NativeOnlyAnimatedView entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} className="flex-1">
        <>{children}</>
      </NativeOnlyAnimatedView>
    </SheetPrimitive.Overlay>
  );
}

const SIDE_ANIMATIONS = {
  top: { entering: SlideInUp, exiting: SlideOutUp },
  bottom: { entering: SlideInDown, exiting: SlideOutDown },
  left: { entering: SlideInLeft, exiting: SlideOutLeft },
  right: { entering: SlideInRight, exiting: SlideOutRight },
};

function SheetContent({
  className,
  portalHost,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  portalHost?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const { entering, exiting } = SIDE_ANIMATIONS[side];

  return (
    <SheetPortal hostName={portalHost}>
      <SheetOverlay>
        <SheetPrimitive.Content
          className={cn(
            'bg-background border-border z-50 flex flex-col gap-4 border p-6 shadow-lg shadow-black/5',
            side === 'bottom' && 'absolute bottom-0 left-0 right-0 rounded-t-[40px]',
            side === 'top' && 'absolute top-0 left-0 right-0 rounded-b-lg',
            side === 'left' && 'absolute left-0 top-0 bottom-0 w-3/4 rounded-r-lg',
            side === 'right' && 'absolute right-0 top-0 bottom-0 w-3/4 rounded-l-lg',
            Platform.select({
              web: 'animate-in fade-in-0 zoom-in-95 duration-200',
            }),
            className
          )}
          {...props}
          asChild={Platform.OS !== 'web'}>
          <NativeOnlyAnimatedView entering={entering} exiting={exiting} className="flex-1">
            <>{children}</>
            <SheetPrimitive.Close
              className={cn(
                'absolute right-4 top-4 rounded opacity-70 active:opacity-100',
                Platform.select({
                  web: 'ring-offset-background focus:ring-ring data-[state=open]:bg-accent transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2',
                })
              )}
              hitSlop={12}>
              <Icon
                as={X}
                className={cn('text-accent-foreground web:pointer-events-none size-4 shrink-0')}
              />
              <Text className="sr-only">Close</Text>
            </SheetPrimitive.Close>
          </NativeOnlyAnimatedView>
        </SheetPrimitive.Content>
      </SheetOverlay>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn('text-foreground text-lg font-semibold leading-none', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
