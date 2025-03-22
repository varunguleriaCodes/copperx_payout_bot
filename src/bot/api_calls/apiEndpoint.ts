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

import { apiService } from './centralizedApiCalls';


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
    sendOtp: async (email: string): Promise<ISuccessResponseSendOtp | IErrorResponse> => {
        try {
          const response = await apiService.post<ISuccessResponseSendOtp>(API_PATHS.auth.sendOtp, { email });
          return response.data as ISuccessResponseSendOtp;
        } catch (error) {
          return error as IErrorResponse; 
        }
      },
    verifyOtp: async(data:IVerifyData): Promise<ISuccessResponseVerifyOtp | IErrorResponse> =>{
        try {
          const response = await apiService.post<ISuccessResponseVerifyOtp>(API_PATHS.auth.verifyOtp, { ...data });
          return response.data as ISuccessResponseVerifyOtp;
        } catch (error) {
          return error as IErrorResponse; 
        }
    },      
    userDetails: async(): Promise<IUser | IErrorResponse> =>{
        try {       
          const response = await apiService.get<IUser>(API_PATHS.auth.userDetails);
          return response.data as IUser;
        } catch (error) {
          return error as IErrorResponse; 
        }
    }   
};

export const kycApi = {    
  userStatus: async(): Promise<ISuccessDetailskyc | IErrorResponse> =>{
      try {       
        const response = await apiService.get<ISuccessDetailskyc>(API_PATHS.kyc.userStatus);
        return response.data as ISuccessDetailskyc;
      } catch (error) {
        return error as IErrorResponse; 
      }
  }   
};

export const walletApi = {
  getWallets: async(): Promise<IWallet[] | IErrorResponse> =>{
    try {       
      const response = await apiService.get<IWallet[]>(API_PATHS.wallet.getWallets);
      return response.data as IWallet[];
    } catch (error) {
      return error as IErrorResponse; 
    }
  }, 

  getBalances: async(): Promise<IWalletBalance[] | IErrorResponse> =>{
    try {       
      const response = await apiService.get<IWalletBalance[]>(API_PATHS.wallet.getBalances);
      return response.data as IWalletBalance[];
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  setdefaultWallet: async (walletId: string): Promise<IWallet | IErrorResponse> => {
    try {
      const response = await apiService.post<IWallet>(API_PATHS.wallet.setdefaultWallet, { walletId });
      return response.data as IWallet;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  getDefaultWallet: async(): Promise<IWallet | IErrorResponse> =>{
    try {       
      const response = await apiService.get<IWallet>(API_PATHS.wallet.getDefaultWallet);
      return response.data as IWallet;
    } catch (error) {
      return error as IErrorResponse; 
    }
  }, 
}

export const notificationApi = {
  pusherAuth: async (data: INotificationRequestData): Promise<INotificationSuccessResponse | IErrorResponse> => {
      try {
        const response = await apiService.post<INotificationSuccessResponse>(API_PATHS.notification.pusherAuth, { ...data });
        return response.data as INotificationSuccessResponse;
      } catch (error) {
        return error as IErrorResponse; 
      }
    }  
};

export const transferApi = {
  transferListing: async(): Promise<ITransferListing | IErrorResponse> =>{
    try {       
      const response = await apiService.get<ITransferListing>(API_PATHS.transfer.transferListing);
      return response.data as ITransferListing;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  emailTransfer: async(data:ITransferInputPayment): Promise<ITransferSendResponse | IErrorResponse> =>{
    try {
      const response = await apiService.post<ITransferSendResponse>(API_PATHS.transfer.emailTransfer, { ...data });
      return response.data as ITransferSendResponse;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  walletTransfer: async(data:IWalletTransfer): Promise<ITransferSendResponse | IErrorResponse> =>{
    try {
      const response = await apiService.post<ITransferSendResponse>(API_PATHS.transfer.walletTransfer, { ...data });
      return response.data as ITransferSendResponse;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  bankWithdrawal: async(data:IInvoiceDetails): Promise<ITransferSendResponse | IErrorResponse> =>{
    try {
      const response = await apiService.post<ITransferSendResponse>(API_PATHS.transfer.bankWithdrawal, { ...data });
      return response.data as ITransferSendResponse;
    } catch (error) {
      return error as IErrorResponse; 
    }
  },
  bulkTransfers: async(data:IRequestList): Promise<IResponseList | IErrorResponse> =>{
    try {
      const response = await apiService.post<IResponseList>(API_PATHS.transfer.bulkTransfers, { ...data });
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
