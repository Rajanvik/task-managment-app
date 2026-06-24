import React from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Trash2 } from 'lucide-react-native';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogMedia
} from '@/components/ui/alert-dialog';

interface DeleteTaskAlertProps {
  visible: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteTaskAlert: React.FC<DeleteTaskAlertProps> = ({ visible, isDeleting, onCancel, onConfirm }) => {
  return (
    // onOpenChange me isDeleting guard: deletion chal rahi ho tab dialog band nahi hoga
    <AlertDialog open={visible} onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2 size={20} color="#ef4444" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action cannot be undone. This will permanently delete this task and remove it from your local storage.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 w-full">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            disabled={isDeleting}
            onPress={onCancel}
          >
            <Text>Cancel</Text>
          </Button>

          <Button
            variant="destructive"
            className="flex-1 rounded-xl flex-row items-center justify-center gap-2"
            disabled={isDeleting}
            onPress={onConfirm}
          >
            {isDeleting && <Spinner size={16} color="white" />}
            <Text>{isDeleting ? 'Deleting...' : 'Continue'}</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
