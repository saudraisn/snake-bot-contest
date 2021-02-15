import { Component, OnDestroy, OnInit } from '@angular/core';
import { last } from 'lodash'

type Direction = 'LEFT' | 'RIGHT' | 'DOWN' | 'UP'

interface GridCell {
  color?: string
  img?: string
}

interface Position {
  x: number
  y: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snake';

  W = 25
  H = 25

  interval: number

  snake: Position[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },{ x: 4, y: 0 },{ x: 5, y: 0 },{ x:6, y: 0 }]
  command: Direction = 'RIGHT'

  grid: GridCell[][] = []

  gameLoop() {
    // Game iteration logic
    const head = last(this.snake)
    switch (this.command) {
      case 'UP':
        this.snake.push({ x: head.x, y: head.y - 1 })
        break
      case 'DOWN':
        this.snake.push({ x: head.x, y: head.y + 1 })
        break
      case 'LEFT':
        this.snake.push({ x: head.x - 1, y: head.y })
        break
      case 'RIGHT':
        this.snake.push({ x: head.x + 1, y: head.y })
        break
      default:
        break
    }
    this.snake.shift()

    //Game rendering
    this.render()
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

    this.snake.forEach(pos => {
      this.grid[pos.x][pos.y] = {
        color: 'green'
      }
    })
  }

  ngOnInit() {
    this.interval = setInterval(this.gameLoop.bind(this), 200)
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
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }
}
