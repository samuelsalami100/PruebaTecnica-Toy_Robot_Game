// I prefer not to use CSS-in-JS and avoid direct styling in component
// definition as much as possible in favor of standard CSS. It's just a personal
// preference, I have no problem working in other ways though.
import './Board.css' // NOTE: using BEM methodology/convention

import { useGameStore } from '../stores/GameStore'
import Cell from './Cell'
import { useState } from 'react'
import { Direction } from '@/types'
import ButtonSelect from './ButtonSelect'

export default function Board() {
    const gameStore = useGameStore()

    const height = gameStore.board.length
    const width = gameStore.board[0].length

    const [placing, setPlacing] = useState<Direction | 'WALL' | undefined>()

    const cells: JSX.Element[] = []
    for (let row = height; row > 0; row--) {    // CELLS INSTANTIATION
        for (let col = 1; col <= width; col++) {
            cells.push(<Cell key={`${col}-${row}`}
                position={{ x: col, y: row }}
                placing={placing}
                onRobotPlace={(pos, dir) => {
                    gameStore.commandString(`PLACE_ROBOT ${pos.x},${pos.y},${dir}`)
                    setPlacing(undefined)
                }}
                onWallPlace={(pos) => {
                    gameStore.commandString(`PLACE_WALL ${pos.x},${pos.y}`)
                    setPlacing(undefined)
                }}
            />)
        }
    }

    // 🤦‍♂️ This hacky thing just for set a CSS variable arises because React TS 
    // unsupport standard string style attr without alternative for CSS vars.
    return <>
        <section className="board">
            <div className="board__cells"
                style={{
                    '--board-rows': height,
                    '--board-cols': width
                } as React.CSSProperties  //     ¯\_(ツ)_/¯
                }>{cells}
            </div>
            <section className="controls place-controls">
                {!placing &&
                    <>
                        <button className="controls place-controls__wall"
                            onClick={() => setPlacing('WALL')}>🧱 Place wall</button>
                        <button className="controls place-controls__robot"
                            onClick={() => setPlacing('SOUTH')}>🤖 Place robot</button>
                    </>}

                {placing &&
                    <>
                        <button className="controls place-controls__cancel"
                            onClick={() => setPlacing(undefined)}>❌ Cancel</button>

                        {placing != 'WALL' &&
                            <ButtonSelect
                                options={[
                                    { value: 'NORTH' }, { value: 'EAST' },
                                    { value: 'SOUTH' }, { value: 'WEST' },
                                ]}
                                defaultSelected='SOUTH'
                                onInput={(op) => setPlacing(op.value as Direction)}
                            />}
                    </>
                }
            </section>

            <section className="controls move-controls">
                {!placing &&
                    <>
                        <button className="move-controls__left"
                            onClick={() => gameStore.command('LEFT')}>Turn left</button>
                        <button className="move-controls__forward"
                            onClick={() => gameStore.commandString('MOVE')}>👣 Forward</button>
                        <button className="move-controls__right"
                            onClick={() => gameStore.commandString('RIGHT')}>Turn right</button>
                    </>}
            </section>
        </section>

    </>
}

