// I really prefer not to use CSS-in-JS and avoid direct styling in component
// definition as much as possible in favor of standard CSS. It's just a personal
// preference, I have no problem working in other ways though.
import './Board.css' // NOTE: using BEM methodology/convention

import { useGameStore } from '../stores/GameStore'
import Cell from './Cell'

export default function Board() {
    const gameStore = useGameStore()

    const height = gameStore.board.length
    const width = gameStore.board[0].length

    const cells: JSX.Element[] = []
    for(let row = height; row > 0; row--) {
        for(let col = 1; col <= width; col++) {
            cells.push(<Cell key={`${col}-${row}`} position={{x:col, y:row}} />)
        }
    }

    // 🤦‍♂️ This hacky thing just for set a CSS variable arises because React TS 
    // unsupport standard string style attr without alternative for CSS vars.
    return <section className="board">
        <div className="board__cells"
            style={{ 
                '--board-rows': height,
                '--board-cols': width} as React.CSSProperties
            }>{cells}</div>
    </section>
}

