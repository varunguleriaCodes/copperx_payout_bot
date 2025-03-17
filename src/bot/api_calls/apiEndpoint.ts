// api/endpoints.ts
import { type ISuccessResponseVerifyOtp, 
         type IVerifyData, 
         type IErrorResponse,
         type ISuccessResponseSendOtp,
         type IUser,
         type ISuccessDetailskyc, 
         type IWallet, 
         type IWalletBalance, 
         type INotificationRequestData, 
         type INotificationSuccessResponse, 
         type ITransferListing,
         type ITransferInputPayment,
         type ITransferSendResponse,
         type IWalletTransfer,
         type IInvoiceDetails,
         type IResponseList,
         type IRequestList} from '../commands/types';

import { apiService, type IRequestOptions } from './centralizedApiCalls';


// API endpoint paths
export const API_PATHS = {
  auth: {
    sendOtp: '/api/auth/email-otp/request',
    verifyOtp: '/api/auth/email-otp/authenticate',
    userDetails:'/api/auth/me'
  },
  kyc:{
    userStatus: '/api/kycs'
  },
  wallet:{
    getWallets: '/api/wallets',
    getBalances: '/api/wallets/balances',
    setdefaultWallet: '/api/wallets/default',
    getDefaultWallet: '/api/wallets/default',
  },
  transfer:{
    emailTransfer: '/api/transfers/send',
    walletTransfer: '/api/transfers/wallet-withdraw',
    bankWithdrawal: '/api/transfers/offramp',
    bulkTransfers: '/api/transfers/send-batch',
    transferListing: '/api/transfers?page=1&limit=10'
  },
  notification:{
    pusherAuth: '/api/notifications/auth'
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
    },      
    userDetails: async( options?: IRequestOptions): Promise<IUser | IErrorResponse> =>{
        try {       
          const response = await apiService.get<IUser>(API_PATHS.auth.userDetails, options);
          return response.data as IUser;
        } catch (error) {
          return error as IErrorResponse; 
        }
    }   
};

export const kycApi = {    
  userStatus: async( options?: IRequestOptions): Promise<ISuccessDetailskyc | IErrorResponse> =>{
      try {       
        const response = await apiService.get<ISuccessDetailskyc>(API_PATHS.kyc.userStatus, options);
        return response.data as ISuccessDetailskyc;
      } catch (error) {
        return error as IErrorResponse; 
      }
  }   
};

export const walletApi = {
  getWallets: async( options?: IRequestOptions): Promise<IWallet[] | IErrorResponse> =>{
    try {       
      const response = await apiService.get<IWallet[]>(API_PATHS.wallet.getWallets, options);
      return response.data as IWallet[];
    } catch (error) {
      return error as IErrorResponse; 
    }
  }, 

  getBalances: async( options?: IRequestOptions): Promise<IWalletBalance[] | IErrorResponse> =>{
    try {       
      const response = await apiService.get<IWalletBalance[]>(API_PATHS.wallet.getBalances, options);
      return response.data as IWalletBalance[];
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  setdefaultWallet: async (walletId: string, options?: IRequestOptions): Promise<IWallet | IErrorResponse> => {
    try {
      const response = await apiService.post<IWallet>(API_PATHS.wallet.setdefaultWallet, { walletId }, options);
      return response.data as IWallet;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  getDefaultWallet: async( options?: IRequestOptions): Promise<IWallet | IErrorResponse> =>{
    try {       
      const response = await apiService.get<IWallet>(API_PATHS.wallet.getDefaultWallet, options);
      return response.data as IWallet;
    } catch (error) {
      return error as IErrorResponse; 
    }
  }, 
}

export const notificationApi = {
  pusherAuth: async (data: INotificationRequestData, options?: IRequestOptions): Promise<INotificationSuccessResponse | IErrorResponse> => {
      try {
        const response = await apiService.post<INotificationSuccessResponse>(API_PATHS.notification.pusherAuth, { ...data }, options);
        return response.data as INotificationSuccessResponse;
      } catch (error) {
        return error as IErrorResponse; 
      }
    }  
};

export const transferApi = {
  transferListing: async( options?: IRequestOptions): Promise<ITransferListing | IErrorResponse> =>{
    try {       
      const response = await apiService.get<ITransferListing>(API_PATHS.transfer.transferListing, options);
      return response.data as ITransferListing;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  emailTransfer: async(data:ITransferInputPayment,  options?: IRequestOptions): Promise<ITransferSendResponse | IErrorResponse> =>{
    try {
      const response = await apiService.post<ITransferSendResponse>(API_PATHS.transfer.emailTransfer, { ...data }, options);
      return response.data as ITransferSendResponse;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  walletTransfer: async(data:IWalletTransfer,  options?: IRequestOptions): Promise<ITransferSendResponse | IErrorResponse> =>{
    try {
      const response = await apiService.post<ITransferSendResponse>(API_PATHS.transfer.walletTransfer, { ...data }, options);
      return response.data as ITransferSendResponse;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  bankWithdrawal: async(data:IInvoiceDetails,  options?: IRequestOptions): Promise<ITransferSendResponse | IErrorResponse> =>{
    try {
      const response = await apiService.post<ITransferSendResponse>(API_PATHS.transfer.bankWithdrawal, { ...data }, options);
      return response.data as ITransferSendResponse;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  bulkTransfers: async(data:IRequestList,  options?: IRequestOptions): Promise<IResponseList | IErrorResponse> =>{
    try {
      const response = await apiService.post<IResponseList>(API_PATHS.transfer.bulkTransfers, { ...data }, options);
      return response.data as IResponseList;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
}
// Export all APIs as a single object for convenience
export const api = {
  auth: authApi,
  kyc: kycApi,
  wallet: walletApi,
  notification:notificationApi,
  transfer:transferApi
};
