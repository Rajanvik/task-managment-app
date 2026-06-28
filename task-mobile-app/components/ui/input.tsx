import { cn } from '@/lib/utils';
import { View, TextInput } from 'react-native';
import { Icon } from '@/components/ui/icon';
import type { LucideIcon } from 'lucide-react-native';

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  icon?: LucideIcon;
  iconSize?: number;
  variant?: 'default' | 'soft';
}

function Input({
  className,
  variant = 'default',
  icon: IconComponent,
  iconSize = 18,
  multiline,
  ...props
}: InputProps & React.RefAttributes<TextInput>) {
  const isInvalid = (props as any)['aria-invalid'];

  return (
    <View
      className={cn(
        // Base layout
        "relative flex-row w-full items-center rounded-xl px-4",
        // Variant styles
        variant === 'default' && "bg-card border border-border h-12",
        variant === 'soft'   && "bg-secondary/20 border-none",
        // Multiline height
        multiline ? "min-h-[60px] items-start py-3" : "h-11",
        // States
        isInvalid && "border-destructive bg-destructive/5",
        props.editable === false && "opacity-50",
      )}
    >
      {IconComponent && (
        <Icon
          as={IconComponent}
          size={iconSize}
          className="text-muted-foreground mr-3"
        />
      )}
      <TextInput
        multiline={multiline}
        className={cn(
          "flex-1 text-foreground text-sm border-0 h-full shadow-none bg-transparent",
          className
        )}
        placeholderTextColor="#a1a1aa"
        textAlignVertical={multiline ? 'top' : 'auto'}
        {...props}
      />
    </View>
  );
}

export { Input };

