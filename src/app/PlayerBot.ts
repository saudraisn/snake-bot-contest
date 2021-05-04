import { cloneDeep, last } from "lodash";
import { isEqual, randomElem, randomInt } from "./helpers";
import { GameState, GameMove, PlayerInfo, Position } from "./Types";

function pos(x: number, y: number): Position {
  return { x, y }
}
export class PlayerBot implements PlayerInfo {
  teamLogo?: string = ''
  deadImg?: string;
  game: GameState;

  constructor(public id = 'p1', public snakeColor = 'aquamarine', public teamName: string = 'Dummy Player') {

  }

  nextStep(game: GameState): GameMove {
    this.game = game

    const snake = game.snakes.find(s => s.id === this.id)
    const head = last(snake.body)

    const up = { x: head.x, y: head.y - 1 }
    const down = { x: head.x, y: head.y + 1 }
    const left = { x: head.x - 1, y: head.y }
    const right = { x: head.x + 1, y: head.y }

    let possibleMoves: GameMove[] = []

    if (this.validatePos(up)) {
      possibleMoves.push({ move: 'UP' })
    }
    if (this.validatePos(left)) {
      possibleMoves.push({ move: 'LEFT' })
    }
    if (this.validatePos(down)) {
      possibleMoves.push({ move: 'DOWN' })
    }
    if (this.validatePos(right)) {
      possibleMoves.push({ move: 'RIGHT' })
    }



    return {
      ...(randomElem(possibleMoves) || { move: 'RIGHT' }),
      banana: snake.bananasLeft ? this.getRandomEmptyCell() : undefined
    }
  }

  getRandomEmptyCell() {
    let result = pos(randomInt(0, this.game.W - 1), randomInt(0, this.game.H - 1))

    while (!this.validatePos(result, true)) {
      result = this.incrementPosition(result)
    }

    return result
  }

  incrementPosition(pos: Position): Position {
    let result: Position = cloneDeep(pos)

    if (pos.x < (this.game.W - 1)) {
      result.x++
      return result
    } else {
      result.x = 0
      if (pos.y < (this.game.H - 1)) {
        result.y++
      } else {
        result.y = 0
      }
    }

    return result
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

  validatePos(pos: Position, checkFruits = false) {

    let valid = true

    if (!pos) {
      return false
    }

    if (pos.x < 0 || pos.y < 0 || pos.x >= this.game.W || pos.y >= this.game.H) {
      return false
    }

    if (this.snakesContain(pos)) {
      return false
    }

    if (this.wallsContain(pos)) {
      return false
    }

    if (checkFruits && (this.applesContain(pos))) {
      return false
    }

    return valid
  }

}
