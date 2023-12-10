export type Position = {x: number, y: number}
export type CellContent = 'ROBOT' | 'WALL'
export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST'

export interface Commands { // name: params
    'PLACE_ROBOT': {position: Position, direction: Direction},
    'PLACE_WALL': {position: Position},
    'MOVE': undefined,
    'RIGHT': undefined,
    'LEFT': undefined,
    'REPORT': undefined
}

export type Message = {
    text: string,
    command: keyof Commands
}