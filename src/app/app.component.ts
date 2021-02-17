import { Component, OnDestroy, OnInit } from '@angular/core';
import { last, cloneDeep } from 'lodash'
import { getRandomPos, isEqual } from './helpers';
import { Player } from './Player';
import { Direction, GameMove, GameState, GridCell, Position } from './Types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snake';

  W = 25
  H = 25
  NbPlayers = 4;

  players = [new Player(), new Player()]
  moves: GameMove[] = []
  gameOver = false
  game: GameState = {
    W: this.W,
    H: this.H,
    snakes: [],
    apples: []
  }

  grid: GridCell[][] = []
  interval: number;
  command: Direction;

  gameLoop() {
    if (this.gameOver) {
      return true
    }

    const moves = this.players.map(p => p.nextStep(cloneDeep(this.game)))

    // Bypass with manual mode
    // moves[0].move = this.commands

    moves.forEach((move, index) => {
      if (!move) {
        // TODO: Kill snake, because he didn't return a valid move.
        return
      }

      const snake = this.game.snakes[index]
      const command = move.move
      if (!snake.isAlive) {
        return
      }

      const head = last(snake.body)
      const pos = this.getNextPos(head, command)

      if(this.applesContain(pos)) {
        // snake eats an apple, do not remove one block
        snake.body.push(pos)
        this.game.apples = this.game.apples.filter(a => !isEqual(a, pos))
      }
      else if (this.validadePos(pos)) {
        snake.body.push(pos)
        snake.body.shift()
      } else {
        console.log('GAME LOST for snake : ', snake.id)
        // this.gameOver = true
        // snake.body=[]
        snake.isAlive = false
      }
    })

    //Game rendering
    this.render()
  }

  getNextPos(pos:Position, command:Direction) {
    switch (command) {
      case 'UP':
        return { x: pos.x, y: pos.y - 1 }
      case 'DOWN':
        return { x: pos.x, y: pos.y + 1 }
      case 'LEFT':
        return { x: pos.x - 1, y: pos.y }
      case 'RIGHT':
        return { x: pos.x + 1, y: pos.y }
      default:
        return null
    }
  }

  reset(reinitPlayers = false) {
    this.game.snakes = []
    this.game.apples = []
    this.game.snakes.push({ id: 'p1', color: 'cyan', isAlive: true, body: [{ x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }] })
    this.game.snakes.push({ id: 'p2', color: 'pink', isAlive: true, body: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }] })

    if(reinitPlayers) {
      this.players = [new Player(), new Player()]
      this.players[0].init('p1')
      this.players[1].init('p2')
    }

    this.seedRandomApples(25)
    // this.snake = []
    // this.command = 'RIGHT'
    this.gameOver = false
    this.render()
  }

  seedRandomApples(amount: number) {

    let i = 0

    while (i < amount) {
      const pos = getRandomPos(this.game.W, this.game.H)
      if (!this.snakesContain(pos) && !this.applesContain(pos)) {
        this.game.apples.push(pos)
        i++
      }
    }
  }

  snakesContain(pos: Position) {
    return this.game.snakes.some(snake => snake.body.some(p => isEqual(p, pos)))
  }

  applesContain(pos: Position) {
    return this.game.apples.some(apple => isEqual(apple, pos))
  }

  validadePos(pos: Position) {

    let valid = true

    if(!pos) {
      return false
    }

    if (pos.x < 0 || pos.y < 0 || pos.x >= this.W || pos.y >= this.H) {
      console.log('HIT A WALL!')
      return false
    }

    if(this.snakesContain(pos)) {
      console.log('Hit a snake')
      return false
    }


    // if (this.snake.some(p => isEqual(p, pos))) {
    //   console.log('Hit itself.')
    //   return false
    // }

    return valid
  }

  render() {
    // console.log('Render')
    let g: GridCell[][] = [];
    for (let i = 0; i < this.W; i++) {
      g[i] = [];
      for (let j = 0; j < this.H; j++) {
        g[i][j] = {};
      }
    }
    this.grid = g

    this.game.snakes.forEach(snake => {
      snake.body.forEach(pos => {
        this.grid[pos.x][pos.y] = {
          color: snake.color
        }
      })

      const head = last(snake.body)
      if(!snake.isAlive) {
        this.grid[head.x][head.y] = {
          color : snake.color,
          img : 'https://image.flaticon.com/icons/png/512/2027/2027275.png'
        }
      } else {
        this.grid[head.x][head.y] = {
          color : snake.color,
          img : 'https://image.flaticon.com/icons/png/512/25/25361.png'
        }
      }
    })

    this.game.apples.forEach(apple => {
      this.grid[apple.x][apple.y] = { color: 'red' }
    })
  }

  play() {
    window.clearInterval(this.interval)
    this.interval = window.setInterval(this.gameLoop.bind(this), 200)
  }

  stop() {
    window.clearInterval(this.interval)
  }

  ngOnInit() {

    // // FOR live player
    document.addEventListener('keydown', e => {
      console.log('PRESSED : ', e.key)
      switch (e.key) {
        case 'ArrowUp':
          this.command = 'UP'
          break
        case 'ArrowDown':
          this.command = 'DOWN'
          break
        case 'ArrowLeft':
          this.command = 'LEFT'
          break
        case 'ArrowRight':
          this.command = 'RIGHT'
          break
        default:
          break
      }
    })
    this.reset(true)
  }

  loadPlayer(e, playerIndex:number) {
      const file = e.target.files[0];
      if(file) {
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
          console.log(fileReader.result);
  
          const p1 = eval(fileReader.result as string)
          console.log('Loaded player: ', p1)
          this.players[playerIndex] = p1
          this.players[playerIndex].id = this.game.snakes[playerIndex].id
        }
        fileReader.readAsText(file);
      } else {
        console.log('New dummy player')
        this.players[playerIndex] = new Player()
        this.players[playerIndex].id = this.game.snakes[playerIndex].id
      }
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }
}
