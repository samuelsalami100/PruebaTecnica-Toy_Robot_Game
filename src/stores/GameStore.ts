import { create } from 'zustand'

type Position = {x: number, y: number}
type CellContent = 'ROBOT'|'WALL'
type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST'

interface GameState {
    robotPosition: Position | undefined,
    robotDirection: Direction | undefined,
    board: (CellContent|undefined)[][]
}

const initialState: GameState = {
    robotPosition: undefined,
    robotDirection: undefined,
    board: Array.from(new Array(5), ()=>new Array(5))
}

interface GameOperations {
    report: () => string
    placeRobot: (pos: Position, dir: Direction) => void
    reset: () => void
    getCellContent: (pos: Position)=> CellContent|undefined/*
    
    placeWall: (pos: Position) => void
    move: () => void
    left: () => void
    right: () => void*/
}

export type GameStore = GameState & GameOperations

export const useGameStore = create<GameStore>()((set,get) => {
    return {
        ...initialState,
        placeRobot: (pos, dir)=>{
            set((oldState)=>{
                const newBoard = structuredClone(oldState.board)
                const oldPos = oldState.robotPosition
                if (oldPos) {
                    newBoard[oldPos.y-1][oldPos.x-1] = undefined
                }

                newBoard[pos.y-1][pos.x-1] = 'ROBOT'
                return {
                    board: newBoard,
                    robotPosition: pos,
                    robotDirection: dir
                }
            })
        },
        report: () => { return 'TODO' },
        reset: () => {},
        getCellContent: (pos) => {
            return get().board[pos.y-1][pos.x-1]
        }
    }
})