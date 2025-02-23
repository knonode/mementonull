# Population Counter Implementation Plan

## Overview
Create a live population counter that:
- Displays under "WORLD POPULATION TRACKER"
- Shows smooth progression between hourly updates
- Syncs with blockchain transactions
- Maintains terminal aesthetic

## Important Notes
- Do not modify left-side info panel except:
  - Remove "Next txn in:" as it won't be needed
- Keep all other existing functionality intact

## Current Data Flow
1. apiStore caches:
   - circulatingSupply (current population)
   - lastTx (hourly change)
   - lastFetchTime (timestamp)

## Implementation Plan

### 1. Counter Behavior
- Two-phase counting:
  1. Catch-up Phase:
     - Calculate "current" number based on time since last update
     - Quick but smooth animation (2-3 seconds)
     - Use easeOutExpo/easeOutQuart for pleasing deceleration
  2. Normal Phase:
     - Sync with ragdoll drop speed
     - Continue until next blockchain update

### 2. Time Synchronization
- Blockchain updates occur at XX:04 of each hour
- API calls scheduled for XX:05 to account for delays
- Calculate remaining time until next update
- Adjust counter speed based on current time

### 1. Time Sync System
- Get initial blockchain time from Algonode response
- Calculate time until next hour
- Store sync offset between local and blockchain time

### 2. Counter Logic
- Start: Current circulatingSupply
- Target: circulatingSupply + lastTx
- Duration: 
  - Catch-up phase: 2-3 seconds with easing
  - Normal phase: Remaining time until XX:04
- Update Rate: ~1 second intervals
- Increment Size: lastTx / seconds_remaining

### 3. Display Component
typescript
interface CounterState {
currentValue: number;
targetValue: number;
increment: number;
nextUpdate: number;
}


### 4. Update Cycle
1. On Page Load:
   - Fetch current data
   - Calculate time to next hour
   - Initialize counter

2. Every Second:
   - Update displayed value
   - Smooth increment
   - Format number display

3. On Hour Mark:
   - Fetch new blockchain data
   - Reset counter with new values
   - Calculate new increment rate

### 5. Error Handling
- Network issues: Continue counting
- Sync drift: Adjust at hourly updates
- Browser tab inactive: Recalculate on focus

### 6. Visual Integration
- Match terminal font
- Align under "WORLD POPULATION TRACKER"
- Optional subtle animation
- Clear number formatting

## Benefits
- Visual representation of growth
- Maintains accuracy with blockchain
- Smooth user experience
- No interference with ragdoll system