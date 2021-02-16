import { Component, OnDestroy, OnInit } from '@angular/core';
import { last, cloneDeep } from 'lodash'
import { isEqual } from './helpers';
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
    snakes: []
  }

  grid: GridCell[][] = []
  interval: number;

  gameLoop() {
    if (this.gameOver) {
      return true
    }

    const moves = this.players.map(p => p.nextStep(cloneDeep(this.game)))

    moves.forEach((move, index) => {
      if(!move) {
        // TODO: Kill snake, because he didn't return a valid move.
        return
      }
      const snake = this.game.snakes[index]
      const command = move.move
      if(!snake.isAlive) {
        return
      }

      const head = last(snake.body)
      let pos
      switch (command) {
        case 'UP':
          pos = { x: head.x, y: head.y - 1 }
          break
        case 'DOWN':
          pos = { x: head.x, y: head.y + 1 }
          break
        case 'LEFT':
          pos = { x: head.x - 1, y: head.y }
          break
        case 'RIGHT':
          pos = { x: head.x + 1, y: head.y }
          break
        default:
          break
      }

      if (this.validadePos(pos)) {
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

  reset() {
    this.game.snakes = []
    this.game.snakes.push({ id: 'p1', color: 'blue', isAlive: true, body: [{ x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }] })
    this.game.snakes.push({ id: 'p2', color: 'purple', isAlive: true, body: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }] })

    this.players = [new Player(), new Player()]
    this.players[0].init('p1')
    this.players[1].init('p2')
    // this.snake = []
    // this.command = 'RIGHT'
    this.gameOver = false
    this.render()
  }

  validadePos(pos: Position) {

    let valid = true
    if (pos.x < 0 || pos.y < 0 || pos.x >= this.W || pos.y >= this.H) {
      console.log('HIT A WALL!')
      valid = false
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
    }
    )
  }

  play() {
    this.interval = window.setInterval(this.gameLoop.bind(this), 200)
  }

  stop() {
    window.clearInterval(this.interval)
  }

  ngOnInit() {

    // // FOR live player
    // document.addEventListener('keydown', e => {
    //   console.log('PRESSED : ', e.key)
    //   switch (e.key) {
    //     case 'ArrowUp':
    //       this.command = 'UP'
    //       break
    //     case 'ArrowDown':
    //       this.command = 'DOWN'
    //       break
    //     case 'ArrowLeft':
    //       this.command = 'LEFT'
    //       break
    //     case 'ArrowRight':
    //       this.command = 'RIGHT'
    //       break
    //     default:
    //       break
    //   }
    // })
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }
}
