import { apiStore } from '../stores/apiStore';

const MORI_ASA_ID = '1018187012';
const RESERVE_ADDRESS = 'LOGOSKGASR2WUTFBRQQSGOJT7QBXWQV7HWGTLYRBVGLJQFVLH2BR5NGQZQ';
const TOTAL_SUPPLY = 11200000000; // Fixed total supply

interface AlgorandAsset {
  'asset-id': number;
  amount: number;
}

// Add cache check function
function shouldFetchNewData(lastFetchTime: number): boolean {
  const now = Date.now();
  const nextHour = Math.ceil(now / 3600000) * 3600000;
  console.log('Checking if should fetch:', {
    lastFetchTime,
    now,
    timeSinceLastFetch: now - lastFetchTime
  });
  return now >= nextHour || (now - lastFetchTime) >= 3600000;
}

// Add this at the top to test localStorage
try {
  console.log('Testing localStorage...');
  localStorage.setItem('test', 'test');
  const testValue = localStorage.getItem('test');
  console.log('localStorage test value:', testValue);
  localStorage.removeItem('test');
} catch (error) {
  console.error('localStorage not working:', error);
}

let scheduledFetch: NodeJS.Timeout;

function getTimeUntilNextFetch(): number {
  const now = Date.now();
  const currentHour = Math.floor(now / 3600000) * 3600000;
  const currentHourFetch = currentHour + (5 * 60 * 1000); // XX:05 this hour
  const nextHourFetch = currentHour + 3600000 + (5 * 60 * 1000); // XX:05 next hour
  
  // If we haven't passed XX:05 this hour, wait for it
  if (now < currentHourFetch) {
    return currentHourFetch - now;
  }
  // Otherwise, wait for XX:05 next hour
  return nextHourFetch - now;
}

export async function getCirculatingSupply() {
  try {
    // Get reserve balance - fixed URL structure
    const reserveResponse = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${RESERVE_ADDRESS}`);
    const reserveData = await reserveResponse.json();
    
    // Find MORI in the assets array
    const moriAsset = reserveData.account.assets?.find((asset: AlgorandAsset) => 
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

// Modify existing functions to use cache
export async function updateAssetInfo(scheduleNext: boolean = true): Promise<void> {
  try {
    // Clear any existing scheduled update
    if (scheduledFetch) {
      clearTimeout(scheduledFetch);
    }

    const now = new Date();
    if (now.getMinutes() === 5) {
      console.log('XX:05 API call executed at:', now.toLocaleTimeString());
    }
    
    const supply = await getCirculatingSupply();
    const txAmount = await getLastTransaction();
    
    const newData = {
      circulatingSupply: supply.toString(),
      lastTx: txAmount.toString(),
      lastFetchTime: Date.now()
    };
    
    apiStore.set(newData);

    if (scheduleNext) {
      const delay = getTimeUntilNextFetch();
      scheduledFetch = setTimeout(() => updateAssetInfo(), delay);
    }
  } catch (error) {
    console.error('Error in updateAssetInfo:', error);
    if (scheduleNext) {
      scheduledFetch = setTimeout(() => updateAssetInfo(), 60000);
    }
  }
}

// Add visibility change handler
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Clear any existing timeout and schedule next update
      if (scheduledFetch) {
        clearTimeout(scheduledFetch);
      }
      const delay = getTimeUntilNextFetch();
      scheduledFetch = setTimeout(() => updateAssetInfo(), delay);
    }
  });
}