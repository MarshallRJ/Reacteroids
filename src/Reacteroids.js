import React, { Component } from 'react';
import Ship from './Ship';
import Asteroid from './Asteroid';
import { randomNumBetweenExcluding } from './helpers'

const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const commandKey = isAppleDevice ? 'cmd' : 'ctrl';

const shortcuts = [
  { description: "Save file", shortcut: `${commandKey}+s` },
  { description: "Copy", shortcut: `c+${commandKey}` },
  { description: "Paste", shortcut: `${commandKey}+v` },
  { description: "Undo", shortcut: `${commandKey}+z` },
  { description: "Redo", shortcut: isAppleDevice ? `${commandKey}+shift+z` : `${commandKey}+y` },
  { description: "Find", shortcut: `${commandKey}+f` },
  { description: "Cut", shortcut: `${commandKey}+x` },
  { description: "Select All", shortcut: `a+${commandKey}` },
  //{ description: "New File", shortcut: `${commandKey}+n` },
  //{ description: "Close Tab", shortcut: `${commandKey}+w` },
];

const getShortCut = ()=>{
  //return shortcuts[];
  const newShortcut = shortcuts[Math.floor(Math.random() * shortcuts.length)];
  return newShortcut;
} 



const KEY = {
  LEFT:  37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
  X: 88
};

export class Reacteroids extends Component {
  constructor() {
    super();
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys : {
        left  : 0,
        right : 0,
        up    : 0,
        down  : 0,
        space : 0,
        x: 0,
      },
      currentKeys: new Set(),
      asteroidCount: 3,
      currentScore: 0,
      topScore: localStorage['topscore'] || 0,
      inGame: false,
      astroidPostion: {x:0,y:0},
      astroidVelocity: {x:0,y:0},
      hitCounts: {},
    }
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
    this.backgroundImage = new Image();
  }

  handleResize(value, e){
    this.setState({
      screen : {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleKeyDown(e) {
    let prev = this.state.currentKeys;
    
    const key = e.key.toLowerCase();


    let currentKeys = new Set(prev);
    if (key === 'meta' || key === 'control') {
      currentKeys.add(commandKey);
      
    } else if (key !== 'shift') {
      currentKeys.add(key);
    }
    this.setState({currentKeys: currentKeys})
    
      return currentKeys;
  };

  handleKeyUp(e) {
   
    let prev = this.state.currentKeys;
    const key = e.key.toLowerCase();
    let currentKeys = new Set(prev);
    if (key === 'meta' || key === 'control') {
      currentKeys.delete(commandKey);
      
    } else {
      currentKeys.delete(key);
      
    }
    this.setState({currentKeys: currentKeys})
    return currentKeys;

  };

  handleKeys(value, e){
    e.preventDefault();
    let currentKeys;
    if (value)
      currentKeys = this.handleKeyDown(e);
    else
      currentKeys =this.handleKeyUp(e);

    let keys = this.state.keys;

    let ship = this.ship[0];
    if (ship){
      let asteroid = this.findMatchingAstroid(ship, currentKeys);
      if (asteroid) {
        keys.x = true;
        keys.space = true;
      }
      else
      {
        keys.x = false;
        keys.space = false;
      }

    }

    
    // if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
    // if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
    // if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
    // if(e.keyCode === KEY.SPACE) keys.space = value;
    // if(e.keyCode === KEY.X) keys.x = value;
    this.setState({
      keys : keys
    });
  }

  getLevel = (shortcut)=>{
    let level = this.state.hitCounts[shortcut]
    return level ? level :0;
  } 

  componentDidMount() {
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize',  this.handleResize.bind(this, false));

    const context = this.refs.canvas.getContext('2d');
    this.setState({ context: context });
    this.startGame();
    requestAnimationFrame(() => {this.update()});

    this.backgroundImage.src = 'https://img.freepik.com/premium-photo/glowing-spaceship-orbits-planet-starry-galaxy-generated-by-ai_1038396-45.jpg'
;
// Update with the actual path to your image
  
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeys);
    window.removeEventListener('keydown', this.handleKeys);
    window.removeEventListener('resize', this.handleResize);
  }

  update() {
    const context = this.state.context;
    const keys = this.state.keys;
    const ship = this.ship[0];

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

     // Draw background image
     context.globalAlpha = 0.4;
     context.drawImage(this.backgroundImage, 0, 0, this.state.screen.width, this.state.screen.height);
     context.globalAlpha = 1;

    // Next set of asteroids
    if(!this.asteroids.length){
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count)
    }

    //set astroid pos
    // if (ship)
    //   this.findMatchingAstroid(ship);

    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.ship, this.asteroids);

    // Remove or render
    this.updateObjects(this.particles, 'particles')
    this.updateObjects(this.asteroids, 'asteroids')
    this.updateObjects(this.bullets, 'bullets')
    this.updateObjects(this.ship, 'ship')

    context.restore();

    // Next frame
    requestAnimationFrame(() => {this.update()});
  }

  addScore(points, shortcut){
    if(this.state.inGame){

      var hitCounts = this.state.hitCounts;
      if (hitCounts[shortcut.shortcut])
        hitCounts[shortcut.shortcut]++;
      else
        hitCounts[shortcut.shortcut] = 1;
      this.setState({
        currentScore: this.state.currentScore + points,
      });
    }
  }

  startGame(){
    this.setState({
      inGame: true,
      currentScore: 0,
    });

    // Make ship
    let ship = new Ship({
      position: {
        x: this.state.screen.width/2,
        y: this.state.screen.height/2
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this)
    });
    this.createObject(ship, 'ship');

    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.state.asteroidCount)
  }

  gameOver(){
    this.setState({
      inGame: false,
    });

    // Replace top score
    if(this.state.currentScore > this.state.topScore){
      this.setState({
        topScore: this.state.currentScore,
      });
      localStorage['topscore'] = this.state.currentScore;
    }
  }

  generateAsteroids(howMany){
    let asteroids = [];
    let ship = this.ship[0];
    for (let i = 0; i < howMany; i++) {
      let shortcut = getShortCut();
      let level = this.getLevel(shortcut.shortcut);
      let asteroid = new Asteroid({
        size: 80,
        position: {
          x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x-60, ship.position.x+60),
          y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y-60, ship.position.y+60)
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this),
        shortcut,
        level
        
      });
 
      console.log('level',asteroid.level)
      this.createObject(asteroid, 'asteroids');
    }
  }

  calculateDistance(position1, position2) {
    // Calculate the differences
    const dx = position2.x - position1.x;
    const dy = position2.y - position1.y;
  
    // Calculate the distance using the Pythagorean theorem
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    // Return the distance
    return distance;
  }

  findMatchingAstroid(ship,currentKeys){

    
    const pressedKeys = Array.from(currentKeys).sort().join('+');
    
    const asteroid = this.asteroids.find((b) => {
      
      return b.shortcut.shortcut === pressedKeys});
    
    
   
    if (asteroid)
    {
      this.setState({astroidPostion: asteroid.position, astroidVelocity: asteroid.velocity});
    }
    else
      this.setState({astroidPostion: null, astroidVelocity: null})

    return asteroid;
  }

  createObject(item, group){
    this[group].push(item);
  }

  updateObjects(items, group){
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      }else{
        items[index].render(this.state);
      }
      index++;
    }
  }

  checkCollisionsWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for(a; a > -1; --a){
      b = items2.length - 1;
      for(b; b > -1; --b){
        var item1 = items1[a];
        var item2 = items2[b];
        if(this.checkCollision(item1, item2)){
          item1.destroy();
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1, obj2){
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if(length < obj1.radius + obj2.radius){
      return true;
    }
    return false;
  }

  render() {
    let endgame;
    let message;

    if (this.state.currentScore <= 0) {
      message = '0 points... So sad.';
    } else if (this.state.currentScore >= this.state.topScore){
      message = 'Top score with ' + this.state.currentScore + ' points. Woo!';
    } else {
      message = this.state.currentScore + ' Points though :)'
    }

    if(!this.state.inGame){
      endgame = (
        <div className="endgame">
          <p>Game over, man!</p>
          <p>{message}</p>
          <button
            onClick={ this.startGame.bind(this) }>
            try again?
          </button>
        </div>
      )
    }

    return (
      <div>
        { endgame }
        <span className="score current-score" >Score: {this.state.currentScore}</span>
        <span className="score top-score" >Top Score: {this.state.topScore}</span>
        <span className="controls" >
          Use [A][S][W][D] or [←][↑][↓][→] to MOVE<br/>
          Use [SPACE] to SHOOT
        </span>
        <canvas ref="canvas"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />
      </div>
    );
  }
}
