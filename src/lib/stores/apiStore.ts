// 1. Create new store file
import { writable } from 'svelte/store';
import { browser } from '$app/environment';  // Import browser check from SvelteKit

interface APICache {
  circulatingSupply: string;
  lastTx: string;
  lastFetchTime: number;
}

// Create a wrapper for localStorage operations that checks for browser environment
const storage = {
  save: (data: APICache) => {
    if (browser && data.lastFetchTime) {
      console.log('Saving to storage with timestamp:', new Date(data.lastFetchTime));
      localStorage.setItem('apiCache', JSON.stringify({
        ...data,
        lastFetchTime: Number(data.lastFetchTime) // Ensure it's a number
      }));
    }
  },
  load: (): APICache | null => {
    if (browser) {
      const data = localStorage.getItem('apiCache');
      if (data) {
        const parsed = JSON.parse(data);
        // Ensure lastFetchTime is a valid number
        if (parsed.lastFetchTime) {
          parsed.lastFetchTime = Number(parsed.lastFetchTime);
          console.log('Loaded from storage, fetch time:', new Date(parsed.lastFetchTime));
        }
        return parsed;
      }
    }
    return null;
  }
};

const createAPIStore = () => {
  // Load initial data only in browser
  const initialData = browser ? storage.load() || {
    circulatingSupply: "Loading...",
    lastTx: "Loading...",
    lastFetchTime: 0
  } : {
    circulatingSupply: "Loading...",
    lastTx: "Loading...",
    lastFetchTime: 0
  };
  
  console.log('Store initialized with:', initialData);
  
  const { subscribe, set, update } = writable<APICache>(initialData);

  return {
    subscribe,
    set: (value: APICache) => {
      if (value.lastFetchTime) {
        const dataToSave = {
          ...value,
          lastFetchTime: Number(value.lastFetchTime)
        };
        storage.save(dataToSave);
        set(dataToSave);
      }
    },
    update: (fn: (value: APICache) => APICache) => {
      update(currentValue => {
        const newValue = fn(currentValue);
        if (newValue.lastFetchTime) {
          storage.save(newValue);
        }
        return newValue;
      });
    }
  };
};

export const apiStore = createAPIStore();