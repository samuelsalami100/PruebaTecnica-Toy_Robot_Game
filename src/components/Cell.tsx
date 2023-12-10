import './Cell.css'
import { useMemo } from 'react'
import { useGameStore } from '../stores/GameStore'
import { Position } from '../types'

/**
 * Using a fully store based approach for components. In other words, using only 
 * one prop for access to "model state" and other props only for component 
 * "view state" (actually none). Please note that I'm doing this just to show 
 * knowledge of centralized state management, but maybe I wouldn't (ab)use a 
 * store in real life.
 */
type CellProps = {
    position: Position
}

const CELL_EMOJIS = {
    'ROBOT': '🤖',
    'WALL': '🧱',
}

export default function Cell(props: CellProps) {
    const store = useGameStore()
    const content = store.getCellContent(props.position)
    
    // updates only when content change
    const [cellEmoji, cellClassModifier] = useMemo(()=>{
        if (!content) { return ['', ''] }

        let modifiers = `cell--${content.toLowerCase()}`
        if (content == 'ROBOT') {
            modifiers += ` cell--${store.robotDirection!.toLowerCase()}`
        }

        return  [ CELL_EMOJIS[content],  modifiers ]
    }, [content, store.robotDirection])
    

    return <div className={`cell ${cellClassModifier}`}>{cellEmoji}</div>
}