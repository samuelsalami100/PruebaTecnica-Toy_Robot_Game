import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import Board from '@/components/Board.tsx'
import { useGameStore } from '@/stores/GameStore'
import { CellContent } from '@/types'

/**
 *      -------------------------------------------------------------
 *              Why I'm not stubbing/mocking/faking the store
 *             and limiting myself to use and spy the real one.
 *      -------------------------------------------------------------
 * > Using a fully centralized state. That means components has minimal props
 * and its state is PART of the store (or the store is part of them). Treat
 * the non-view state of something as a dependency makes no sense to me.
 * 
 * > Due DRY (DRY is not about duplicated code but duplicated knowledge)
 * 
 * > Due Zustand behavior and reset() recommendation. A questionable design 
 * decision on the part of its devs, but at least it helps reduce the loss of
 * testability that comes with the real global centralized state.
 */
describe('Board component (Board.tsx)', ()=>{
    const cleanAndRender = () => {
        cleanup()
        return render(<Board />)
    }

    beforeEach(()=>{
        useGameStore.getState().reset()
    })


    describe('Component creation and initialization', ()=>{
        it('renders as many cells as the cell matrix size', async ()=>{
            const comp = cleanAndRender()

            // Here is where BEM shines to me. By its nature of stable semantic 
            // structure I use CSS selectors without fear of test fragility.
            // Structure testing is important to me, I consider it shouldn't be
            // avoided in most cases.
            expect(comp.container.querySelectorAll('.cell')).toHaveLength(25)
            
            const boardWith9cells: CellContent[][] = [
                new Array(3),
                new Array(3),
                new Array(3),
            ]
            useGameStore.setState({board: boardWith9cells})
            await waitFor(()=>{
                expect(comp.container.querySelectorAll('.cell')).toHaveLength(9)   
            })
        })
    })

})

