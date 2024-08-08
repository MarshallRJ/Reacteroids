import { rotatePoint } from './helpers';
import Bullet from './Bullet';

export default class TrackingBullet extends  Bullet{
  constructor(args) {
    super(args)
    this.position = {
      x: args.ship.position.x,
      y: args.ship.position.y,
    };
   
    this.velocity = {
      x:args.velocity.x,
      y:args.velocity.y
    };
    this.radius = 2;
    
  }

}
