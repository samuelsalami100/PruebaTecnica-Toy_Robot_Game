import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../src/stores/GameStore'

/**
 * Gets guaranteed up-to-date status from the store. I recommend always doing it
 * this way during testing to avoid any type of unexpected "hook" behavior.
 * Implications of the not-so-agnostic Zustand library.
 */
const store = () => useGameStore.getState()

/**
 * Utility to check for any changes. Avoiding excesive boilerplating with all
 * those methods that "does nothing if ...""
 */
function expectNoBoardChangesWhenDo(actions: ()=>void) {
    const originalBoard = structuredClone(store().board)
    const originalPosition = structuredClone(store().robotPosition)
    const originalDirection = store().robotDirection
    actions()
    expect(store().board).eql(originalBoard)
    expect(store().robotPosition).eql(originalPosition)
    expect(store().robotDirection).eql(originalDirection)
}

describe('GameStore', ()=>{
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
            expectNoBoardChangesWhenDo(()=>{
                store().placeRobot({x: 0, y: -1}, 'EAST')
                store().placeRobot({x: -5, y: 0}, 'EAST')
                store().placeRobot({x: 0, y: 0}, 'EAST')
            })
        })

        it('does nothing if not empty cell', ()=>{
            store().placeWall({x: 3, y: 3})
            expectNoBoardChangesWhenDo(()=>{
                store().placeRobot({x: 3, y: 3}, 'EAST')
            })
        })
    })

    describe('placeWall(...)', ()=>{
        it('places the wall at specified coords (empty cell)', ()=>{
            store().placeWall({x:3, y:3})
            expect(store().getCellContent({x:3, y:3})).equal('WALL')
        })

        it('does nothing if not valid coords', ()=>{
            expectNoBoardChangesWhenDo(()=>{
                store().placeWall({x:-3, y:3})
                store().placeWall({x:0, y:0})
                store().placeWall({x:0, y:20})
            })
        })

        it('does nothing if cell is not empty', ()=>{
            store().placeRobot({x:3, y:3}, 'EAST')

            expectNoBoardChangesWhenDo(()=>store().placeWall({x:3, y:3}))
        })
    })

    describe('report()', ()=>{
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

    
    describe('move()', ()=>{
        it('does nothing if there are no robot', ()=>{
            expectNoBoardChangesWhenDo(()=>store().move())
        })

        it('does nothing if there is a wall in front of the robot', ()=>{
            store().placeRobot({x: 2, y: 2}, 'EAST')
            store().placeWall({x: 3, y: 2})
            expectNoBoardChangesWhenDo(()=>store().move())
        })

        it('moves the robot forward in the facing direction', ()=>{
            store().placeRobot({x:2, y:2}, 'EAST')
            store().move()

            expect(store().getCellContent({x:2, y:2})).toBeUndefined()
            expect(store().robotPosition).eql({x:3, y:2})
            expect(store().getCellContent({x:3, y:2})).equal('ROBOT')

            store().move()
            expect(store().getCellContent({x:3, y:2})).toBeUndefined()
            expect(store().robotPosition).eql({x:4, y:2})
            expect(store().getCellContent({x:4, y:2})).equal('ROBOT')

            store().robotDirection = 'WEST'
            store().move()
            expect(store().robotPosition).eql({x:3, y:2})
            expect(store().getCellContent({x:3, y:2})).equal('ROBOT')

            store().robotDirection = 'NORTH'
            store().move()
            expect(store().robotPosition).eql({x:3, y: 3})
            expect(store().getCellContent({x:3, y:3})).equal('ROBOT')

            store().robotDirection = 'SOUTH'
            store().move()
            expect(store().robotPosition).eql({x:3, y:2})
            expect(store().getCellContent({x:3, y:2})).equal('ROBOT')
        })

        it('moves the robot and warping at edges', ()=>{
            store().placeRobot({x:2, y:5}, 'NORTH')
            store().move()
            expect(store().robotPosition).eql({x:2, y:1})


            store().placeRobot({x:5, y:2}, 'EAST')
            store().move()
            expect(store().robotPosition).eql({x:1, y:2})
            
            
            store().placeRobot({x:2, y:1}, 'SOUTH')
            store().move()
            expect(store().robotPosition).eql({x:2, y:5})

            store().placeRobot({x:1, y:2}, 'WEST')
            store().move()
            expect(store().robotPosition).eql({x:5, y:2})
        })

        
        it('moves the robot and warping at edges only if possible', ()=>{
            store().placeWall({x:3, y:1})
            store().placeRobot({x:3, y:5}, 'NORTH')
            expectNoBoardChangesWhenDo(()=>store().move())

            store().placeWall({x:1, y:2})
            store().placeRobot({x:5, y:2}, 'EAST')
            expectNoBoardChangesWhenDo(()=>store().move())

            store().placeWall({x:2, y:5})
            store().placeRobot({x:2, y:1}, 'SOUTH')
            expectNoBoardChangesWhenDo(()=>store().move())

            store().placeWall({x:5, y:3})
            store().placeRobot({x:1, y:3}, 'WEST')
            expectNoBoardChangesWhenDo(()=>store().move())
        })
    })

    describe('left() and right()', ()=>{
        it('Does nothing if no robot', ()=>{
            expectNoBoardChangesWhenDo(()=>store().right())
            expectNoBoardChangesWhenDo(()=>store().left())
        })

        it('Change direction clockwise with right', ()=>{
            store().placeRobot({x:2, y:2}, 'NORTH')
            store().right()
            expect(store().robotDirection).equal('EAST')
            store().right()
            expect(store().robotDirection).equal('SOUTH')
            store().right()
            expect(store().robotDirection).equal('WEST')
            store().right()
            expect(store().robotDirection).equal('NORTH')
        })

        
        it('Change direction anticlockwise with left', ()=>{
            store().placeRobot({x:2, y:2}, 'NORTH')
            store().left()
            expect(store().robotDirection).equal('WEST')
            store().left()
            expect(store().robotDirection).equal('SOUTH')
            store().left()
            expect(store().robotDirection).equal('EAST')
            store().left()
            expect(store().robotDirection).equal('NORTH')
        })
    })
})
