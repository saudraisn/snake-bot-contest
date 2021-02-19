import { Component, OnDestroy, OnInit } from '@angular/core';
import { last, cloneDeep, shuffle } from 'lodash'
import { getRandomPos, isEqual } from './helpers';
import { DummyPlayer } from './Player';
import { compileTs } from './TsCompile';
import { Direction, GameMove, GameState, GridCell, Position } from './Types';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snake bot competition';

  W = 25
  H = 25
  NbPlayers = 4;

  players = [new DummyPlayer(), new DummyPlayer(), new DummyPlayer(), new DummyPlayer()]
  moves: GameMove[] = []
  gameOver = false
  game: GameState = {
    W: this.W,
    H: this.H,
    snakes: [],
    apples: []
  }

  fullGame: GameState[] = []

  grid: GridCell[][] = []
  interval: number;
  command: Direction;

  gameLoop() {
    if (this.gameOver) {
      return true
    }

    // const moves = this.players.map(p => )

    // Bypass with manual mode
    // moves[0].move = this.commands


    // TODO: this is buggy, the order of execution causes some snakes to have an advantage over others
    // Here's how it should be done :
    // 1) move evaluation/fetching
    // Move validity analysis
    // 2) valid moves execution
    // 3) death detection
    // 4) apple eating
    // Points calculation in between for all steps

    this.players.forEach((player) => {
      const move = player.nextStep(cloneDeep(this.game))

      if (!move) {
        // TODO: Kill snake, because he didn't return a valid move.
        return
      }

      const snake = this.game.snakes.find(s => s.id === player.id)
      const command = move.move
      if (!snake.isAlive) {
        return
      }

      const head = last(snake.body)
      const pos = this.getNextPos(head, command)

      if (this.applesContain(pos)) {
        // snake eats an apple, do not remove one block
        snake.body.push(pos)
        this.game.apples = this.game.apples.filter(a => !isEqual(a, pos))
        snake.score += 10 + 1
      }
      else if (this.validadePos(pos)) {
        snake.body.push(pos)
        snake.body.shift()
        snake.score++
      } else {
        console.log('GAME LOST for snake : ', snake.id)
        // this.gameOver = true
        // snake.body=[]
        snake.isAlive = false
        // TODO: End game if no more snake are alive
        
      }
    })

    this.fullGame.push(cloneDeep(this.game))
    console.log('Game length', this.fullGame.length)

    //Game rendering
    this.render()
  }

  getNextPos(pos: Position, command: Direction) {
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
    if (reinitPlayers) {
      this.players = [new DummyPlayer('p1', 'deepskyblue'), new DummyPlayer('p2', 'crimson'), new DummyPlayer('p3', 'mediumaquamarine'), new DummyPlayer('p4', 'gold')]
    }
    this.fullGame = []
    this.game.snakes = []
    this.game.apples = []

    const snakeBodies = [
      [{ x: 12, y: 0 }, { x: 12, y: 1 }, { x: 12, y: 2 }, { x: 12, y: 3 }, { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }],
      [{ x: 24, y: 12 }, { x: 23, y: 12 }, { x: 22, y: 12 }, { x: 21, y: 12 }, { x: 20, y: 12 }, { x: 19, y: 12 }, { x: 18, y: 12 }],
      [{ x: 12, y: 24 }, { x: 12, y: 23 }, { x: 12, y: 22 }, { x: 12, y: 21 }, { x: 12, y: 20 }, { x: 12, y: 19 }, { x: 12, y: 18 }],
      [{ x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }],
    ]

    this.players.forEach((p, i) => {
      this.game.snakes.push({ id: p.id, color: p.snakeColor, isAlive: true, body: snakeBodies[i], score: 0, teamName: p.teamName, teamLogo: '' })
    })

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

    if (!pos) {
      return false
    }

    if (pos.x < 0 || pos.y < 0 || pos.x >= this.W || pos.y >= this.H) {
      console.log('HIT A WALL!')
      return false
    }

    if (this.snakesContain(pos)) {
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
      if (!snake.isAlive) {
        this.grid[head.x][head.y] = {
          color: snake.color,
          img: 'https://image.flaticon.com/icons/png/512/2027/2027275.png'
        }
      } else {
        this.grid[head.x][head.y] = {
          color: snake.color,
          img: 'https://image.flaticon.com/icons/png/512/25/25361.png'
        }
      }
    })

    this.game.apples.forEach(apple => {
      this.grid[apple.x][apple.y] = { img: 'https://i.pinimg.com/originals/17/b0/28/17b02860355b8ee475d8d2190fee7e83.png' }
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

  loadPlayer(e, playerIndex: number) {
    const file = e.target.files[0];
    if (file) {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileContent = fileReader.result as string
        // console.log(fileReader.result);
        // console.log('TS: ')
        let compiled = compileTs(fileContent)
        const loadedPlayer = eval(compiled)

        console.log('Loaded player: ', loadedPlayer)
        this.players[playerIndex] = loadedPlayer
        this.players[playerIndex].id = `p${playerIndex + 1}`
      }
      fileReader.readAsText(file);
    } else {
      console.log('New dummy player')
      this.players[playerIndex] = new DummyPlayer()
      this.players[playerIndex].id = this.game.snakes[playerIndex].id
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }
}
