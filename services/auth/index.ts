import { ENDPOINTS } from "@/constants/api/endpoints";
import { AUTH_KEYS, axiosInstance } from "@/lib/axios-instance";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { User, Login, Register, AuthResponse } from "@/lib/types/auth";

/**
 * 🛠️ AuthService Interface:
 * Jab aap new endpoints collections handle karne ke liye service interface banayein
 * (jaise ProductService, NotificationService), tab iss structure ko use karein.
 *
 * 💡 Naya service interface banate waqt niche likhi cheezein edit karni hain:
 * 1. Service name badlein (jaise `AuthService` -> `AddressService`).
 * 2. Methods ke naam aur signatures badlein (jaise `login` -> `createAddress`).
 * 3. Parameters payloads aur response types customize karein (`Promise<AuthResponse>` -> `Promise<Address>`).
 */
export interface IAuthService {
  // login method: data submit karke login details retrieve karega
  // 👉 Customization: payload aur return response type customize karein
  login: (data: Login) => Promise<AuthResponse>;

  // register method: new user register api calls handle karega
  register: (data: Register) => Promise<AuthResponse>;

  // logout method: session destroy operation perform karega
  logout: () => Promise<void>;
}

// 2. AuthService Object: Axios endpoints par requests bhejne ke liye (Clean & Optimal)
export const AuthService: IAuthService = {
  // Login action handler (Awaited async flow for sequential local storage updates)
  async login(data) {
    // Axios instance ka use karke login endpoint par POST request bhej rahe hain
    const response = await axiosInstance.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      data,
    );
    const resData = response.data; // API response se data nikal rahe hain

    // Agar response me login token mila hai
    if (resData.token) {
      // Access token ko AsyncStorage me local storage par save kar rahe hain
      await AsyncStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, resData.token);

      // Agar response me refresh token bhi hai, toh usey bhi save kar rahe hain
      if (resData.refreshToken) {
        await AsyncStorage.setItem(
          AUTH_KEYS.REFRESH_TOKEN,
          resData.refreshToken,
        );
      }

      // Agar user profile data hai, toh object ko JSON string me badal kar save kar rahe hain
      if (resData.user) {
        await AsyncStorage.setItem(
          AUTH_KEYS.USER_DATA,
          JSON.stringify(resData.user),
        );
      }
    }
    // Target component ko modified/returned response data bhej rahe hain
    return resData;
  },

  // Register action handler (Direct return response data promise)
  async register(data) {
    const response = await axiosInstance.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      data,
    );
    return response.data;
  },

  // Logout action handler (AsyncStorage se saari authentication details delete karne ke liye)
  async logout() {
    // AsyncStorage.multiRemove() ka use karke access token, refresh token aur user data ko ek sath delete/clear kar rahe hain
    await AsyncStorage.multiRemove([
      AUTH_KEYS.ACCESS_TOKEN,
      AUTH_KEYS.REFRESH_TOKEN,
      AUTH_KEYS.USER_DATA,
    ]);
  },
};
