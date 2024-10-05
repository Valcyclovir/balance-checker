const fetch = require('node-fetch');

const url = 'https://base-sepolia.g.alchemy.com/v2/m2agM8kSTOy2NYQPQY1OdMS_ps6Xpv8e';
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenBalances",
    params: [
        "0x0EFA0c78aA0E5CB851E909614c22C98E68dd882d",
        "erc20"
    ]
});

fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
})
.then(response => response.json())
.then(data => {
    console.log(JSON.stringify(data.result.tokenBalances, null, 2));
    if (data.result.tokenBalances && data.result.tokenBalances.length > 0) {
        const balanceInfo = data.result.tokenBalances[0];
        const hexBalance = balanceInfo.tokenBalance;
        // Convert hex string to BigInt for safe number handling
        const decimalBalance = BigInt(hexBalance);
        // Convert to readable format, assuming 18 decimals as an example
        const readableBalance = Number(decimalBalance) / Math.pow(10, 18);
        console.log(`Readable Token Balance: ${readableBalance}`);
    } else {
        console.log("No token balance found for this wallet or an error occurred.");
    }
})
.catch(error => console.error('Error:', error));