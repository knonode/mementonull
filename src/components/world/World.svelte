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
  import { getCirculatingSupply, getLastTransaction } from '$lib/api/algorand';
  import AboutOverlay from '../overlays/AboutOverlay.svelte';
  let viewport: HTMLElement;
  let engine: Engine;
  let render: Render;
  let world: World;
  let wallBodies: { ground: Body, left: Body, right: Body };
  let w: number;
  let h: number;
  const walls = Composite.create();
  const humans = Composite.create();

  let circulatingSupply = "Loading...";
  let lastTx = "Loading...";

  let isAboutOpen = false;
  
  /**
  * Init
  * ==================================================
  */
  onMount(init);
  function init() {
    engine = Engine.create();
    world = engine.world;
    render = Render.create({
      element: viewport,
      engine,
      options: {
        background: 'transparent',
        wireframes: false,
        // showDebug: true,
        // showMousePosition: true,
      },
    });
    
    const runner = Runner.create()
    Render.run(render);
    Runner.run(runner, engine);
    
    const mouse = addMouse();
    addWalls();
    resize();
    
    // Create a pivot point for the deflector
    const pivotPoint = Bodies.circle(w/2, -20, 2, {
      isStatic: true,
      render: { visible: false }
    });
    
    // Create the rotating deflector
    const deflector = Bodies.polygon(w/2, -20, 3, 25, {
      angle: Math.PI * 0.5,
      density: 0.1,
      friction: 0.1,
      render: { visible: true }
    });
    
    // Create a constraint that acts like a motor
    const constraint = Matter.Constraint.create({
      pointA: { x: w/2, y: -40 },
      bodyB: deflector,
      pointB: { x: 0, y: -12.5 },
      length: 0
    });

    // Track rotation direction and accumulated angle
    let rotationDirection = 1;
    let accumulatedAngle = 0;

    // Add alternating rotation
    Events.on(engine, 'beforeUpdate', () => {
      const angularVelocity = 0.03;
      Body.setAngularVelocity(deflector, angularVelocity * rotationDirection);
      
      // Track accumulated rotation
      accumulatedAngle += angularVelocity * rotationDirection;
      
      // Switch direction after one full rotation (2π radians)
      if (Math.abs(accumulatedAngle) >= Math.PI * 2) {
        rotationDirection *= -1;
        accumulatedAngle = 0;
      }
    });
    
    Composite.add(walls, [pivotPoint, deflector, constraint]);
    
    Composite.add(world, [mouse, walls, humans]);
    addHuman();

    setInterval(addHuman, 1000)

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
    // Spawn slightly higher to account for deflector
    const human = Ragdoll.create(w/2, -80, 0.25) as Matter.Composite;
    Composite.add(humans, human);
  }


  /**
  * Resize
  * ==================================================
  */
  $: w, h, resize();
  function resize() {
    if (!render) return;
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
  }

  async function updateAssetInfo() {
    try {
      // Get and format circulating supply
      const supply = await getCirculatingSupply();
      circulatingSupply = new Intl.NumberFormat().format(supply);

      // Get and format last transaction
      const txAmount = await getLastTransaction();
      lastTx = txAmount;  // Now returns either formatted amount or error message directly
    } catch (error) {
      console.error('Error fetching asset info:', error);
      circulatingSupply = "Error loading";
      lastTx = "Error loading";
    }
  }

  // Update every hour
  onMount(() => {
    updateAssetInfo();
    const interval = setInterval(updateAssetInfo, 3600000);
    return () => clearInterval(interval);
  });

  function toggleAbout() {
    isAboutOpen = !isAboutOpen;
  }

</script>





<div 
  bind:this={ viewport }
  bind:clientHeight={h}
  bind:clientWidth={w}
  class="viewport"
>
  <div class="info-panel terminal-text">
    <h1>MEMENTO MORI WORLD POPULATION SIMULATOR</h1>
    
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
      <span class="value">{circulatingSupply}</span>
    </div>
    
    <div class="info-row">
      <span class="label">Last txn:</span>
      <span class="value">{lastTx}</span>
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
</style>
