import Bullet from './Bullet';
import TrackingBullet from './TrackingBullet';
import Particle from './Particle';
import { rotatePoint, randomNumBetween } from './helpers';
import spaceshipImage from './images/sheshaspaceship.png'; 

export default class Ship {
  constructor(args) {
    this.position = args.position;
    this.velocity = {
      x: 0,
      y: 0
    };
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 80; 
    this.lastShot = 0;
    this.create = args.create;
    this.onDie = args.onDie;

    // Load spaceship image
    this.image = new Image();
    this.image.src = spaceshipImage;
  }

  destroy() {
    this.delete = true;
    this.onDie();

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius / 4, this.radius / 4),
          y: this.position.y + randomNumBetween(-this.radius / 4, this.radius / 4)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
    }
  }

  rotate(dir) {
    if (dir === 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir === 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }

  calculateAngle(position1, position2) {
    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
    const angleRadians = Math.atan2(dy, dx);
    const angleDegrees = angleRadians * (180 / Math.PI);
    return angleDegrees - 90;
  }

  autoAim(position) {
    this.rotation = this.calculateAngle(position, this.position);
  }

  accelerate(val) {
    this.velocity.x -= Math.sin(-this.rotation * Math.PI / 180) * this.speed;
    this.velocity.y -= Math.cos(-this.rotation * Math.PI / 180) * this.speed;

    // Thruster particles
    let posDelta = rotatePoint({ x: 0, y: -10 }, { x: 0, y: 0 }, (this.rotation - 180) * Math.PI / 180);
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

  calculateCollisionVelocity(positionA, positionB, velocity, S) {
    const Bx_prime = positionB.x + velocity.x * S;
    const By_prime = positionB.y + velocity.y * S;
    const vAx = (Bx_prime - positionA.x) / S;
    const vAy = (By_prime - positionA.y) / S;
    return { x: vAx, y: vAy };
  }

  render(state) {
    // Controls
    if (state.keys.up) {
      this.accelerate(1);
    }
    if (state.keys.left) {
      this.rotate('LEFT');
    }
    if (state.keys.right) {
      this.rotate('RIGHT');
    }
    if (state.keys.space && Date.now() - this.lastShot > 300) {
      let bullet;
      if (state.keys.x && state.astroidPostion) {
        bullet = new TrackingBullet({ ship: this, velocity: this.calculateCollisionVelocity(this.position, state.astroidPostion, state.astroidVelocity, 50) });
      } else {
        bullet = new Bullet({ ship: this });
      }
      this.create(bullet, 'bullets');
      this.lastShot = Date.now();
    }

    if (state.keys.x && state.astroidPostion) {
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

    // Draw spaceship
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);

    // Draw image with new size
    const imageSize = this.radius * 2;
    context.drawImage(this.image, -imageSize / 2, -imageSize / 2, imageSize, imageSize);

    context.restore();
  }
}
