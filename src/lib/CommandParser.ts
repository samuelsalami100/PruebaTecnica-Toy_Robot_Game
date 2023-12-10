import { Commands, Direction } from '@/types'

/**
 * Transform a params string array to expected param object or undefined
 */
const paramsParsers: {[C in keyof Commands]: (params: string[])=>Commands[C]} = {
    PLACE_ROBOT: ([x,y,dir])=>{
        x = x.trim()
        y = y.trim()
        dir = dir.trim().toUpperCase()
        return {
            position: {x:+x, y:+y}, 
            direction: dir as Direction
        }
    },
    PLACE_WALL: ([x,y])=>({position: {x:+x.trim(), y:+y.trim()}}),
    MOVE: ()=>{},
    RIGHT: ()=>{},
    LEFT: ()=>{},
    REPORT: ()=>{},
}


const paramsEncoder: {[C in keyof Commands]: (params: Commands[C])=>string} = {
    PLACE_ROBOT: ({position,direction})=>{
        return `${position.x},${position.y},${direction}`
    },
    PLACE_WALL: ({position})=>`${position.x},${position.y}`,
    MOVE: ()=>'',
    RIGHT: ()=>'',
    LEFT: ()=>'',
    REPORT: ()=>'',
}

export function encodeCommand<T extends keyof Commands>( 
    name: T, params: Commands[T]
) {
    return (name + ' ' + paramsEncoder[name](params)).trim()
}

export function parseCommand(commandString: string) {
    const withoutDuplicatedSpaces = 
        commandString.trim().replace(/ +/g, ' ').toUpperCase()

    const firstSpacePos = withoutDuplicatedSpaces.indexOf(' ')     
    if (firstSpacePos == -1) {             //    name              paramsString    
        return {                           //       ↪ __________  ___ ↩
            params: undefined,             //         "PLACE_WALL 1,2"
            name:  withoutDuplicatedSpaces as keyof Commands //  ⬆
        }                                                    // firstSpacePos
    }                                         
    const paramsString = withoutDuplicatedSpaces.substring(firstSpacePos+1)

    const name = 
        withoutDuplicatedSpaces.substring(0, firstSpacePos) as keyof Commands

    const paramsStringArray = paramsString.replace(/ +/,'').split(',')
    
    const params = paramsParsers[name](paramsStringArray)
    return {name, params}
}
