import { type Context } from 'telegraf';

export interface ICommand {
  execute(ctx: Context): Promise<void>;
}

export interface ISuccessResponseSendOtp {
  email: string;
  sid: string;
}

export interface IErrorResponse{
  message: Record<string, never>;
  statusCode: number;
  error: string;
}

export interface IVerifyData{
  email:string,
  sid:string,
  otp:string
}

export interface ISuccessResponseVerifyOtp{
scheme: string;
accessToken: string;
accessTokenId: string;
expireAt: string;
user: IUser;
}
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  organizationId: string;
  role: string;
  status: string;
  type: string;
  relayerAddress: string;
  flags: string[];
  walletAddress: string;
  walletId: string;
  walletAccountType: string;
}