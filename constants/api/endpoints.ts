/**
 * Centralized API endpoints for the application.
 */
export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
  },
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    DETAIL: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
  },
  DASHBOARD: {
    ANALYTICS: '/dashboard',
  },
};
export type EndpointsType = typeof ENDPOINTS;
