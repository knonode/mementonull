<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  
  const dispatch = createEventDispatcher();
  export let currentValue: number;
  export let targetValue: number;
  
  let displayValue = currentValue;
  let updateInterval: NodeJS.Timer;
  
  // Calculate the "current" value based on time elapsed
  function calculateCurrentValue() {
    const now = Date.now();
    const lastUpdate = Math.floor(now / 3600000) * 3600000 + (4 * 60 * 1000); // Last XX:04
    const nextUpdate = lastUpdate + 3600000; // Next XX:04
    const progress = (now - lastUpdate) / (nextUpdate - lastUpdate);
    return currentValue + (targetValue - currentValue) * progress;
  }
  
  // Two-phase animation
  async function startCounter() {
    // Phase 1: Quick catch-up
    const actualCurrent = calculateCurrentValue();
    const catchupDuration = 2000; // 2 seconds catch-up
    
    const startTime = Date.now();
    const startValue = displayValue;
    
    // Catch-up animation
    const catchup = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / catchupDuration, 1);
      const eased = cubicOut(progress);
      displayValue = startValue + (actualCurrent - startValue) * eased;
      
      if (progress === 1) {
        clearInterval(catchup);
        startNormalCounting(actualCurrent);
      }
    }, 16.67);
  }
  
  // Phase 2: Normal counting
  function startNormalCounting(fromValue: number) {
    const now = Date.now();
    const nextUpdate = Math.ceil(now / 3600000) * 3600000 + (4 * 60 * 1000); // Next XX:04
    const remainingTime = nextUpdate - now;
    const increment = (targetValue - fromValue) / (remainingTime / 16.67);
    
    updateInterval = setInterval(() => {
      if (displayValue < targetValue) {
        displayValue += increment;
        if (displayValue >= targetValue) {
          displayValue = targetValue;
          dispatch('reachedTarget');
        }
      }
    }, 16.67);
  }
  
  onMount(() => {
    startCounter();
  });
  
  onDestroy(() => {
    if (updateInterval) clearInterval(updateInterval);
  });
</script>

<div class="population-counter terminal-text">
  {Math.floor(displayValue).toLocaleString()}
</div>

<style>
  .population-counter {
    position: absolute;
    right: 0;
    top: 85px;
    margin-right: -35px; /* Negative margin to pull counter to the right */
    padding-right: 50px;
    font-family: 'VT323', monospace;
    font-size: 36px;
    line-height: 1.2;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .population-counter {
      font-size: 14px;
    }
  }
</style> 