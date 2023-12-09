import { beforeEach, describe, expect, it } from 'vitest'
import { GameStore, useGameStore } from '../src/stores/GameStore'

describe('GameStore', ()=>{
    let gameStore: GameStore

    beforeEach(()=>{
        gameStore = useGameStore.getState()
        gameStore.reset()
    })

    describe('getCellContent', ()=>{
        it('returns the cell content at one-based index specified coord', ()=>{
            const testBoard = structuredClone(gameStore.board)
            testBoard[2][2] = 'WALL'
            useGameStore.setState({board: testBoard})

            expect(gameStore.getCellContent({x:3, y:3})).equal('WALL')
        })
    })

    describe('placeRobot(...)', ()=>{
        it('places the robot at specified coords', ()=>{
            gameStore.placeRobot({x: 3, y: 3})
            expect(gameStore.getCellContent({x:3, y:3})).equal('ROBOT')
        })
    })

})
