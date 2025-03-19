<h1 align="center">Telegram Bot</h1>

<p align="center"><b>This bot enables users to deposit, withdraw, and transfer USDC directly through Telegram without visiting web app</b></p>

## Deployment
Step 1- Install Yarn, Visit <a href="https://yarnpkg.com/getting-started/install">Yarn</a> Website for details, Yarn version 4.6.0 is used for development.


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
<h4>Api integration</h4>
<p>All Api calls are defined in src/bot/api_calls folder</p>
<p>-centralized_api_calls.ts is the file where all the rest api calls are setup with additional functionalities as set access token </p>
<p>-apiEndpoints.ts is the file where all endpoints for different functionalities exsists like auth, kyc, wallet, tranfer</p>
