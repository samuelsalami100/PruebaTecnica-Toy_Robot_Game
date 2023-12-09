import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../src/stores/GameStore'

describe('GameStore', ()=>{
    
    const store = () => useGameStore.getState()

    beforeEach(()=>{
        store().reset()
    })

    describe('getCellContent', ()=>{
        it('returns the cell content at one-based index specified coord', ()=>{
            const testBoard = structuredClone(store().board)
            testBoard[2][2] = 'WALL'
            useGameStore.setState({board: testBoard})

            expect(store().getCellContent({x:3, y:3})).equal('WALL')
        })
    })

    describe('placeRobot(...)', ()=>{
        it('places the robot at specified coords', ()=>{
            store().placeRobot({x: 3, y: 3}, 'NORTH')
            
            expect(store().getCellContent({x:3, y:3})).equal('ROBOT')
            expect(store().robotPosition).eql({x:3, y:3})
        })

        it('move the robot if already on the board', ()=>{
            store().placeRobot({x: 3, y: 3}, 'EAST')

            store().placeRobot({x: 5, y: 5}, 'EAST')
            
            expect(store().getCellContent({x:5, y:5})).equal('ROBOT')
            expect(store().getCellContent({x:3, y:3})).toBeUndefined()
        })

        
        it('does nothing if not valid coords', ()=>{
            store().placeRobot({x: 0, y: -1}, 'EAST')
            store().placeRobot({x: -5, y: 0}, 'EAST')
            store().placeRobot({x: 0, y: 0}, 'EAST')

            const thereIsARobot = 
                store().board.flat().some(cell => cell == 'ROBOT')

            expect(thereIsARobot).toBeFalsy()
        })
    })

})
