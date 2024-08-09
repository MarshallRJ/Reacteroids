import Bullet from './Bullet';
import TrackingBullet from './TrackingBullet';
import Particle from './Particle';
import { rotatePoint, randomNumBetween } from './helpers';

export default class Ship {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: 0,
      y: 0
    }
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 40;// Increased radius for larger ship
    this.lastShot = 0;
    this.create = args.create;
    this.onDie = args.onDie;
  }

  destroy(){
    this.delete = true;
    this.onDie();

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
          y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
    }
  }

  rotate(dir){
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }

   calculateAngle(position1, position2) {
    // Calculate the differences
    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
  
    // Calculate the angle in radians
    const angleRadians = Math.atan2(dy, dx);
  
    // Convert the angle to degrees
    const angleDegrees = angleRadians * (180 / Math.PI);
  
    // Return the angle in degrees
    return angleDegrees - 90;
  }

  autoAim(position){
    this.rotation = this.calculateAngle(position,this.position);
  }

  accelerate(val){
    this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * this.speed;
    this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * this.speed;

    // Thruster particles
    let posDelta = rotatePoint({x:0, y:-10}, {x:0,y:0}, (this.rotation-180) * Math.PI / 180);
    const particle = new Particle({
      lifeSpan: randomNumBetween(20, 40),
      size: randomNumBetween(1, 3),
      position: {
        x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
      },
      velocity: {
        x: posDelta.x / randomNumBetween(3, 5),
        y: posDelta.y / randomNumBetween(3, 5)
      }
    });
    this.create(particle, 'particles');
  }

  calculateCollisionVelocity(positionA,positionB, velocity, S) {
    // Calculate the future position of point B
    const Bx_prime = positionB.x + velocity.x * S;
    const By_prime = positionB.y + velocity.y * S;

    // Calculate the required velocity components for point A
    const vAx = (Bx_prime - positionA.x) / S;
    const vAy = (By_prime - positionA.y) / S;

    return { x:vAx, y:vAy };
}

  render(state){
    // Controls
    if(state.keys.up){
      this.accelerate(1);
    }
    if(state.keys.left){
      this.rotate('LEFT');
    }
    if(state.keys.right){
      this.rotate('RIGHT');
    }
    if(state.keys.space && Date.now() - this.lastShot > 300){
      let bullet;
      if (state.keys.x && state.astroidPostion) {
        bullet = new TrackingBullet({ship: this, velocity: this.calculateCollisionVelocity(this.position, state.astroidPostion,state.astroidVelocity,50 )});
      }
      else
        bullet = new Bullet({ship: this});
      this.create(bullet, 'bullets');
      this.lastShot = Date.now();
      
    }

    if(state.keys.x && state.astroidPostion){
      this.autoAim(state.astroidPostion);
    }

     // Move
     this.position.x += this.velocity.x;
     this.position.y += this.velocity.y;
     this.velocity.x *= this.inertia;
     this.velocity.y *= this.inertia;
  
     // Rotation
     if (this.rotation >= 360) {
       this.rotation -= 360;
     }
     if (this.rotation < 0) {
       this.rotation += 360;
     }
  
     // Screen edges
     if (this.position.x > state.screen.width) this.position.x = 0;
     else if (this.position.x < 0) this.position.x = state.screen.width;
     if (this.position.y > state.screen.height) this.position.y = 0;
     else if (this.position.y < 0) this.position.y = state.screen.height;
  
     // Draw
     const context = state.context;
     context.save();
     context.translate(this.position.x, this.position.y);
     context.rotate(this.rotation * Math.PI / 180);
  
     // Draw Rocket Body
     context.beginPath();
     context.moveTo(0, -60); // Nose cone
     context.lineTo(20, -20); // Right side of body
     context.lineTo(20, 20);  // Right side of fins
     context.lineTo(-20, 20); // Left side of fins
     context.lineTo(-20, -20); // Left side of body
     context.closePath();
     context.fillStyle = '#f00'; // Red body
     context.fill();
     context.strokeStyle = 'black';
     context.lineWidth = 4;
     context.stroke();
  
     // Draw Rocket Nose Cone
     context.beginPath();
     context.moveTo(0, -60); // Nose tip
     context.lineTo(20, -20); // Right side of body
     context.lineTo(-20, -20); // Left side of body
     context.closePath();
     context.fillStyle = '#ff0'; // Yellow nose cone
     context.fill();
     context.stroke();
  
     // Draw Rocket Fins
     context.beginPath();
     context.moveTo(-20, 20); // Left base
     context.lineTo(-30, 40); // Left fin
     context.lineTo(-20, 30); // Base of fin
     context.closePath();
     context.fillStyle = '#00f'; // Blue fins
     context.fill();
     context.stroke();
  
     context.beginPath();
     context.moveTo(20, 20); // Right base
     context.lineTo(30, 40); // Right fin
     context.lineTo(20, 30); // Base of fin
     context.closePath();
     context.fillStyle = '#00f'; // Blue fins
     context.fill();
     context.stroke();
  
     // Draw Thruster Flame if accelerating
     if (state.keys.up) {
       context.fillStyle = 'orange';
       context.beginPath();
       context.moveTo(-10, 20);
       context.lineTo(0, 60);
       context.lineTo(10, 20);
       context.closePath();
       context.fill();
       context.strokeStyle = 'red';
       context.stroke();
     }
  
     context.restore();
  }
}
