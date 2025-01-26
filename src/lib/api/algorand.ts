const MORI_ASA_ID = '1018187012';
const RESERVE_ADDRESS = 'LOGOSKGASR2WUTFBRQQSGOJT7QBXWQV7HWGTLYRBVGLJQFVLH2BR5NGQZQ';
const TOTAL_SUPPLY = 11200000000; // Fixed total supply

export async function getCirculatingSupply() {
  try {
    // Get reserve balance - fixed URL structure
    const reserveResponse = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${RESERVE_ADDRESS}`);
    const reserveData = await reserveResponse.json();
    
    // Find MORI in the assets array
    const moriAsset = reserveData.account.assets?.find(asset => 
      asset['asset-id'].toString() === MORI_ASA_ID
    );
    
    // Get the MORI token balance
    const reserveBalance = moriAsset?.amount || 0;
    console.log('Reserve balance:', reserveBalance); // Debug log

    // Calculate circulating supply (total minus what LOGOS holds)
    const circulatingSupply = TOTAL_SUPPLY - reserveBalance;
    console.log('Circulating supply:', circulatingSupply); // Debug log

    return circulatingSupply;
  } catch (error) {
    console.error('Error calculating supply:', error);
    return 0;
  }
}

export async function getLastTransaction() {
  try {
    const response = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${RESERVE_ADDRESS}/transactions?limit=1`);
    const data = await response.json();
    const tx = data.transactions[0];
    
    // If it's a MORI asset transfer, return the amount
    if (tx && tx['asset-transfer-transaction']?.['asset-id'].toString() === MORI_ASA_ID) {
      return tx['asset-transfer-transaction'].amount.toLocaleString();
    }
    
    // Fallback to transaction ID if not a MORI transfer
    return tx?.id?.slice(0, 8) || 'Error';
  } catch (error) {
    console.error('Error fetching last transaction:', error);
    return 'Error';
  }
} 