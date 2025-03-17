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
export interface ISuccessDetailskyc {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: IKycKybDetail[];
}

export interface IKycKybDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  type: string;
  country: string;
  providerCode: string;
  kycProviderCode: string;
  kycDetailId: string;
  kybDetailId: string;
  kycDetail: IKycDetail;
  kybDetail: IKybDetail;
  kycAdditionalDocuments: IKycAdditionalDocument[];
  statusUpdates: string;
}

export interface IKycDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kybDetailId: string;
  nationality: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  positionAtCompany: string;
  sourceOfFund: string;
  currentKycVerificationId: string;
  currentKycVerification: IKycVerification;
  kycDocuments: IKycDocument[];
  kycUrl: string;
  uboType: string;
  percentageOfShares: number;
  joiningDate: string;
}

export interface IKybDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  companyName: string;
  companyDescription: string;
  website: string;
  incorporationDate: string;
  incorporationCountry: string;
  incorporationNumber: string;
  companyType: string;
  companyTypeOther: string;
  natureOfBusiness: string;
  natureOfBusinessOther: string;
  sourceOfFund: string;
  sourceOfFundOther: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phoneNumber: string;
  currentKybVerificationId: string;
  currentKybVerification: IKybVerification;
  kybDocuments: IKybDocument[];
  kycDetails: IKycDetail[];
  sourceOfFundDescription: string;
  expectedMonthlyVolume: number;
  purposeOfFund: string;
  purposeOfFundOther: string;
  operatesInProhibitedCountries: boolean;
  taxIdentificationNumber: string;
  highRiskActivities: string[];
}

export interface IKycVerification {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kycDetailId: string;
  kycProviderCode: string;
  externalCustomerId: string;
  externalKycId: string;
  status: string;
  externalStatus: string;
  verifiedAt: string;
}

export interface IKybVerification {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kybDetailId: string;
  kybProviderCode: string;
  externalCustomerId: string;
  externalKybId: string;
  status: string;
  externalStatus: string;
  verifiedAt: string;
}

export interface IKycDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kycDetailId: string;
  documentType: string;
  status: string;
  frontFileName: string;
  backFileName: string;
}

export interface IKybDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kybDetailId: string;
  documentType: string;
  status: string;
  frontFileName: string;
  backFileName: string;
}

export interface IKycAdditionalDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  kycId: string;
  name: string;
  fileName: string;
}

export interface IWallet {
  id: string;
  createdAt: string;  // ISO timestamp format
  updatedAt: string;  // ISO timestamp format
  organizationId: string;
  walletType: string;
  network: string;
  walletAddress: string;
  isDefault: boolean;
}
export interface IBalance {
  decimals: number;
  balance: string;
  symbol: string;
  address: string;
}

export interface IWalletBalance {
  walletId: string;
  isDefault: boolean;
  network: string;
  balances: IBalance[];
}

export interface ICustomer {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  businessName: string;
  email: string;
  country: string;
}

export interface IDepositAccount {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  country: string;
  network: string;
  accountId: string;
  walletAddress: string;
  bankName: string;
  bankAddress: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankDepositMessage: string;
  wireMessage: string;
  payeeEmail: string;
  payeeOrganizationId: string;
  payeeId: string;
  payeeDisplayName: string;
}

export interface ITransaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  type: string;
  providerCode: string;
  kycId: string;
  transferId: string;
  status: string;
  externalStatus: string;
  fromAccountId: string;
  toAccountId: string;
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  totalFee: string;
  feeCurrency: string;
  transactionHash: string;
  depositAccount: IDepositAccount;
  externalTransactionId: string;
  externalCustomerId: string;
  depositUrl: string;
}

export interface ITransfer {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  customerId: string;
  customer: ICustomer;
  type: string;
  sourceCountry: string;
  destinationCountry: string;
  destinationCurrency: string;
  amount: string;
  currency: string;
  amountSubtotal: string;
  totalFee: string;
  feePercentage: string;
  feeCurrency: string;
  invoiceNumber: string;
  invoiceUrl: string;
  sourceOfFundsFile: string;
  note: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  sourceAccountId: string;
  destinationAccountId: string;
  paymentUrl: string;
  mode: string;
  isThirdPartyPayment: boolean;
  transactions: ITransaction[];
  destinationAccount: IDepositAccount;
  sourceAccount: IDepositAccount;
  senderDisplayName: string;
}

export interface ITransferResponse {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: ITransfer[];
}

export interface INotificationRequestData {
  socket_id: string;
  channel_name: string;
}

export interface INotificationSuccessResponse {
    auth: string;
}

export interface ITransferListing {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: ITransfer[];
}

export interface ICustomer {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  businessName: string;
  email: string;
  country: string;
}

export interface ITransaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  type: string;
  providerCode: string;
  kycId: string;
  transferId: string;
  status: string;
  externalStatus: string;
  fromAccountId: string;
  toAccountId: string;
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  totalFee: string;
  feeCurrency: string;
  transactionHash: string;
  depositAccount: IAccount;
  externalTransactionId: string;
  externalCustomerId: string;
  depositUrl: string;
}

export interface IAccount {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  country: string;
  network: string;
  accountId: string;
  walletAddress: string;
  bankName: string;
  bankAddress: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
  bankDepositMessage: string;
  wireMessage: string;
  payeeEmail: string;
  payeeOrganizationId: string;
  payeeId: string;
  payeeDisplayName: string;
}

export interface ITransferInputPayment{
  walletAddress: string,
  email: string,
  payeeId: string,
  amount: string,
  purposeCode: string,
  currency: string
}

export interface ITransferSendResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  customerId: string;
  customer: ICustomer;
  type: string;
  sourceCountry: string;
  destinationCountry: string;
  destinationCurrency: string;
  amount: string;
  currency: string;
  amountSubtotal: string;
  totalFee: string;
  feePercentage: string;
  feeCurrency: string;
  invoiceNumber: string;
  invoiceUrl: string;
  sourceOfFundsFile: string;
  note: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  sourceAccountId: string;
  destinationAccountId: string;
  paymentUrl: string;
  mode: string;
  isThirdPartyPayment: boolean;
  destinationAccount: IAccount;
  sourceAccount: IAccount;
  senderDisplayName: string;
}

export interface IWalletTransfer{
    walletAddress: string,
    amount: string,
    purposeCode: string,
    currency: string
}

export interface ICustomerData {
  name: string;
  businessName: string;
  email: string;
  country: string;
}

export interface IInvoiceDetails {
  invoiceNumber: string;
  invoiceUrl: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  quotePayload: string;
  quoteSignature: string;
  preferredWalletId: string;
  customerData: ICustomerData;
  sourceOfFundsFile: string;
  note: string;
}

export interface IRequestDetails {
  walletAddress: string;
  email: string;
  payeeId: string;
  amount: string;
  purposeCode: string;
  currency: string;
}

export interface IRequestItem {
  requestId: string;
  request: IRequestDetails;
}

export interface IRequestList {
  requests: IRequestItem[];
}

export interface IResponseDetails {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  customerId: string;
  customer: ICustomer;
  type: string;
  sourceCountry: string;
  destinationCountry: string;
  destinationCurrency: string;
  amount: string;
  currency: string;
  amountSubtotal: string;
  totalFee: string;
  feePercentage: string;
  feeCurrency: string;
  invoiceNumber: string;
  invoiceUrl: string;
  sourceOfFundsFile: string;
  note: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  sourceAccountId: string;
  destinationAccountId: string;
  paymentUrl: string;
  mode: string;
  isThirdPartyPayment: boolean;
}

export interface IErrorDetails {
  message: Record<string, unknown>; // Assuming it's a generic object
  statusCode: number;
  error: string;
}

export interface IResponseItem {
  requestId: string;
  request: IRequestDetails;
  response: IResponseDetails;
  error: IErrorDetails;
}

export interface IResponseList {
  responses: IResponseItem[];
}
