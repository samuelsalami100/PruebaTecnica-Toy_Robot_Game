import { create } from 'zustand'

type Position = {x: number, y: number}
type CellContent = 'ROBOT' | 'WALL'
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
    report: () => string | undefined
    placeRobot: (pos: Position, dir: Direction) => void
    reset: () => void
    getCellContent: (pos: Position)=> CellContent|undefined
    
    placeWall: (pos: Position) => void
    move: () => void
    /*left: () => void
    right: () => void*/
}

const DIR_VECTORS: Readonly<{[key in Direction]: Readonly<Position>}> = {
    'NORTH': {x: 0, y: 1},
    'EAST': {x: 1, y: 0},
    'SOUTH': {x: 0, y: -1},
    'WEST': {x: -1, y: 0}
}

export type GameStore = GameState & GameOperations

const isValidCoord = ({x,y}: Position)=>{
    return x >= 1 && y >= 1 && x <= 5 && y <= 5
}

export const useGameStore = create<GameStore>()((set,get) => {
    return {
        ...initialState,
        placeRobot: (pos, dir)=>{
            if (!isValidCoord(pos)) { return }

            const state = get()
            if (state.getCellContent(pos)) { return }

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
        report: () => { 
            const state = get()
            const pos = state.robotPosition
            if (!pos) { return }

            return `${pos.x},${pos.y},${state.robotDirection}`
        },

        reset: () => {
            set(initialState)
        },

        getCellContent: (pos) => {
            return get().board[pos.y-1][pos.x-1]
        },
        placeWall: (pos) => {
            if ( !isValidCoord(pos) ) { return }
            
            if (get().getCellContent(pos)) { return }
            
            set((oldState)=>{
                const newBoard = structuredClone(oldState.board)
                newBoard[pos.y-1][pos.x-1] = 'WALL'
                
                return {
                    board: newBoard
                }
            })
        },
        move() {
            const state = get()
            if (!state.robotPosition) { return }
            
            const dirVector = DIR_VECTORS[state.robotDirection!]
            state.placeRobot({
                x: state.robotPosition.x + dirVector.x,
                y: state.robotPosition.y + dirVector.y
            }, this.robotDirection!)
        }
    }
})