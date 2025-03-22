<h1>Telegram Bot</h1>

<p><b>This bot enables users to deposit, withdraw, and transfer USDC directly through Telegram without visiting web app</b></p>

## Deployment
Step 1- Install Yarn, Visit <a href="https://classic.yarnpkg.com/en/docs">Yarn</a> Website for details, Yarn version 1.22.22 is used for development.

Step 2 - Git Pull
```
git clone https://github.com/username/copperx_payout_bot.git
cd copperx_payout_bot
```
Step 3 - Create a .env file firstly, some variables are already initialized with default values
```
cp .env.example .env
```
Step 4 - To install dependencies run yarn
```
yarn
```
Step 5 - Build the bot with following command
```
yarn build
```
Step 6 - To start the bot run yarn start, bot will start on port 3000
```
yarn start
```

# API Calls Documentation

## Overview

This project organizes API calls into a structured format, ensuring maintainability and ease of use. All API calls are defined in the `src/bot/api_calls` folder, and they are categorized based on their functionality.

## File Structure

### 1. `centralized_api_calls.ts`

This file serves as the core service for making API requests. It includes additional functionalities such as:

- Setting the access token for authentication.
- Managing request options.
- Handling API responses efficiently.

### 2. `apiEndpoints.ts`

This file contains all the API endpoints grouped by their respective functionalities. The APIs are categorized into different sections for clarity.

## API Categories

### **Auth API**

Handles authentication-related requests, such as:

```typescript
await api.auth.sendOtp(email);
await api.auth.verifyOtp(data);
await api.auth.userDetails();
```

### **KYC API**

Manages KYC verification status.

```typescript
await api.kyc.userStatus();
```

### **Wallet API**

Handles wallet-related functionalities, including:

```typescript
await api.wallet.getWallets();
await api.wallet.getBalances();
await api.wallet.setDefaultWallet(walletId);
await api.wallet.getDefaultWallet();
```

### **Notification API**

Manages notification-related requests.

```typescript
await api.notification.pusherAuth(data);
```

### **Transfer API**

Handles money transfers and transactions, including:

```typescript
await api.transfer.transferListing();
await api.transfer.emailTransfer(data);
await api.transfer.walletTransfer(data);
await api.transfer.bankWithdrawal(data);
await api.transfer.bulkTransfers(data);
```

## Command Reference

The Telegram bot uses the `Telegraf` library to handle commands. Each command corresponds to a specific functionality and is defined in the `src/bot/commands` folder. These commands interact with APIs to fetch data, perform transactions, and manage user authentication.

### **Available Commands**

#### **1. `/start` - Start the Bot**

- Initializes the bot and provides a welcome message.
- Defined in `StartCommand`.

#### **2. `/login` - User Authentication**

- Authenticates the user and retrieves access tokens.
- Defined in `LoginCommand`.

#### **3. `/userdetails` - Fetch User Details**

- Retrieves and displays user information.
- Defined in `UserDetailsCommand`.

#### **4. `/kyc` - Check KYC Status**

- Fetches the user’s KYC verification status.
- Defined in `UserKycCommand`.

#### **5. `/setdefaultwallet` - Set Default Wallet**

- Allows users to set a preferred wallet for transactions.
- Defined in `SetDefaultWalletCommand`.

#### **6. `/getbalances` - Get Wallet Balance**

- Displays the balance of the user's wallets.
- Defined in `GetBalancesCommand`.

#### **7. `/getdefaultwallet` - Get Default Wallet**

- Fetches and displays the user’s default wallet.
- Defined in `GetDefaultWalletCommand`.

#### **8. `/getwallets` - List Wallets**

- Retrieves and displays all available wallets.
- Defined in `GetWalletCommand`.

#### **9. `/transferlist` - List Transfers**

- Displays the history of money transfers.
- Defined in `TransferListCommand`.

#### **10. `/emailtransfer` - Send Money via Email**

- Sends money to a recipient using an email transfer.
- Defined in `EmailTransferCommand`.

#### **11. `/wallettransfer` - Transfer Between Wallets**

- Transfers funds between the user’s wallets.
- Defined in `WalletTransferCommand`.

#### **12. `/bulktransfer` - Execute Bulk Transfers**

- Processes multiple transfers in one command.
- Defined in `BulkTransfersCommand`.

#### **13. `/bankwithdrawal` - Withdraw Funds to Bank**

- Initiates a bank withdrawal.
- Defined in `BankWithdrawalCommand`.

#### **14. `/help` - Get Help Information**

- Provides an overview of available commands and their usage.
- Defined in `HelpCommand`.

### **Middleware Usage**

The bot uses middleware for logging and authentication:

- `LoggerMiddleware`: Logs incoming requests and responses.
- `AuthMiddleware`: Ensures users are authenticated before executing commands.

### **Pusher Integration**

The bot uses Pusher to listen for real-time events, and the Pusher client is initialized within the bot.

## Debugging and Logging

For debugging purposes, the project uses the `winston` logging library. Logs are recorded both in the console and in a file specified in the configuration.

### **Logger Implementation**

The logger is defined in `src/lib/logger.ts`:

```typescript
import winston from 'winston';
import { CONFIG } from '../../config';

function createLogger(logFileName: string): winston.Logger {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      }),
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: logFileName }),
    ],
  });
}

export const logger = createLogger(CONFIG.log.output);
```

### **Log Structure**

Logs follow the structure:

```
[timestamp] level: message
```

Example log entries:

```
[2025-03-21 18:42:26] info: User [@telegram_username] (telegram_user_id): Command received: /start
[2025-03-21 18:42:27] info: User [@telegram_username] (telegram_user_id): Command received: /kyc
```

