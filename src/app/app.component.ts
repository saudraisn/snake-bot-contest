import { Component, OnDestroy, OnInit } from '@angular/core';
import { last, cloneDeep, shuffle } from 'lodash'
import { isEqual, randomInt } from './helpers';
import { PlayerBot } from './PlayerBot';
import { compileTs } from './TsCompile';
import { Direction, GameMove, GameState, GridCell, PlayerInfo, Position, Snake, Wall } from './Types';

function pos(x: number, y: number): Position {
  return { x, y }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snake bot competition';

  W = 27
  H = 27
  NbPlayers = 6;

  livesPerSnake = 3
  appleSeed = 50
  minApplesAmount = 15
  wallsPerSnake = 10
  pointsPerApple = 15
  pointsPerTurn = 0

  players: PlayerInfo[] = []
  moves: GameMove[] = []
  gameOver = false

  game: GameState = {
    W: this.W,
    H: this.H,
    snakes: [],
    apples: [],
    walls: []
  }

  fullGame: GameState[] = []

  grid: GridCell[][] = []
  gameLoopInterval: number;
  timeLeftInterval: number;
  timeLeft: number = 5 * 60
  command: Direction;


  distance(p1: Position, p2: Position) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)
  }

  isBeside(p1: Position, p2: Position) {
    return this.distance(p1, p2) === 1
  }

  isWallValid(w: Wall) {

    let valid = true

    if (w.length !== 2) {
      return false
    }

    w.forEach(pos => {
      if (!this.validadePos(pos, true)) {
        valid = false
      }
    })

    if (!this.isBeside(w[0], w[1])) {
      return false
    }

    return valid
  }

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
      const snake = this.game.snakes.find(s => s.id === player.id)

      if (!snake.isAlive) {
        return
      }

      let move: GameMove

      try {
        move = player.nextStep(cloneDeep(this.game))
      } catch (error) {
        console.error(`Error in nextStep function call for ${player.teamName} (${player.id})`, error)
      }

      // Player move validation
      if (!move) {
        this.killSnake(snake)
        return
      }

      if (move.placeWall) {
        const wall = move.placeWall
        if (snake.wallsLeft > 0 && this.isWallValid(wall)) {
          this.game.walls.push(wall)
          snake.wallsLeft--
        } else {
          this.killSnake(snake)
          return
        }
      }

      const command = move.move
      const head = last(snake.body)
      const pos = this.getNextPos(head, command)

      if (this.applesContain(pos)) {
        // snake eats an apple, do not remove one block
        snake.body.push(pos)
        this.game.apples = this.game.apples.filter(a => !isEqual(a, pos))

        snake.score += this.pointsPerApple + this.pointsPerTurn
      }
      else if (this.validadePos(pos)) {
        snake.body.push(pos)
        snake.body.shift()
        snake.score += this.pointsPerTurn
      } else {
        this.killSnake(snake)
        return
      }

      if (this.game.apples.length < this.minApplesAmount) {
        this.seedRandomApples(this.minApplesAmount - this.game.apples.length)
      }
    })

    // TODO: finish replay match feature
    // this.fullGame.push(cloneDeep(this.game))
    // console.log('Game length', this.fullGame.length)

    // stop the game when only one snake alive
    if (this.game.snakes.filter(s => s.isAlive).length === 1) {
      console.log('STOPPING GAME')
      this.stop()
      this.displayGameResults()
    }
    //Game rendering
    this.render()
  }

  killSnake(snake: Snake) {
    snake.isAlive = false
    snake.livesLeft--

    if (snake.livesLeft) {
      snake.isAlive = true
      snake.body = [this.getRandomEmptyCell()]
    } else {
      console.log(`Game lost for snake ${snake.id}`)
    }

    return snake
  }

  displayGameResults() {
    const snakes = cloneDeep(this.game.snakes).sort((a, b) => b.score - a.score)
    setTimeout(() => {
      alert(snakes.map((s, i) => `${i + 1} : ${s.teamName} (${s.score} pts.)\n`).join(''))
    }, 0);
  }

  getRandomEmptyCell() {
    let result = pos(randomInt(0, this.W - 1), randomInt(0, this.H - 1))

    while (!this.validadePos(result, true)) {
      result = this.incrementPosition(result)
    }

    return result
  }

  incrementPosition(pos: Position): Position {
    let result: Position = cloneDeep(pos)

    if (pos.x < (this.W - 1)) {
      result.x++
      return result
    } else {
      result.x = 0
      if (pos.y < (this.H - 1)) {
        result.y++
      } else {
        result.y = 0
      }
    }

    return result
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
      this.players = [
        new PlayerBot('p1', '#8c8c8c', 'Bot 1'),
        new PlayerBot('p2', 'crimson', 'Bot 2'),
        new PlayerBot('p3', '#0e9647', 'Bot 3'),
        new PlayerBot('p4', 'gold', 'Bot 4'),
        new PlayerBot('p5', '#1ec9c4', 'Bot 5'),
        new PlayerBot('p6', '#bf24b0', 'Bot 6'),
      ]
    }
    this.fullGame = []
    this.game.snakes = []
    this.game.apples = []
    this.game.walls = []
    this.timeLeft = 5 * 60

    const snakeBodies = [
      // 4 player game
      // [{ x: 12, y: 0 }, { x: 12, y: 1 }, { x: 12, y: 2 }, { x: 12, y: 3 }, { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }],
      // [{ x: 24, y: 12 }, { x: 23, y: 12 }, { x: 22, y: 12 }, { x: 21, y: 12 }, { x: 20, y: 12 }, { x: 19, y: 12 }, { x: 18, y: 12 }],
      // [{ x: 12, y: 24 }, { x: 12, y: 23 }, { x: 12, y: 22 }, { x: 12, y: 21 }, { x: 12, y: 20 }, { x: 12, y: 19 }, { x: 12, y: 18 }],
      // [{ x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }, { x: 3, y: 12 }, { x: 4, y: 12 }, { x: 5, y: 12 }, { x: 6, y: 12 }],
      // 6 player game
      [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }],
      [{ x: 13, y: 0 }, { x: 13, y: 1 }, { x: 13, y: 2 }, { x: 13, y: 3 }, { x: 13, y: 4 }, { x: 13, y: 5 }, { x: 13, y: 6 }],
      [{ x: 22, y: 0 }, { x: 22, y: 1 }, { x: 22, y: 2 }, { x: 22, y: 3 }, { x: 22, y: 4 }, { x: 22, y: 5 }, { x: 22, y: 6 }],
      [{ x: 4, y: 26 }, { x: 4, y: 25 }, { x: 4, y: 24 }, { x: 4, y: 23 }, { x: 4, y: 22 }, { x: 4, y: 21 }, { x: 4, y: 20 }],
      [{ x: 13, y: 26 }, { x: 13, y: 25 }, { x: 13, y: 24 }, { x: 13, y: 23 }, { x: 13, y: 22 }, { x: 13, y: 21 }, { x: 13, y: 20 }],
      [{ x: 22, y: 26 }, { x: 22, y: 25 }, { x: 22, y: 24 }, { x: 22, y: 23 }, { x: 22, y: 22 }, { x: 22, y: 21 }, { x: 22, y: 20 }],
    ]

    this.players.forEach((p, i) => {
      this.game.snakes.push({ id: p.id, color: p.snakeColor, isAlive: true, body: snakeBodies[i], score: 0, teamName: p.teamName, teamLogo: p.teamLogo, wallsLeft: this.wallsPerSnake, livesLeft: this.livesPerSnake })
    })

    this.seedRandomApples(this.appleSeed)
    // this.snake = []
    // this.command = 'RIGHT'
    this.gameOver = false
    this.render()
  }

  seedRandomApples(amount: number) {
    let i = 0

    while (i < amount) {
      const pos = this.getRandomEmptyCell()
      this.game.apples.push(pos)
      i++
    }
  }

  snakesContain(pos: Position) {
    return this.game.snakes.some(snake => snake.body.some(p => isEqual(p, pos)))
  }

  applesContain(pos: Position) {
    return this.game.apples.some(apple => isEqual(apple, pos))
  }

  wallsContain(pos: Position) {
    return this.game.walls.some(wall => wall.find(p => isEqual(pos, p)))
  }

  validadePos(pos: Position, checkApples = false) {

    let valid = true

    if (!pos) {
      return false
    }

    if (pos.x < 0 || pos.y < 0 || pos.x >= this.W || pos.y >= this.H) {
      return false
    }

    if (this.snakesContain(pos)) {
      return false
    }

    if (this.wallsContain(pos)) {
      return false
    }

    if (checkApples && this.applesContain(pos)) {
      return false
    }

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

    this.game.walls.forEach(wall => {
      wall.forEach(pos => {
        this.grid[pos.x][pos.y] = { img: 'https://www.glengery.com/sites/default/files/aa154a388db64dd66057a2ddd3850390.jpg' }
      })
    })
  }

  play() {
    window.clearInterval(this.gameLoopInterval)
    this.gameLoopInterval = window.setInterval(this.gameLoop.bind(this), 200)
    this.timeLeftInterval = window.setInterval(this.updateTime.bind(this), 1000)
  }

  updateTime() {
    this.timeLeft--
    if (this.timeLeft <= 0) {
      this.stop()
      this.displayGameResults()
    }
  }

  stop() {
    window.clearInterval(this.gameLoopInterval)
    window.clearInterval(this.timeLeftInterval)
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
        let compiled = compileTs(fileContent)
        const loadedPlayer: PlayerInfo = eval(compiled)

        console.log('Loaded player: ', loadedPlayer)
        this.players[playerIndex] = loadedPlayer
        this.players[playerIndex].id = `p${playerIndex + 1}`

        this.game.snakes[playerIndex].color = loadedPlayer.snakeColor
        this.game.snakes[playerIndex].teamName = loadedPlayer.teamName
        this.game.snakes[playerIndex].teamLogo = loadedPlayer.teamLogo
        this.render()
      }
      fileReader.readAsText(file);
    } else {
      console.log('New dummy player')
      this.players[playerIndex] = new PlayerBot()
      this.players[playerIndex].id = this.game.snakes[playerIndex].id
    }
  }

  ngOnDestroy() {
    clearInterval(this.gameLoopInterval)
    clearInterval(this.timeLeftInterval)
  }
}
