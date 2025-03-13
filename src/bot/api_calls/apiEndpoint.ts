// api/endpoints.ts
import { ISuccessResponseVerifyOtp, IVerifyData, type IErrorResponse,type ISuccessResponseSendOtp } from '../commands/types';

import { apiService, type IRequestOptions } from './centralizedApiCalls';


// API endpoint paths
export const API_PATHS = {
  auth: {
    sendOtp: '/api/auth/email-otp/request',
    verifyOtp: '/api/auth/email-otp/authenticate'
  }
};

// API services organized by domain
export const authApi = {
    sendOtp: async (email: string, options?: IRequestOptions): Promise<ISuccessResponseSendOtp | IErrorResponse> => {
        try {
          const response = await apiService.post<ISuccessResponseSendOtp>(API_PATHS.auth.sendOtp, { email }, options);
          return response.data as ISuccessResponseSendOtp;
        } catch (error) {
          return error as IErrorResponse; 
        }
      },
    verifyOtp: async(data:IVerifyData,  options?: IRequestOptions): Promise<ISuccessResponseVerifyOtp | IErrorResponse> =>{
        try {
          const response = await apiService.post<ISuccessResponseVerifyOtp>(API_PATHS.auth.verifyOtp, { ...data }, options);
          return response.data as ISuccessResponseVerifyOtp;
        } catch (error) {
          return error as IErrorResponse; 
        }
    }      
  
};


// Export all APIs as a single object for convenience
export const api = {
  auth: authApi,
};

// This ensures AuthService is used or explicitly exported
// If you're not using it, you can remove it entirely
export { authApi as AuthService };