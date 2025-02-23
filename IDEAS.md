# Collective Memory System - this is an idea from Claude 3.5 Sonnet that he gave after I prompted him how to make a global count of the ragdolls falling into the pipes by hand or just falling. The idea is simply to see what kind of distribution it creates. Would people throw the hampelmen into good lifes or the bad ones?

## Concept:
A peer-to-peer system where users collectively track how lives are sorted through the pipes. No central authority, just shared human experience - much like memory itself.

## Technical Overview
- Local storage for individual counts
- P2P sharing between active users
- Blended counts from all participants
- No server, no database

## How It Works

### Individual Experience
1. User visits the site
   - Starts fresh or joins existing session
   - Watches/interacts with falling figures
   - Local counts stored in browser

### Collective Memory
1. Active Users Share:
   - Anonymous count sharing
   - Blending of numbers
   - Real-time updates

2. Memory Decay:
   - Counts exist while users present
   - Fade as users leave
   - New users influence the collective

## Philosophical Alignment
- Mirrors human memory systems
- Reflects impermanence (memento mori)
- Each visitor becomes part of the story
- Truth emerges from collective experience

## Technical Considerations
- WebRTC for peer connections
- Local storage for persistence
- Simple averaging for count blending
- Lightweight implementation

## Limitations as Features
- Imperfect counting is human-like
- Dependency on active users is poetic
- Reset potential mirrors mortality
- Accuracy secondary to experience

## Future Possibilities
- Visual representation of active users
- Memory "heat map" of sorting trends
- Collective patterns emergence
- Seasonal/temporal variations

## Notes
This system turns technical limitations into thematic strengths. The impermanence and collective nature of the counting system reinforces the project's core message about life, death, and shared human experience.

# Technology Stack

## Core Requirements
1. WebRTC (Web Real-Time Communication)
   - Peer-to-peer connections
   - Built into modern browsers
   - No central server needed
   - Perfect for real-time data sharing

2. PeerJS Library
   - Simplifies WebRTC implementation
   - Handles peer discovery
   - Manages connections
   - Free and open source

3. Local Storage
   - Browser's built-in storage
   - Persists between sessions
   - Stores individual counts
   - No server needed

## Optional Enhancements
1. Signaling Server
   - Light coordination server
   - Could use free tier services
   - Only for peer discovery
   - Not for data storage

2. Y.js
   - Distributed data structures
   - Conflict resolution
   - Could enhance count sharing
   - Optional complexity

## Implementation Complexity
- Basic: Local Storage + WebRTC/PeerJS
- Medium: Add Signaling Server
- Advanced: Include Y.js

## Resource Usage
- Minimal bandwidth
- Browser-based computing
- No server costs
- Scales with users
