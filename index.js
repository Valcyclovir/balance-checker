require('dotenv').config();
const fetch = require('node-fetch');
const axios = require('axios');

const url = `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCH_API_KEY}`;
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const walletAddresses = process.env.WALLETS.split(',');
const contractAddress = process.env.CONTRACT_ADDRESS;
const tokenName = process.env.TOKEN_NAME;
const minBalance = parseFloat(process.env.MIN_BALANCE);

async function checkTokenBalance(wallet) {
    const body = JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [wallet, [contractAddress]]
    });

    try {
        const response = await fetch(url, { method: 'POST', headers: headers, body: body });
        const data = await response.json();
        
        if (data.result && data.result.tokenBalances && data.result.tokenBalances.length > 0) {
            let balanceHex = data.result.tokenBalances[0].tokenBalance;
            if (balanceHex.startsWith('0x')) {
                balanceHex = balanceHex.slice(2); // Remove the first '0x'
            }
            const balance = BigInt('0x' + balanceHex);
            const decimalBalance = Number(balance) / Math.pow(10, 18);
            
            console.log(`Wallet ${wallet}'s ${tokenName} balance: ${decimalBalance}`);
            
            if (decimalBalance < minBalance) {
                const message = `Alert: Wallet ${wallet}'s ${tokenName} balance (${decimalBalance}) is below the minimum threshold of ${minBalance}.`;
                await sendTelegramMessage(message);
            }
        } else {
            console.log(`No token balance found or error for wallet: ${wallet}`);
            await sendTelegramMessage(`Failed to get ${tokenName} balance for wallet: ${wallet}`);
        }
    } catch (error) {
        console.error(`Failed to check balance for ${wallet}:`, error);
        await sendTelegramMessage(`Error checking balance for wallet: ${wallet}. Error: ${error.message}`);
    }
}

async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            message_thread_id: process.env.MESSAGE_THREAD_ID,
            text: message
        });
        console.log('Message sent to Telegram successfully.');
    } catch (error) {
        console.error('Failed to send message to Telegram:', error);
    }
}

(async () => {
    for (let wallet of walletAddresses) {
        await checkTokenBalance(wallet.trim());
    }
})();