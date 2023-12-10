import { beforeEach, describe, expect, it } from 'vitest'
import { RenderResult, cleanup, render, waitFor } from '@testing-library/react'
import { useGameStore } from '@/stores/GameStore'
import Cell from '@/components/Cell'

describe('Cell component (Cell.tsx)', ()=>{
    const position = {x:3, y:3}
    let comp: RenderResult
    const cleanAndRender = () => {
        cleanup()
        return render(<Cell position={position} />)
    }

    beforeEach(()=>{
        useGameStore.getState().reset()
        comp = cleanAndRender()
    })

    // Structure based testing focusing on class presence and BEM.

    it('has a cell class', async ()=>{
        const cell = comp.container.firstElementChild!
        expect(cell.classList.contains('cell')).toBeTruthy()
    })

    describe('if has robot...', ()=>{
        /** 
         * This test is really fragile and implementation details dependent.
         * Useful only during dev as long as there is no rendering specification
         * (emoji, img, text?). It brings specs. Can be skipped.
         */
        it('renders a robot 🤖 emoji', async ()=>{
            useGameStore.getState().placeRobot(position, 'EAST')
            await comp.findByText('🤖')
        })

        it('has a cell--robot class modifier', async ()=>{
            useGameStore.getState().placeRobot(position, 'EAST')
            const cell = await comp.findByText('🤖')
            expect(cell.classList.contains('cell--robot')).toBeTruthy()
        })

        it('has a cell--north, cell--east, etc class modifier based on robot direction', async ()=>{
            useGameStore.getState().placeRobot(position, 'EAST')
            const cell = await comp.findByText('🤖')
            expect(cell.classList.contains('cell--east')).toBeTruthy()

            useGameStore.getState().right()
            await waitFor(
                ()=>expect(cell.classList.contains('cell--south')).toBeTruthy()
            )
            useGameStore.getState().right()
            await waitFor(
                ()=>expect(cell.classList.contains('cell--west')).toBeTruthy()
            )
            useGameStore.getState().right()
            await waitFor(
                ()=>expect(cell.classList.contains('cell--north')).toBeTruthy()
            )
        })
    })

    describe('if has wall...', ()=>{
        /** 
         * This test is really fragile and implementation details dependent.
         * Useful only during dev as long as there is no rendering specification
         * (emoji, img, text?). It brings specs. Can be skipped.
         */
        it('renders a brick 🧱 emoji', async ()=>{
            useGameStore.getState().placeWall(position)
            await comp.findByText('🧱')
        })

        it('has a cell--wall class modifier', async ()=>{
            useGameStore.getState().placeWall(position)
            const cell = await comp.findByText('🧱')
            expect(cell.classList.contains('cell--wall')).toBeTruthy()
        })
    })

    describe('if empty...', ()=>{
        /** fragile */
        it('renders nothing as text content', async ()=>{
            const cell = comp.container.firstElementChild!
            const txt = cell.textContent || ''
            expect(txt.trim()).eql('')
        })
    })
})

