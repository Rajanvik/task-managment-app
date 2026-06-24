import { UseQueryOptions, UseQueryResult, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

/**
 * 🎣 TQueryOptions:
 * Jab aap useQuery call karte waqt custom query parameters pass karna chahte ho 
 * (jaise enabled, gcTime, staleTime), toh iss type ka use options parameter ke liye hota hai.
 * Hum 'queryKey' aur 'queryFn' ko Omit kar dete hain kyunki hooks inhein khud handle karte hain.
 * 
 * 💡 Naya query hook banate waqt isse aise use karein:
 * options?: TQueryOptions<ApnaDataType>
 */
export type TQueryOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError, TData, any[]>,
  'queryKey' | 'queryFn'
>;

/**
 * 🎣 TQueryReturnType:
 * Yeh type query hook ke return type (data, isLoading, isError, error, refetch, etc.) 
 * ko return karne ke liye default mapping structure hai.
 * 
 * 💡 Naya query hook banate waqt return type me isse likhein:
 * => TQueryReturnType<ApnaDataType>
 */
export type TQueryReturnType<TData, TError = Error> = UseQueryResult<TData, TError>;

/**
 * 🎣 TMutationOptions:
 * Jab aap useMutation call karte waqt hooks configurations ya success/error callbacks 
 * (onSuccess, onError, onMutate) ko customize karna chahte ho, toh iss type ka use parameters ke liye hota hai.
 * 'mutationFn' isme se Omit kiya gaya hai kyunki service call hook ke andar automatic map hoti hai.
 * 
 * 💡 Naya mutation hook banate waqt isse options parameter ke liye use karein:
 * options?: TMutationOptions<ResponseDataType, Error, PayloadType>
 */
export type TMutationOptions<TData, TError = Error, TVariables = void, TContext = unknown> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationFn'
>;

/**
 * 🎣 TMutationReturnType:
 * Mutation hooks ka return type (mutate function, mutateAsync, isPending, etc.) configure karne ke liye helper type.
 * 
 * 💡 Naya mutation hook banate waqt iska usage:
 * => TMutationReturnType<ResponseDataType, PayloadType>
 */
export type TMutationReturnType<TData, TVariables, TError = Error, TContext = unknown> = UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
>;
