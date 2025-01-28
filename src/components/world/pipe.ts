import { Bodies, Body, Composite } from 'matter-js';

export class Pipe {
    body: Matter.Body;        // Visual SVG (like background)
    leftWall: Matter.Body;    // Collision wall
    topSensor: Matter.Body;    // Full-width sensor at top of pipe
    composite: Matter.Composite;
    isGoodLife: boolean;

    constructor(x: number, y: number, width: number, height: number, isGoodLife: boolean) {
        // Visual SVG - using new dimensions
        this.body = Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            isSensor: true,
            render: {
                sprite: {
                    texture: isGoodLife ? '/judgement/goodLife.svg' : '/judgement/badLife.svg',
                    xScale: width/195,     // New width: 195
                    yScale: height/369     // New height: 369
                }
            }
        });

        // Collision wall - now using actual proportions
        const wallWidth = width / 3;       // One-third of actual width
        const wallHeight = height * 0.39;         // Full height now matches visual
        
        // Create wall
        this.leftWall = Bodies.rectangle(
            x,
            y,
            wallWidth,
            wallHeight,
            { 
                isStatic: true,
                render: { 
                    visible: true,
                    fillStyle: '#FF0000'
                }
            }
        );

        // Sensor position moved down
        this.topSensor = Bodies.rectangle(
            x,
            y - wallHeight/2 + 65,  // Increased from 50 to 65 to move down
            wallWidth,
            5,
            {
                isStatic: true,
                isSensor: true,
                render: {
                    visible: true,
                    fillStyle: '#0000FF'
                },
                label: isGoodLife ? 'goodLifeSensor' : 'badLifeSensor'
            }
        );

        this.composite = Composite.create();
        Composite.add(this.composite, [
            this.topSensor,    // Add sensor first (will render behind)
            this.leftWall,     // Then wall
            this.body          // SVG body last (will render in front)
        ]);
        
        this.isGoodLife = isGoodLife;
    }

    // Update both wall and sensor positions
    updateWallPosition() {
        if (this.body && this.leftWall && this.topSensor) {
            const wallPos = this.body.position;
            Body.setPosition(this.leftWall, wallPos);
            Body.setPosition(this.topSensor, {
                x: wallPos.x,
                y: wallPos.y - (this.leftWall.bounds.max.y - this.leftWall.bounds.min.y)/2
            });
        }
    }

    static create(x: number, y: number, width: number, height: number, isGoodLife: boolean): Pipe {
        return new Pipe(x, y, width, height, isGoodLife);
    }
}
