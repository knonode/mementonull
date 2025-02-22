<script lang="ts">
  import { 
    Engine,
    Render,
    Runner,
    Mouse,
    MouseConstraint,
    World,
    Bodies,
    Body,
    Events,
  } from 'matter-js';
  import Ragdoll from './ragdoll';
  import { onMount } from 'svelte'; 
  import Matter from 'matter-js';
  const { Composite } = Matter;
  import { getCirculatingSupply, getLastTransaction, updateAssetInfo } from '$lib/api/algorand';
  import AboutOverlay from '../overlays/AboutOverlay.svelte';
  import { apiStore } from '$lib/stores/apiStore';
  import { Pipe, type PipeType } from './pipe';
  let viewport: HTMLElement;
  let engine: Engine;
  let render: Render;
  let world: World;
  let wallBodies: { ground: Body, left: Body, right: Body };
  let w: number;
  let h: number;
  const walls = Composite.create();
  const humans = Composite.create();

  let apiData: {
    circulatingSupply: string;
    lastTx: string;
    lastFetchTime?: number;
  } = {
    circulatingSupply: Number(0).toLocaleString(),
    lastTx: "--"
  };
  let nextUpdateTime: number;
  let countdown = "--:--";
  let isAboutOpen = false;
  let timer: NodeJS.Timer;
  let isPaused = false;
  let runner: Runner;

  const MAX_RAGDOLLS = 60;
  const BODIES_PER_RAGDOLL = 10;

  let ragdolls: Matter.Composite[] = [];  // Add this to track ragdolls

  let pipes: Record<PipeType, Pipe>;

  let lifeCounts: Record<PipeType, number> = {
    noLife: 0,
    halfLife: 0,
    lowLife: 0,
    badLife: 0,
    goodLife: 0,
    highLife: 0,
    bestLife: 0,
    wonderfulLife: 0
  };

  // First, let's store references to the deflector components
  let deflector: Matter.Body;
  let deflectorPivot: Matter.Body;
  let deflectorConstraint: Matter.Constraint;

  let maxWidth: number;

  const MIN_CENTRAL_DISTANCE = 150; // Minimum pixels between bad and good life

  let pipePositions: Record<PipeType, { x: number; y: number }> = {};

  function initializeTimer(lastFetchTime: number) {
    performance.mark('initTimer-start');
    
    const now = Date.now();
    const nextUpdate = lastFetchTime + 3600000;
    const result = Math.floor((nextUpdate - now) / 1000);
    
    performance.mark('initTimer-end');
    performance.measure('Timer Initialization', 'initTimer-start', 'initTimer-end');
    return result;
  }

  apiStore.subscribe(value => {
    performance.mark('storeUpdate-start');
    
    console.log('Store update:', value);
    value.circulatingSupply = Number(value.circulatingSupply).toLocaleString();
    apiData = value;
    if (value.lastFetchTime) {
      nextUpdateTime = initializeTimer(value.lastFetchTime);
      countdown = `${Math.floor(nextUpdateTime / 60)}:${(nextUpdateTime % 60).toString().padStart(2, '0')}`;
      if (timer) clearInterval(timer);
      timer = setInterval(updateCountdown, 1000);
    }
    
    performance.mark('storeUpdate-end');
    performance.measure('Store Update', 'storeUpdate-start', 'storeUpdate-end');
  });
  
  function updateCountdown() {
    performance.mark('countdown-start');
    
    if (nextUpdateTime > 0) {
      nextUpdateTime--;
      countdown = `${Math.floor(nextUpdateTime / 60)}:${(nextUpdateTime % 60).toString().padStart(2, '0')}`;
      if (nextUpdateTime === 0) updateAssetInfo();
    }
    
    performance.mark('countdown-end');
    performance.measure('Countdown Update', 'countdown-start', 'countdown-end');
  }

  function toggleAbout() {
    isAboutOpen = !isAboutOpen;
  }

  onMount(() => {
    console.log('Component mounted');
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'k' || e.key === 'K') {  // 'k' for kill
        isPaused = !isPaused;
        if (isPaused) {
          runner.enabled = false;
          Render.stop(render);
        } else {
          runner.enabled = true;
          Render.run(render);
        }
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timer) clearInterval(timer);
    };
  });

  /**
  * Init
  * ==================================================
  */
  onMount(init);
  function init() {
    engine = Engine.create({
        gravity: {
            x: 0,
            y: 0.21,  // Using the mobile value globally for gentler physics
            scale: 0.001
        }
    });
    console.log('Screen size:', w, 'Gravity:', engine.gravity.y); // Keep for debugging
    world = engine.world;
    render = Render.create({
      element: viewport,
      engine,
      options: {
        background: 'transparent',
        wireframes: false,
        hasBounds: true
      },
    });
    
    // Create runner with conditional speed
    runner = Runner.create({
      isFixed: true,
      delta: 1000/30,  // Base FPS
      enabled: true
    });
    
    Render.run(render);
    Runner.run(runner, engine);
    
    const pipeWidth = 195;
    const pipeHeight = 369;
    const centerLeft = w * 0.35;
    const centerRight = w * 0.65;
    const pipeSpacing = 180;

    // Create all six pipes
    pipes = {
      noLife: Pipe.create(centerLeft - (pipeSpacing * 3), h, pipeWidth, pipeHeight, 'noLife'),
      halfLife: Pipe.create(centerLeft - (pipeSpacing * 2), h, pipeWidth, pipeHeight, 'halfLife'),
      lowLife: Pipe.create(centerLeft - pipeSpacing, h, pipeWidth, pipeHeight, 'lowLife'),
      badLife: Pipe.create(centerLeft, h, pipeWidth, pipeHeight, 'badLife'),
      goodLife: Pipe.create(centerRight, h, pipeWidth, pipeHeight, 'goodLife'),
      highLife: Pipe.create(centerRight + pipeSpacing, h, pipeWidth, pipeHeight, 'highLife'),
      bestLife: Pipe.create(centerRight + (pipeSpacing * 2), h, pipeWidth, pipeHeight, 'bestLife'),
      wonderfulLife: Pipe.create(centerRight + (pipeSpacing * 3), h, pipeWidth, pipeHeight, 'wonderfulLife')
    };

    // Add all pipes to world
    Composite.add(world, Object.values(pipes).map(pipe => pipe.composite));
    
    const mouse = addMouse();
    addWalls();
    resize();
    
    // Create a pivot point for the deflector (change back to original y position)
    deflectorPivot = Bodies.circle(w/2, -20, 2, {
      isStatic: true,
      render: { visible: false }
    });
    
    // Create the rotating deflector (change back to original y position)
    deflector = Bodies.polygon(w/2, -20, 3, 25, {
      angle: Math.PI * 0.5,
      density: 0.1,
      friction: 0.1,
      render: { 
        visible: true,
        fillStyle: '#000000',  // Black color
        opacity: 0.8
      }
    });
    
    // Create a constraint (change back to original y position)
    deflectorConstraint = Matter.Constraint.create({
      pointA: { x: w/2, y: -40 },
      bodyB: deflector,
      pointB: { x: 0, y: -12.5 },
      length: 0
    });

    // Track rotation direction and accumulated angle
    let rotationDirection = 1;
    let accumulatedAngle = 0;

    // Add alternating rotation with width-based scaling
    Events.on(engine, 'beforeUpdate', () => {
        // Calculate maximum velocity
        const baseVelocity = 0.05;
        const widthScale = Math.min(w / 200, 5);
        const maxVelocity = baseVelocity * widthScale;
        
        // Randomize between 0 and max velocity
        const r = Math.random();
        const angularVelocity = maxVelocity * (0.6 * r + 0.4 * (r * r));
        
        Body.setAngularVelocity(deflector, angularVelocity * rotationDirection);
        
        // Track accumulated rotation
        accumulatedAngle += angularVelocity * rotationDirection;
        
        // Randomly choose new direction after half rotation
        if (Math.abs(accumulatedAngle) >= Math.PI * 0.8) {  // 20% smaller rotation range
            rotationDirection = Math.random() > 0.5 ? 1 : -1;
            accumulatedAngle = 0;
        }
    });
    
    Composite.add(walls, [deflectorPivot, deflector, deflectorConstraint]);
    
    Composite.add(world, [mouse, walls, humans]);
    addHuman();
    setInterval(addHuman, 500);

    // Update collision detection to handle all pipe types
    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            
            // Check for any pipe sensor collision
            const sensorBody = bodyA.label.includes('Sensor') ? bodyA : 
                             bodyB.label.includes('Sensor') ? bodyB : null;
            
            if (sensorBody) {
                const distance = Math.abs(bodyA.position.y - bodyB.position.y);
                
                if (distance <= 3) {
                    const dollBody = bodyA === sensorBody ? bodyB : bodyA;
                    const dollIndex = ragdolls.findIndex(doll => 
                        doll.bodies.some(body => body.id === dollBody.id)
                    );

                    if (dollIndex !== -1) {
                        // Extract pipe type from sensor label
                        const pipeType = sensorBody.label.replace('Sensor', '') as PipeType;
                        lifeCounts[pipeType]++;

                        // Create more particles for smoky effect
                        for (let i = 0; i < 6; i++) {
                            const particle = Bodies.circle(
                                dollBody.position.x + (Math.random() - 0.5) * 10,
                                dollBody.position.y,
                                2 + Math.random() * 2,
                                {
                                    isStatic: false,
                                    frictionAir: 0.05,
                                    density: 0.0005,
                                    render: {
                                        fillStyle: pipeType === 'goodLife' ? '#E0E0E0' : '#C0C0C0',
                                        opacity: 0.8
                                    }
                                }
                            );
                            
                            // Even gentler initial boost
                            Body.setVelocity(particle, {
                                x: (Math.random() - 0.5) * 0.2,  // Reduced horizontal spread
                                y: -0.2 - Math.random() * 0.3    // Much slower upward start
                            });
                            
                            Composite.add(world, particle);
                            
                            // Even gentler constant force
                            Events.on(engine, 'beforeUpdate', function updateParticle() {
                                Body.applyForce(particle, particle.position, {
                                    x: 0,
                                    y: -0.00002  // Reduced upward force
                                });
                                
                                if (particle.render && particle.render.opacity <= 0) {
                                    Events.off(engine, 'beforeUpdate', updateParticle);
                                }
                            });
                            
                            // Faster fade
                            let opacity = 0.8;
                            const fadeInterval = setInterval(() => {
                                opacity -= 0.04;  // Increased fade rate
                                if (particle.render) particle.render.opacity = opacity;
                                if (opacity <= 0) {
                                    clearInterval(fadeInterval);
                                    Composite.remove(world, particle);
                                }
                            }, 50);  // Shorter interval
                        }

                        const doll = ragdolls[dollIndex];
                        Composite.remove(humans, doll);
                        ragdolls.splice(dollIndex, 1);
                    }
                }
            }
        });
    });
  }

  /**
  * Add Mouse
  * ==================================================
  */
  function addMouse() {
    const mouse = Mouse.create(render.canvas);
    render.mouse = mouse;
    return MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.6,
        render: { visible: false }
      }
    });

  }


  /**
  * Add walls
  * ==================================================
  */
  function addWalls() {
    wallBodies = {
      ground: Bodies.rectangle(w/2, h+1, w, 2, {
        isStatic: true,
        render: { 
          visible: false,
          opacity: 0
        }
      }),
      left: Bodies.rectangle(-50 , h/2, 100, h, { 
        isStatic: true,
        render: { visible: false }
      }),
      right: Bodies.rectangle(w + 50 , h/2, 100, h, { 
        isStatic: true,
        render: { visible: false }
      }),
    };
    Composite.add(walls, Object.values(wallBodies));
  }



  /**
  * Add people
  * ==================================================
  */
  function addHuman() {
    const human = Ragdoll.create(w/2, -80, 0.25) as Matter.Composite;
    Composite.add(humans, human);
    ragdolls.push(human);  // Track the new ragdoll

    // Remove oldest if at limit
    if (ragdolls.length > MAX_RAGDOLLS) {
      const oldestRagdoll = ragdolls[0];
      Composite.remove(humans, oldestRagdoll);
      ragdolls.splice(0, 1);  // Remove from our tracking array
    }
  }


  /**
  * Resize
  * ==================================================
  */
  $: w, h, resize();
  function resize() {
    if (!render) return;
    maxWidth = Math.min(w, 960);
    render.options.width = w;
    render.options.height = h;
    render.canvas.width = w;
    render.canvas.height = h;
    render.bounds.max.x = w;
    render.bounds.max.y = h;
    if (!wallBodies) return;
    Body.setVertices(wallBodies.ground, [{x:w/-2, y:-50}, {x:w/2, y:-50}, {x:w/2, y:50}, {x:w/-2, y:50}]);
    Body.setVertices(wallBodies.left, [{x: -50,y: h/-2}, {x: 50,y: h/-2}, {x: 50,y: h/2}, {x: -50,y: h/2}]);
    Body.setVertices(wallBodies.right, [{x: -50,y: h/-2}, {x: 50,y: h/-2}, {x: 50,y: h/2}, {x: -50,y: h/2}]);
    Body.setPosition(wallBodies.ground, { x: w/2, y: h+20 });
    Body.setPosition(wallBodies.left, { x: -50, y: h/2 });
    Body.setPosition(wallBodies.right, { x: w+50, y: h/2 });
    
    if (pipes) {
        const centerOffset = (w - maxWidth) / 2;
        const bottomOffset = 110;
        const pipeSpacing = 180;
        
        let centerLeft = maxWidth * 0.35;
        let centerRight = maxWidth * 0.65;
        
        const actualDistance = centerRight - centerLeft;
        if (actualDistance < MIN_CENTRAL_DISTANCE) {
            centerLeft = (maxWidth - MIN_CENTRAL_DISTANCE) / 2;
            centerRight = centerLeft + MIN_CENTRAL_DISTANCE;
        }
        
        // Update pipePositions
        pipePositions = {
            noLife: { x: centerOffset + centerLeft - (pipeSpacing * 3), y: h - bottomOffset },
            halfLife: { x: centerOffset + centerLeft - (pipeSpacing * 2), y: h - bottomOffset },
            lowLife: { x: centerOffset + centerLeft - pipeSpacing, y: h - bottomOffset },
            badLife: { x: centerOffset + centerLeft, y: h - bottomOffset },
            goodLife: { x: centerOffset + centerRight, y: h - bottomOffset },
            highLife: { x: centerOffset + centerRight + pipeSpacing, y: h - bottomOffset },
            bestLife: { x: centerOffset + centerRight + (pipeSpacing * 2), y: h - bottomOffset },
            wonderfulLife: { x: centerOffset + centerRight + (pipeSpacing * 3), y: h - bottomOffset }
        };

        // Update pipe positions
        Object.entries(pipes).forEach(([type, pipe]) => {
            const pos = pipePositions[type as PipeType];
            Body.setPosition(pipe.body, pos);
            
            const scale = maxWidth/960;
            Body.scale(pipe.body, scale, scale);
            
            // Show/hide pipes based on screen width
            if (pipe.body.render) {
                // Always show the central pipes (badLife and goodLife)
                if (type === 'badLife' || type === 'goodLife') {
                    pipe.body.render.opacity = 1;
                    pipe.leftWall.render.opacity = 1;
                    pipe.topSensor.render.opacity = 1;
                } else {
                    // For other pipes, check if they fit on screen
                    const isVisible = pos.x > 0 && pos.x < w;
                    pipe.body.render.opacity = isVisible ? 1 : 0;
                    pipe.leftWall.render.opacity = isVisible ? 1 : 0;
                    pipe.topSensor.render.opacity = isVisible ? 1 : 0;
                    
                    // Disable collision for hidden pipes
                    pipe.leftWall.isSensor = !isVisible;
                    pipe.topSensor.isSensor = true;
                }
            }
            
            pipe.updateWallPosition();
        });
    }

    if (deflector && deflectorPivot && deflectorConstraint) {
        Body.setPosition(deflectorPivot, {
            x: w/2,
            y: -20
        });
        
        Body.setPosition(deflector, {
            x: w/2,
            y: -20
        });
        
        deflectorConstraint.pointA = {
            x: w/2,
            y: -40
        };
    }
  }

  function calculateNextUpdate() {
    const now = Date.now();
    const nextHour = Math.ceil(now / 3600000) * 3600000;
    return Math.max(0, nextHour - now);
  }

  onMount(async () => {
    // Initial fetch
    await updateAssetInfo();
    
    // Set up interval for next top of the hour
    const initialDelay = calculateNextUpdate();
    setTimeout(() => {
      updateAssetInfo();
      // After first sync, set regular hourly interval
      setInterval(updateAssetInfo, 3600000);
    }, initialDelay);
  });

</script>





<div 
  bind:this={viewport}
  bind:clientHeight={h}
  bind:clientWidth={w}
  class="viewport"
>
  {#if pipes && pipePositions}
    {#each Object.keys(pipes) as type}
      {@const pos = pipePositions[type]}
      {@const pipe = pipes[type]}
      {@const isVisible = pos.x > 0 && pos.x < w && pipe.body.render?.opacity > 0}
      {#if isVisible}
        <div 
          class="pipe-counter" 
          style="
            left: {pos.x}px; 
            top: {pos.y + 25}px;  /* Add 10px to move down */
            transform: translate(-50%, -100%) scale({maxWidth/960});
          "
        >
          {lifeCounts[type]}
        </div>
      {/if}
    {/each}
  {/if}

  <div class="info-panel terminal-text">
    <h1 class="header">
      <span class="left-title">MEMENTO MORI</span>
      <span class="right-title">WORLD POPULATION TRACKER</span>
    </h1>
    
    <div class="info-row">
      <span class="label">Unit:</span>
      <span class="value">MORI</span>
    </div>

    <div class="info-row">
      <span class="label">ASA ID:</span>
      <span class="value">
        <a href="https://allo.info/asset/1018187012/token" target="_blank" rel="noopener noreferrer">
          1018187012
        </a>
      </span>
    </div>
    
    <div class="info-row">
      <span class="label">Total Supply:</span>
      <span class="value">11.200.000.000</span>
    </div>

    <div class="info-row">
      <span class="label">Circulating:</span>
      <span class="value">{apiData.circulatingSupply}</span>
    </div>
    
    <div class="info-row">
      <span class="label">Last txn:</span>
      <span class="value">{apiData.lastTx}</span>
    </div>

    <div class="info-row">
      <span class="label">Next txn in:</span>
      <span class="value">{countdown}</span>
    </div>

    <div class="info-row">
      <span class="label">
        <a href="#" class="value" on:click|preventDefault={toggleAbout}>About</a>
      </span>
    </div>
  </div>
</div>

<AboutOverlay isOpen={isAboutOpen} onClose={toggleAbout} />

<style lang="scss">
  .viewport {
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      url('/backgrounds/mori-background1.svg'),
      url('/backgrounds/mori-background2.svg');
    background-position: 
      bottom center,
      bottom center;
    background-repeat: no-repeat;
    background-size: 
      max(100%, min(100%, 960px)) auto,
      max(100%, min(100%, 960px)) auto;
  }

  /* Optional: Add media queries for more control */
  @media (max-width: 768px) {
    .viewport {
      background-size: 
        1000px auto,  /* Fixed width for small screens */
        1000px auto;
    }
  }

  .value a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .header {
    display: flex;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .left-title {
    width: 50%;
    text-align: left;
  }

  .right-title {
    width: 50%;
    text-align: right;
    margin-right: -50px;  // Small negative margin to prevent text cutoff
    padding-right: 50px;  // Compensate for the negative margin
  }

  .info-panel {
    width: 100%;
    padding: 0;
    overflow: visible;  // Ensure content isn't clipped
  }

  .pipe-counter {
    position: absolute;
    color: white;
    font-family: 'Maven Pro', sans-serif;
    font-size: 18px;
    text-align: center;
    pointer-events: none;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }
</style>
