import Particle from './Particle';
import { asteroidVertices, randomNumBetween } from './helpers';
import spaceshipImage from './images/aestroid.png';

export default class Asteroid {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: randomNumBetween(-0.5, 0.5),
      y: randomNumBetween(-0.5, 0.5)
    }
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1)
    this.radius = args.size*1;
    this.score = (80/this.radius)*5;
    this.create = args.create;
    this.addScore = args.addScore;
    this.vertices = asteroidVertices(8, args.size)
    // Assign a word to the asteroid
    this.text = args.shortcut.description;
    this.shortcut = args.shortcut;
    this.level = args.level;

    //if we are less than level 1 show the shortcut
    if (this.level < 2)
      this.text += "\n" + args.shortcut.shortcut;

    // Load spaceship image
    this.image = new Image();
    this.image.src = spaceshipImage;
  }

  destroy(){
    this.delete = true;
    this.addScore(this.score, this.shortcut);
    // Explode
    for (let i = 0; i < this.radius; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 3),
        position: {
          x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
          y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4),
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
    }
    // Break into smaller asteroids
    // if (this.radius > 10){
    //   for (let i = 0; i < 2; i++) {
    //     let asteroid = new Asteroid({
    //       size: this.radius/2,
    //       position: {
    //         x: randomNumBetween(-10, 20)+this.position.x,
    //         y: randomNumBetween(-10, 20)+this.position.y
    //       },
    //       create: this.create.bind(this),
    //       addScore: this.addScore.bind(this),
    //       shortcut: this.shortcut
    //     });
    //     this.create(asteroid, 'asteroids');
    //   }
    // }
  }

  render(state){
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if(this.position.x > state.screen.width + this.radius) this.position.x = -this.radius;
    else if(this.position.x < -this.radius) this.position.x = state.screen.width + this.radius;
    if(this.position.y > state.screen.height + this.radius) this.position.y = -this.radius;
    else if(this.position.y < -this.radius) this.position.y = state.screen.height + this.radius;
 
    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);

    // Draw image
    context.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

    context.restore();
    context.save();
    context.translate(this.position.x, this.position.y);

    // Draw text
    context.font = '14px Arial';
    context.fillStyle = '#FFF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.text, 0, 0);
     //only displaying shorcut if its not destroyed
     if (!this.destroyed && this.hint) {
      context.fillText(this.hint, 2, 15);
    }
    context.restore();
  }

  createGradient(context, radius) {
    const gradient = context.createRadialGradient(0, 0, radius / 2, 0, 0, radius);
    gradient.addColorStop(0, 'rgba(98, 3, 88, 0.6)');
    gradient.addColorStop(1, 'rgba(10, 3, 199, 0.3)');
    return gradient;
  }
}