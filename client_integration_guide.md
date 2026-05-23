# Client Integration & New API (AddressBook) Development Guide

Yeh guide client-side implementation ko detail me explain karti hai:
1. **Naye project me kaun-kaun si files copy-paste karni hain** auth/onboarding setup active karne ke liye.
2. **AddressBook CRUD API** ko dynamic React Native views me divide karne ka folder layout structure (List, Add, Edit, aur Single Detail screens).

---

## 📂 Part 1: Client Files to Copy (For Onboarding & Security Setup)

Naye app setup me security routes aur auto-token handling ke liye is current repo se core files copy-paste karein:

1. **`lib/axios-instance.ts` (API Fetcher Instance):** Header injection and silent background token rotation.
2. **`hooks/use-route-guard.ts` (Route Security Guard):** Screens routing redirect controls.
3. **`services/auth.ts` (Authentication Service API):** Register, login, logout backend calls.
4. **`hooks/data-hooks/use-auth.ts` (Auth State Mutations):** Query mutations and state storage keys.

---

## 🔄 Part 2: Step-by-Step Flow to Connect AddressBook API

```
[api/endpoints.ts] ──> [lib/zod/addresses] ──> [services/address.ts] ──> [hooks/data-hooks/use-address.ts] ──> [UI Folder Structure]
```

### 📍 Step 1: Endpoint configure karein (`api/endpoints.ts`)
```typescript
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
  },
  // [EDIT: Naye routes config update karein]
  ADDRESSES: {
    LIST: '/addresses',
    CREATE: '/addresses',
    DETAIL: (id: string) => `/addresses/${id}`,
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
  },
};
export type EndpointsType = typeof ENDPOINTS;
```

---

### 📝 Step 2: Zod Validation Schemas Create karein (`lib/zod/addresses`)

#### A. Create Form Schema (`lib/zod/addresses/create.ts`):
```typescript
import { z } from "zod";

// [EDIT: Form inputs validation criteria]
export const createAddressSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name is too long." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }).max(200, { message: "Address is too long." }),
});

export type CreateAddressFormValues = z.infer<typeof createAddressSchema>;
```

#### B. Edit Form Schema (`lib/zod/addresses/edit.ts`):
```typescript
import { z } from "zod";

// [EDIT: Form inputs validation criteria]
export const editAddressSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).max(50, { message: "Name is too long." }).optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }).max(200, { message: "Address is too long." }).optional(),
});

export type EditAddressFormValues = z.infer<typeof editAddressSchema>;
```

---

### 📡 Step 3: Service Layer write karein (`services/address.ts`)
```typescript
import { axiosInstance } from '@/lib/axios-instance';
import { ENDPOINTS } from '@/api/endpoints';

export interface AddressItem {
  id: string;
  name: string;
  address: string;
  userId: string;
}

export interface AddressService {
  getAddresses(): Promise<AddressItem[]>;
  getAddressDetail(id: string): Promise<AddressItem>;
  createAddress(name: string, address: string): Promise<AddressItem>;
  updateAddress(id: string, data: { name?: string; address?: string }): Promise<AddressItem>;
  deleteAddress(id: string): Promise<{ message: string }>;
}

export const addressService: AddressService = {
  getAddresses: () => 
    axiosInstance.get<AddressItem[]>(ENDPOINTS.ADDRESSES.LIST).then((res) => res.data),

  getAddressDetail: (id) => 
    axiosInstance.get<AddressItem>(ENDPOINTS.ADDRESSES.DETAIL(id)).then((res) => res.data),

  createAddress: (name, address) => 
    axiosInstance.post<AddressItem>(ENDPOINTS.ADDRESSES.CREATE, { name, address }).then((res) => res.data),

  updateAddress: (id, data) => 
    axiosInstance.put<AddressItem>(ENDPOINTS.ADDRESSES.UPDATE(id), data).then((res) => res.data),

  deleteAddress: (id) => 
    axiosInstance.delete<{ message: string }>(ENDPOINTS.ADDRESSES.DELETE(id)).then((res) => res.data),
};
```

---

### 🎣 Step 4: React Query Hooks setup karein (`hooks/data-hooks/use-address.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService, AddressItem } from '@/services/address';
import { toast } from '@/lib/toast';
import { TQueryOptions, TQueryReturnType, TMutationOptions, TMutationReturnType } from './types';

export interface IAddressDataHook {
  useAddresses: (
    options?: TQueryOptions<AddressItem[]>
  ) => TQueryReturnType<AddressItem[]>;

  useAddressDetail: (
    id: string,
    options?: TQueryOptions<AddressItem>
  ) => TQueryReturnType<AddressItem>;

  useCreateAddress: (
    options?: TMutationOptions<AddressItem, Error, { name: string; address: string }>
  ) => TMutationReturnType<AddressItem, { name: string; address: string }>;

  useUpdateAddress: (
    options?: TMutationOptions<AddressItem, Error, { id: string; data: { name?: string; address?: string } }>
  ) => TMutationReturnType<AddressItem, { id: string; data: { name?: string; address?: string } }>;

  useDeleteAddress: (
    options?: TMutationOptions<{ message: string }, Error, string>
  ) => TMutationReturnType<{ message: string }, string>;
}

export const AddressDataHook: IAddressDataHook = {
  useAddresses(options) {
    return useQuery({
      queryKey: ['addresses'],
      queryFn: addressService.getAddresses,
      ...options,
    });
  },

  useAddressDetail(id, options) {
    return useQuery({
      queryKey: ['address', id],
      queryFn: () => addressService.getAddressDetail(id),
      enabled: !!id,
      ...options,
    });
  },

  useCreateAddress(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ name, address }) => addressService.createAddress(name, address),
      onSuccess: (data, variables, context) => {
        toast.success("Address added successfully!");
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        toast.error(error?.response?.data?.message || error?.message || "Failed to add address.");
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },

  useUpdateAddress(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }) => addressService.updateAddress(id, data),
      onSuccess: (data, variables, context) => {
        toast.success("Address updated successfully!");
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        queryClient.invalidateQueries({ queryKey: ['address', variables.id] });
        (options?.onSuccess as any)?.(data, variables, context);
      },
      onError: (error: any, variables, context) => {
        toast.error(error?.response?.data?.message || error?.message || "Failed to update address.");
        (options?.onError as any)?.(error, variables, context);
      },
    });
  },

  useDeleteAddress(options) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addressService.deleteAddress,
      onSuccess: (data, id, context) => {
        toast.success("Address deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        queryClient.invalidateQueries({ queryKey: ['address', id] });
        (options?.onSuccess as any)?.(data, id, context);
      },
      onError: (error: any, id, context) => {
        toast.error(error?.response?.data?.message || error?.message || "Failed to delete address.");
        (options?.onError as any)?.(error, id, context);
      },
    });
  },
};
```

---

## 📱 Part 3: Client UI Screen Folder Structure (Expo Router)

Dynamic folder structure mapping inside `app/(tabs)/addresses/` to organize separate screen view controllers:

```
app/
 └── (tabs)/
      └── addresses/
           ├── _components/       <-- [Address List Sub-components]
           │    └── address-card.tsx
           ├── _layout.tsx        <-- [Navigation Stack with Modal settings]
           ├── index.tsx          <-- [GET ALL List & DELETE Action]
           ├── [id]/
           │    └── index.tsx     <-- [GET SINGLE Detail Screen]
           ├── add/
           │    └── index.tsx     <-- [ADD Form Screen]
           └── edit/
                └── [id]/
                     └── index.tsx <-- [EDIT Form Screen]
```

### 0. `app/(tabs)/addresses/_layout.tsx` (Navigation Stack & Modal Settings)
Configure the React Navigation screen options to support transparent background bottom sheet modals:

```tsx
import { Stack } from 'expo-router';

export default function AddressesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="add/index" options={{ presentation: 'transparentModal', animation: 'none' }} />
      <Stack.Screen name="edit/[id]/index" options={{ presentation: 'transparentModal', animation: 'none' }} />
    </Stack>
  );
}
```

---

### 0.4. `app/(tabs)/addresses/_components/address-card.tsx` (Reusable Card Component)
Premium card component for displaying address details with an options trigger button:

```tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { MoreVertical, MapPin } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AddressCardProps {
  item: { id: string; name: string; address: string };
  onPress: () => void;
  onOptionsPress: () => void;
}

export function AddressCard({ 
  item, 
  onPress, 
  onOptionsPress 
}: AddressCardProps) {
  return (
    <View className="mb-3">
      <Card
        className="bg-card border border-border/40 rounded-3xl px-3.5 pt-3.5 pb-2.5 shadow-sm shadow-black/5"
      >
        <View className="flex-row items-center justify-between">
          <Pressable onPress={onPress} className="flex-row items-center flex-1 gap-2.5 mr-2">
            <View className="h-10 w-10 bg-primary/10 rounded-2xl items-center justify-center mr-1">
              <MapPin size={20} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-extrabold text-foreground leading-tight">
                {item.name}
              </Text>
              <Text numberOfLines={1} className="text-xs text-muted-foreground mt-0.5">
                {item.address}
              </Text>
            </View>
          </Pressable>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full -mr-1.5 active:bg-secondary/30"
            onPress={onOptionsPress}
          >
            <MoreVertical size={18} color="gray" />
          </Button>
        </View>
      </Card>
    </View>
  );
}
```

---

### 0.5. `app/(tabs)/addresses/_components/address-options-sheet.tsx` (Options Bottom Sheet)
Allows the user to trigger View details, Edit, or Delete actions for a specific address.

```tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { Eye, Pencil, Trash2 } from 'lucide-react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

interface AddressOptionsSheetProps {
  item: { id: string; name: string; address: string } | null;
  visible: boolean;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AddressOptionsSheet({
  item,
  visible,
  onClose,
  onView,
  onEdit,
  onDelete,
}: AddressOptionsSheetProps) {
  const { theme } = useTheme();

  if (!item) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Options"
      description={`Manage address: ${item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name}`}
    >
      <View className="flex-row w-full gap-2.5 pb-2 pt-1">
        {/* VIEW */}
        <Pressable
          onPress={onView}
          className="flex-1 items-center justify-center py-4 bg-secondary/10 active:bg-secondary/25 rounded-2xl border border-border/40"
        >
          <View className="w-9 h-9 rounded-xl bg-secondary/30 border border-border/40 items-center justify-center mb-1.5">
            <Eye size={16} color={theme.foreground} />
          </View>
          <Text className="text-xs font-bold text-foreground">View</Text>
        </Pressable>

        {/* EDIT */}
        <Pressable
          onPress={onEdit}
          className="flex-1 items-center justify-center py-4 bg-secondary/10 active:bg-secondary/25 rounded-2xl border border-border/40"
        >
          <View className="w-9 h-9 rounded-xl bg-secondary/30 border border-border/40 items-center justify-center mb-1.5">
            <Pencil size={15} color={theme.foreground} />
          </View>
          <Text className="text-xs font-bold text-foreground">Edit</Text>
        </Pressable>

        {/* DELETE (Destructive) */}
        <Pressable
          onPress={onDelete}
          className="flex-1 items-center justify-center py-4 bg-destructive/[0.03] active:bg-destructive/15 rounded-2xl border border-destructive/15"
        >
          <View className="w-9 h-9 rounded-xl bg-destructive/10 border border-destructive/20 items-center justify-center mb-1.5">
            <Trash2 size={16} color="#ef4444" />
          </View>
          <Text className="text-xs font-bold text-destructive">Delete</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
```

---

### 0.6. `app/(tabs)/addresses/_components/delete-address-alert.tsx` (Delete Confirmation Alert)
Standardized alert popup for client deletion processing with active loading state support.

```tsx
import React from 'react';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Trash2 } from 'lucide-react-native';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogMedia
} from '@/components/ui/alert-dialog';

interface DeleteAddressAlertProps {
  visible: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAddressAlert({ visible, isDeleting, onCancel, onConfirm }: DeleteAddressAlertProps) {
  return (
    <AlertDialog open={visible} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2 size={20} color="#ef4444" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This action cannot be undone. This will permanently delete this address and remove it from your record.
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
```

---

### 1. `app/(tabs)/addresses/index.tsx` (GET ALL List & DELETE Action)
Lists all records for user, contains redirect link points to details/edit screens, and trigger delete confirmations.

```tsx
import React, { useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { AddressDataHook } from '@/hooks/data-hooks/use-address';
import { useTheme } from '@/hooks/use-theme';
import { toast } from '@/lib/toast';

import { AddressCard } from './_components/address-card';
import { AddressOptionsSheet } from './_components/address-options-sheet';
import { DeleteAddressAlert } from './_components/delete-address-alert';

export default function AddressListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const { data: list = [], isLoading } = AddressDataHook.useAddresses();
  const { mutate: deleteAddress } = AddressDataHook.useDeleteAddress();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedRecord = React.useMemo(() => {
    return list.find((item) => item.id === selectedId) || null;
  }, [list, selectedId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Soft background header decoration */}
      <View className="absolute top-0 left-0 right-0 h-[280px] bg-primary/5" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-14 pb-6 relative overflow-hidden">
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full" />
          <View className="flex-row justify-between items-start z-10">
            <View className="flex-1 mr-4">
              <Text className="text-[34px] font-extrabold tracking-tight text-foreground">
                Addresses
              </Text>
              <Text className="text-muted-foreground text-sm font-medium mt-1 leading-5">
                Manage, organize, and view your saved client addresses.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/addresses/add')}
              className="h-11 w-11 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/30 active:scale-[0.96] mt-1"
            >
              <Plus color={theme.primaryForeground} size={22} />
            </Pressable>
          </View>
        </View>

        {/* Workspace Card Body Container */}
        <View className="px-5 py-7 rounded-t-[42px] bg-background -mt-2 flex-1 min-h-[600px] border-t border-border/10">
          {list.length === 0 ? (
            <View className="items-center justify-center py-20 px-4">
              <Text className="text-lg font-extrabold text-foreground text-center">No addresses found</Text>
              <Text className="text-muted-foreground text-sm text-center mt-2 max-w-[280px]">
                Your address book is currently empty. Tap the "+" button above to add your first address.
              </Text>
            </View>
          ) : (
            list.map((item) => (
              <AddressCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/addresses/${item.id}`)}
                onOptionsPress={() => setSelectedId(item.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Options sheet */}
      <AddressOptionsSheet
        item={selectedRecord}
        visible={!!selectedId}
        onClose={() => setSelectedId(null)}
        onView={() => {
          const item = selectedRecord;
          setSelectedId(null);
          if (item) router.push(`/addresses/${item.id}`);
        }}
        onEdit={() => {
          const item = selectedRecord;
          setSelectedId(null);
          if (item) router.push(`/addresses/edit/${item.id}`);
        }}
        onDelete={() => {
          const id = selectedId;
          setSelectedId(null);
          setTimeout(() => setDeleteId(id), 300);
        }}
      />

      {/* Delete Confirmation Alert */}
      <DeleteAddressAlert
        visible={!!deleteId}
        isDeleting={isDeleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setIsDeleting(true);
          await new Promise((r) => setTimeout(r, 400));
          deleteAddress(deleteId, {
            onSuccess: () => {
              setIsDeleting(false);
              setDeleteId(null);
            },
            onError: () => {
              setIsDeleting(false);
              setDeleteId(null);
            }
          });
        }}
      />
    </View>
  );
}
```

---

### 2. `app/(tabs)/addresses/add/index.tsx` (ADD Form Screen)
Input creation screen wrapper mapping react-hook-form bindings to create entries in db.

```tsx
import React from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { AddressDataHook } from '@/hooks/data-hooks/use-address';
import { createAddressSchema, CreateAddressFormValues } from '@/lib/zod/addresses/create'; // [EDIT: Import schema]

export default function AddAddressScreen() {
  const router = useRouter();

  const form = useForm<CreateAddressFormValues>({
    resolver: zodResolver(createAddressSchema),
  });

  const { mutate, isPending } = AddressDataHook.useCreateAddress({
    onSuccess: () => {
      router.back();
      form.reset();
    },
  });

  const onSubmit = (values: CreateAddressFormValues) => {
    mutate(values);
  };

  return (
    <BottomSheet
      visible
      onClose={() => router.back()}
      title="New Address"
      description="Please fill out the details below."
    >
      <Form {...form}>
        <View className="gap-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name" // [EDIT: Form schema model key]
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Rajan Kumar"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    className="h-11 border-none bg-secondary/15 rounded-xl px-4 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Field */}
          <FormField
            control={form.control}
            name="address" // [EDIT: Form schema model key]
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Flat 104, Green Apartment, Delhi"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    className="h-11 border-none bg-secondary/15 rounded-xl px-4 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <View className="flex-row gap-3 mt-2">
            <Button variant="outline" className="flex-1" onPress={() => router.back()}>
              <Text>Cancel</Text>
            </Button>
            <Button 
              onPress={form.handleSubmit(onSubmit)} 
              disabled={isPending}
              className="flex-[2] bg-blue-600 rounded-xl"
            >
              <Text className="text-white font-semibold">
                {isPending ? 'Saving...' : 'Add Address'}
              </Text>
            </Button>
          </View>
        </View>
      </Form>
    </BottomSheet>
  );
}
```

---

### 3. `app/(tabs)/addresses/edit/[id]/index.tsx` (EDIT Form Screen)
Fetches dynamic route ID, displays loading indicator state, and triggers updates via inner form controller.

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { AddressDataHook } from '@/hooks/data-hooks/use-address';
import { editAddressSchema, EditAddressFormValues } from '@/lib/zod/addresses/edit';

interface EditAddressFormInnerProps {
  record: any;
}

function EditAddressFormInner({ record }: EditAddressFormInnerProps) {
  const router = useRouter();

  const form = useForm<EditAddressFormValues>({
    resolver: zodResolver(editAddressSchema),
    defaultValues: {
      name: record?.name ?? '',
      address: record?.address ?? '',
    },
  });

  const { mutate, isPending } = AddressDataHook.useUpdateAddress({
    onSuccess: () => {
      router.back();
      form.reset();
    },
  });

  const onSubmit = (values: EditAddressFormValues) => {
    if (!record.id) return;
    mutate({
      id: record.id,
      data: {
        name: values.name,
        address: values.address,
      },
    });
  };

  return (
    <Form {...form}>
      <View className="gap-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  editable={!isPending}
                  className="h-11 border-none bg-secondary/15 rounded-xl px-4 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Input
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  editable={!isPending}
                  className="h-11 border-none bg-secondary/15 rounded-xl px-4 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <View className="flex-row gap-3 mt-2">
          <Button variant="outline" className="flex-1" onPress={() => router.back()} disabled={isPending}>
            <Text>Cancel</Text>
          </Button>
          <Button 
            onPress={form.handleSubmit(onSubmit)} 
            disabled={isPending}
            className="flex-[2] bg-blue-600 rounded-xl"
          >
            <Text className="text-white font-semibold">
              {isPending ? 'Updating...' : 'Update Address'}
            </Text>
          </Button>
        </View>
      </View>
    </Form>
  );
}

export default function EditAddressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: record, isLoading } = AddressDataHook.useAddressDetail(id);

  if (isLoading) {
    return (
      <BottomSheet
        visible
        onClose={() => router.back()}
        title="Edit Address"
        description="Loading address..."
      >
        <View className="py-10 items-center justify-center">
          <Spinner size={32} />
        </View>
      </BottomSheet>
    );
  }

  if (!record) {
    return (
      <BottomSheet
        visible
        onClose={() => router.back()}
        title="Edit Address"
        description="Error loading address"
      >
        <View className="py-10 items-center justify-center">
          <Text className="text-foreground">Address not found</Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible
      onClose={() => router.back()}
      title="Edit Address"
      description="Update your contact details below."
    >
      <EditAddressFormInner record={record} />
    </BottomSheet>
  );
}
```

---

### 4. `app/(tabs)/addresses/[id]/index.tsx` (GET SINGLE Detail Screen)
Fetches dynamic route ID and loads details of a single record for user view check with high-fidelity banner graphics.

```tsx
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, MapPin, Edit3 } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { AddressDataHook } from '@/hooks/data-hooks/use-address';
import { useTheme } from '@/hooks/use-theme';

export default function AddressDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>(); // Route ID read
  const { data: record, isLoading } = AddressDataHook.useAddressDetail(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!record) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-xl font-bold text-destructive">Record not found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text className="text-primary-foreground font-bold">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Floating Header Back Button */}
      <View className="absolute top-14 left-6 z-20 flex-row items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          onPress={() => router.back()} 
          className="bg-card border border-border rounded-full h-11 w-11 shadow-lg shadow-black/15 flex items-center justify-center"
        >
          <ChevronLeft color={theme.foreground} size={20} />
        </Button>
        <View className="bg-card px-4 py-2 rounded-full border border-border shadow-md">
          <Text className="text-sm font-bold text-foreground tracking-wide">Address Details</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* BANNER WITH ABSTRACT PATTERNS */}
        <View className="h-64 bg-secondary/40 relative overflow-hidden justify-end pb-8 px-6">
          <View className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <View className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background to-transparent" />
          
          <View className="gap-2.5">
            <View className="h-10 w-10 bg-primary/10 rounded-2xl items-center justify-center mb-1">
              <MapPin size={22} className="text-primary" />
            </View>
            <Text className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {record.name}
            </Text>
          </View>
        </View>

        {/* DETAILS CONTAINER */}
        <View className="px-6 py-6 rounded-t-[40px] bg-background -mt-6 flex-1 min-h-[600px]">
          {/* STATS MATRIX / INFO */}
          <View className="flex-row items-center gap-4 bg-secondary/30 border border-border/5 rounded-[28px] p-5 mb-6">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center">
                <MapPin size={18} color={theme.primary} />
              </View>
              <View>
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Category</Text>
                <Text className="text-foreground text-sm font-semibold mt-0.5">Contact Address</Text>
              </View>
            </View>
          </View>

          {/* ADDRESS BRIEF CARD */}
          <View className="mb-6 bg-card border border-border/40 rounded-[28px] p-5 shadow-sm shadow-black/5">
            <Text className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">
              Full Address Book Entry
            </Text>
            <Text className="text-foreground text-base leading-7 font-medium">
              {record.address}
            </Text>
          </View>

          {/* DYNAMIC ACTIONS */}
          <View className="pb-16 gap-4">
            <Button 
              onPress={() => router.push(`/addresses/edit/${record.id}`)}
              className="h-14 bg-primary rounded-2xl flex-row gap-2.5 shadow-xl shadow-primary/20"
            >
              <Edit3 size={20} color={theme.primaryForeground} />
              <Text className="font-bold text-base text-primary-foreground">
                Edit Contact Details
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
```
