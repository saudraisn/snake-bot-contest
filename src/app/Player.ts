import { last } from "lodash";
import { isEqual } from "./helpers";
import { GameState, GameMove, PlayerInfo, Position } from "./Types";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElem(arr: any[]) {
  return arr[randomInt(0, arr.length - 1)]
}

export class Player {
  id
  // A player is being passed a unique Id at the beginning of the game
  init(id: string): PlayerInfo {
    this.id = id
    return null
  }

  nextStep(game: GameState): GameMove {

    const snake = game.snakes.find(s => s.id === this.id)
    const head = last(snake.body)

    const up = { x: head.x, y: head.y - 1 }
    const down = { x: head.x, y: head.y + 1 }
    const left = { x: head.x - 1, y: head.y }
    const right = { x: head.x + 1, y: head.y }

    let possibleMoves: GameMove[] = []

    if (this.validatePos(up, game)) {
      possibleMoves.push({ move: 'UP' })
    }
    if (this.validatePos(down, game)) {
      possibleMoves.push({ move: 'DOWN' })
    }
    if (this.validatePos(left, game)) {
      possibleMoves.push({ move: 'LEFT' })
    }
    if (this.validatePos(right, game)) {
      possibleMoves.push({ move: 'RIGHT' })
    }
    return randomElem(possibleMoves)
  }

  validatePos(pos: Position, game: GameState) {

    let valid = true

    if(pos.x < 0 || pos.y < 0 || pos.x >= game.W || pos.y >= game.H) {
      return false
    }

    game.snakes.forEach(s => {
      s.body.forEach(p => {
        if (isEqual(pos, p)) {
          valid = false
        }
      })
    })

    return valid

  }
}
