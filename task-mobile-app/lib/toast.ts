export type ToastType = 'success' | 'info' | 'error' | 'warning';

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastListener = (toast: ToastMessage) => void;

let listener: ToastListener | null = null;

type ToastOptions = {
  description?: string;
};

export const toast = {
  success: (title: string, options?: ToastOptions | string) => {
    const desc = typeof options === 'string' ? options : options?.description;
    if (listener) listener({ id: Math.random().toString(), title, description: desc, type: 'success' });
  },
  error: (title: string, options?: ToastOptions | string) => {
    const desc = typeof options === 'string' ? options : options?.description;
    if (listener) listener({ id: Math.random().toString(), title, description: desc, type: 'error' });
  },
  info: (title: string, options?: ToastOptions | string) => {
    const desc = typeof options === 'string' ? options : options?.description;
    if (listener) listener({ id: Math.random().toString(), title, description: desc, type: 'info' });
  },
  warning: (title: string, options?: ToastOptions | string) => {
    const desc = typeof options === 'string' ? options : options?.description;
    if (listener) listener({ id: Math.random().toString(), title, description: desc, type: 'warning' });
  },
};

export const setListener = (newListener: ToastListener | null) => {
  listener = newListener;
};
