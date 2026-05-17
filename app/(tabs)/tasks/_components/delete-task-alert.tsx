import React from 'react';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface DeleteTaskAlertProps {
  visible: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteTaskAlert({ visible, isDeleting, onCancel, onConfirm }: DeleteTaskAlertProps) {
  return (
    <AlertDialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this task and remove it from your local storage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 w-full">
          <AlertDialogCancel variant="outline" className="flex-1 rounded-xl" disabled={isDeleting} onPress={onCancel}>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction 
            variant="destructive"
            className="flex-1 rounded-xl"
            disabled={isDeleting}
            onPress={onConfirm} 
          >
            {isDeleting && <Spinner size={16} color="white" />}
            <Text>Continue</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
