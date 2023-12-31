import { create } from 'zustand'
import { Position, Direction, CellContent, Commands } from '../types'
import { parseCommand } from '@/lib/CommandParser'

type HistoryEntry = {
    name: keyof Commands, 
    params: Commands[keyof Commands],
    result?: string
}
interface GameState {
    robotPosition: Position | undefined,
    robotDirection: Direction | undefined,
    board: (CellContent|undefined)[][],
    history: HistoryEntry[]
}

const initialState: GameState = {
    robotPosition: undefined,
    robotDirection: undefined,
    board: Array.from(new Array(5), ()=>new Array(5)),
    history: []
}



interface GameOperations {
    command: <T extends keyof Commands>(command: T, params?: Commands[T]) => void
    commandString: (commandString: string) => void,
    
    report: () => string | undefined
    placeRobot: (pos: Position, dir: Direction) => void
    reset: () => void
    getCellContent: (pos: Position)=> CellContent|undefined
    
    placeWall: (pos: Position) => void
    move: () => void
    rotate90: (toThe: 'RIGHT' | 'LEFT') => void

    /** alias of rotate90('LEFT') */
    left: () => void
    /** alias of rotate90('RIGHT') */
    right: () => void
}
 
/** Clockwise ordered directions */
const DIRECTIONS: Readonly<Direction[]> = ['NORTH', 'EAST', 'SOUTH', 'WEST']

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
    // command layer
    const behaviors: {[C in keyof Commands]: (params?: Commands[C]) => void} = {
        PLACE_ROBOT: (params) => {
            const {position, direction} = params!
            get().placeRobot(position, direction)
        },
        PLACE_WALL: (params)=>{ 
            get().placeWall(params!.position) 
        },
        REPORT: ()=>{ get().report() },
        RIGHT: ()=>{ get().right()},
        MOVE: ()=>{ get().move() },
        LEFT: ()=>{ get().left() }
    }

    function command<T extends keyof Commands>(
        command: T, params?: Commands[T]) {
        const current = get()
        try { 
            behaviors[command](params) 
        } catch (e) { 
            console.log('Ignored not valid command: ' + command)
            return
        }
        const histEntry: HistoryEntry = {name: command, params}
        
        if (command == 'REPORT' && current.robotPosition) {
            const {x,y} = current.robotPosition
            histEntry.result = `${x},${y},${current.robotDirection}`
        }

        set({ history: [
            ...current.history, 
            histEntry
        ]})
    }

    return {
        ...initialState,
        command,
        commandString: (commandString: string) => {
            const {name, params} = parseCommand(commandString)
            command(name, params)
        },
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

        // ignore rule until implementation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        rotate90(toThe: 'RIGHT' | 'LEFT') {
            const state = get()
            if (!state.robotDirection) { return }

            let directionIndex = DIRECTIONS.indexOf(state.robotDirection)
            directionIndex += (toThe == 'RIGHT' ? 1 : -1)
            if (directionIndex == -1) { directionIndex = 3 }
            else { directionIndex = directionIndex % 4}

            set({
                robotDirection: DIRECTIONS[directionIndex]
            })
        },
        right() { get().rotate90('RIGHT') },
        left() { get().rotate90('LEFT') },

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
            const targetPosition = {
                x: state.robotPosition.x + dirVector.x,
                y: state.robotPosition.y + dirVector.y
            }

            // warps
            if (targetPosition.x > 5) { targetPosition.x = 1 }
            else if (targetPosition.x < 1) { targetPosition.x = 5 }

            if (targetPosition.y > 5) { targetPosition.y = 1 }
            else if (targetPosition.y < 1) { targetPosition.y = 5 }

            state.placeRobot(targetPosition, this.robotDirection!)
        }
    }
})