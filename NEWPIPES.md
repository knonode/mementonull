# New Pipes Implementation Plan

## Current Setup
- Two pipes (bad life, good life)
- Positioned at 25% and 75% of screen width
- Scale and reposition on screen resize
- SVG backgrounds scale with screen

## New Setup
Six pipes on each side, in sequence:
1. No Life
2. Low Life
3. Bad Life (existing)
4. Good Life (existing)
5. High Life
6. Best Life

## Implementation Steps

### 1. Pipe Class Updates
- Update Pipe.ts to handle new pipe types
- Add new SVG assets for each pipe type
- Maintain consistent pipe width/height ratios

### 2. Positioning Logic
- Calculate positions based on screen width
- Left side sequence: 15%, 20%, 25% of width
- Right side sequence: 75%, 80%, 85% of width
- Maintain responsive scaling

### 3. World.svelte Updates
typescript
const pipes = {
left: {
noLife: Pipe.create(w 0.15, h, pipeWidth, pipeHeight, false),
lowLife: Pipe.create(w 0.20, h, pipeWidth, pipeHeight, false),
badLife: leftPipe // existing
},
right: {
goodLife: rightPipe, // existing
highLife: Pipe.create(w 0.80, h, pipeWidth, pipeHeight, true),
bestLife: Pipe.create(w 0.85, h, pipeWidth, pipeHeight, true)
}
};

### 4. Resize Handler Updates
- Update resize function to handle all pipes
- Maintain center alignment
- Scale SVGs proportionally

### 5. Collision Detection
- Update collision handlers for new pipe types
- Add new particle effects for each type
- Track counts for each life type

### 6. Visual Assets
- Create new SVG backgrounds for each pipe type
- Maintain consistent style with existing pipes
- Ensure proper scaling

### 7. Testing Steps
- Test responsive behavior
- Verify collision detection
- Check performance with increased pipe count
- Test particle effects
