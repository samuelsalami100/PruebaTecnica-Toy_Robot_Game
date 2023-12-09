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
            // Given
            // When
            store().placeRobot({x: 3, y: 3}, 'NORTH')
            
            // Then
            expect(store().getCellContent({x:3, y:3})).equal('ROBOT')
            expect(store().robotPosition).eql({x:3, y:3})
        })

        it('move the robot if already on the board', ()=>{
            // GIVEN
            store().placeRobot({x: 3, y: 3}, 'EAST')

            // WHEN
            store().placeRobot({x: 5, y: 5}, 'EAST')
            
            // THEN
            expect(store().getCellContent({x:5, y:5})).equal('ROBOT')
            expect(store().getCellContent({x:3, y:3})).toBeUndefined()
        })
    })

})
