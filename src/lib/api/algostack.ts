import type { PlugableModules, OptionsProps } from 'algostack';
import  AlgoStack from 'algostack';
import Query from 'algostack/query';
// import Addons from 'algostack/addons'
import NFDs from 'algostack/nfds';
import Medias from 'algostack/medias';
import Cache from 'algostack/cache';
import Client from 'algostack/client';
import Txns from 'algostack/txns';

const modules: PlugableModules = { 
  Query, 
  NFDs,
  Medias,
  Cache,
  Client,
  Txns,
};

const options: OptionsProps = {
  version: 3,
  storageNamespace: 'allo-pop',
  customCaches: [
    'algonode/graphql',
    'nfds/consensus',
  ],
  cacheExpiration: {
    'account': '1m',
    'accountAssets': '10s',
    'nfds': '5s',
    'medias': '5s',
    'algonode/graphql': '5s',
    'nfds/consensus': '5m',
  },
}
const algostack = new AlgoStack(options, modules);

const MORI_ASA_ID = '1018187012';
const RESERVE_ADDRESS = 'LOGOSKGASR2WUTFBRQQSGOJT7QBXWQV7HWGTLYRBVGLJQFVLH2BR5NGQZQ';  // Add the actual address

algostack.getCirculatingSupply = async function() {
  const response = await fetch(`https://mainnet-idx.algonode.cloud/v2/assets/${MORI_ASA_ID}`);
  const data = await response.json();
  return data.asset.circulatingSupply;
}

algostack.getLastTransaction = async function() {
  const response = await fetch(`https://mainnet-idx.algonode.cloud/v2/accounts/${RESERVE_ADDRESS}/transactions?limit=1`);
  const data = await response.json();
  return data.transactions[0];
}

export default algostack;