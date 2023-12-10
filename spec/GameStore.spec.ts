import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../src/stores/GameStore'

describe('GameStore', ()=>{

    const store = () => useGameStore.getState()

    beforeEach(()=>{
        store().reset()
    })

    describe('getCellContent', ()=>{
        it('returns the cell content at one-based index specified coord', ()=>{
            expect(store().placeWall({x:3, y:3}))
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

    describe('placeWall(...)', ()=>{
        it('places the wall at specified coords (empty cell)', ()=>{
            store().placeWall({x:3, y:3})
            expect(store().getCellContent({x:3, y:3})).equal('WALL')
        })

        it('does nothing if not valid coords', ()=>{
            store().placeWall({x:-3, y:3})
            store().placeWall({x:0, y:0})
            store().placeWall({x:0, y:20})
            expect(store().board.flat().every(c => c != 'WALL')).toBeTruthy()
        })

        it('does nothing if cell is not empty', ()=>{
            store().placeRobot({x:3, y:3}, 'EAST')

            store().placeWall({x:3, y:3})

            // Cell still has the robot
            expect(store().getCellContent({x:3, y:3})).equal('ROBOT')
            // no wall has been placed anywhere
            expect(store().board.flat().every(c => c != 'WALL')).toBeTruthy()
        })
    })

    describe('report', ()=>{
        // I consider printing to be a view-specific behavior or implementation 
        // detail that should not occur during state management.
        it('return (not print) robot current location and direction', ()=>{
            expect(store().report()).toBeUndefined()

            store().placeRobot({x:3, y:2}, 'EAST')
            expect(store().report()).equal('3,2,EAST')

            store().placeRobot({x:5, y:3}, 'WEST')
            expect(store().report()).equal('5,3,WEST')
        })
    })
})
