import './Cell.css'
import { useMemo } from 'react'
import { useGameStore } from '../stores/GameStore'
import { Direction, Position } from '../types'

/**
 * Using a fully store based approach for components. In other words, using only 
 * one prop for access to "model state" and other props only for component 
 * "view state" (actually none). Please note that I'm doing this just to show 
 * knowledge of centralized state management, but maybe I wouldn't (ab)use a 
 * store in real life.
 */
export type CellProps = {
    position: Position
    placing?: Direction | 'WALL'
    onRobotPlace: (position: Position, direction: Direction) => void
    onWallPlace: (position: Position) => void
}

const CELL_EMOJIS = {
    'ROBOT': '🤖',
    'WALL': '🧱',
}

export default function Cell(props: CellProps) {
    function pointerHandler() {
        if (!props.placing || content) { return }

        if (props.placing == 'WALL') {
            return props.onWallPlace(props.position)
        }
        props.onRobotPlace(props.position, props.placing)
    }

    const store = useGameStore()
    const content = store.getCellContent(props.position)

    const [cellEmoji, contentModifiers] = useMemo(()=>{
        if (!content) { return ['', 'cell--empty'] }

        let modifiers = `cell--${content.toLowerCase()}`
        if (content == 'ROBOT') {   // Direction modifier if robot
            modifiers += ` cell--${store.robotDirection!.toLowerCase()}`
        }

        return  [ CELL_EMOJIS[content],  modifiers ]
    }, [content, store.robotDirection])

    let placingModifier = ''
    if (props.placing && !content) {
        placingModifier = `cell--placing cell--${props.placing.toLowerCase()}`
    }

    return <div className={`cell ${contentModifiers} ${placingModifier}`}
        onPointerDown={pointerHandler}>
        {cellEmoji}
    </div>
}