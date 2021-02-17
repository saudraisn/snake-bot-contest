import { Position } from "./Types"

export const isEqual = (pos1: Position, pos2: Position) => {
  if((pos1 && !pos2) || (!pos1 && pos2)) {
    return false
  } else if (!pos1 && !pos2) {
    return true
  } else {
    return pos1.x === pos2.x && pos1.y === pos2.y
  }
}

export const getRandomPos = (W: number, H: number): Position => {
  return { x: randomInt(0, W - 1), y: randomInt(0, H - 1) }
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomElem(arr: any[]) {
  return arr[randomInt(0, arr.length - 1)]
}
