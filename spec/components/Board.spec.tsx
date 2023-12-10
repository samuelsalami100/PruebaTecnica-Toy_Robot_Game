import { beforeEach, describe, expect, it } from 'vitest'
import { RenderResult, act, cleanup, render, waitFor } from '@testing-library/react'
import Board from '@/components/Board.tsx'
import { useGameStore } from '@/stores/GameStore'
import { CellContent } from '@/types'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

/**
 *                            
 *      ---------------          DECISION 1          ----------------
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

/*      ---------------          DECISION 2          ----------------
 *                   What to test here in the components
 *                     THIS IS NOT AN E2E TEST SUITE
 *      -------------------------------------------------------------
 * Focusing in test view/representational/UI states (what elements changes,
 * why, how, what renders, what hides), not commands logic, game state or 
 * side effects (already tested in GameStore.spec.ts). i.e: I'm not testing the 
 * forward, turn right or turn left beyond making sure they render because have
 * no impact in UI states. A fully test from UI should be done with Cypress,
 * Playwright or another E2E testing framework.
 * 
 * I won't be implementing E2E, although I have some experience with Cypress 
 * and Playwright. I do not consider it appropriate to overwork a toy project.
 */
describe('Board component (Board.tsx)', ()=>{
    const cleanAndRender = () => {
        cleanup()
        return render(<Board />)
    }

    beforeEach(()=>{
        useGameStore.getState().reset()
    })

    const expectAllMainButtonsRendered = async (comp: RenderResult) => {
        const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
        const placeWallBtn = await comp.findByText('Place wall', {exact: false})
        const fwdBtn = await comp.findByText('forward', {exact: false})
        const leftBtn = await comp.findByText('left', {exact: false})
        const rightBtn = await comp.findByText('right', {exact: false})

        await waitFor(() => {
            expect(placeRobotBtn).toBeVisible()
            expect(placeWallBtn).toBeVisible()
            expect(fwdBtn).toBeVisible()
            expect(leftBtn).toBeVisible()
            expect(rightBtn).toBeVisible()
        })
    }

    const expectAllMainButtonsNotRendered = async (comp: RenderResult) => {
        const placeRobotBtn = comp.queryByText('Place robot', {exact: false})
        const placeWallBtn = comp.queryByText('Place wall', {exact: false})
        const fwdBtn = comp.queryByText('forward', {exact: false})
        const leftBtn = comp.queryByText('left', {exact: false})
        const rightBtn = comp.queryByText('right', {exact: false})
        expect(placeRobotBtn).toBeNull()
        expect(placeWallBtn).toBeNull()
        expect(fwdBtn).toBeNull()
        expect(leftBtn).toBeNull()
        expect(rightBtn).toBeNull()
    }


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
            act(()=>useGameStore.setState({board: boardWith9cells}))
            await waitFor(()=>{
                expect(comp.container.querySelectorAll('.cell')).toHaveLength(9)   
            })
        })
    })

    
    describe('Menus', ()=>{
        it('renders place and move buttons', async ()=>{
            expectAllMainButtonsRendered(cleanAndRender())
        })
    })

    describe('Place robot mode', ()=>{
        it('renders a directions button and a cancel button', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            
            await act(()=>user.click(placeRobotBtn))
            await waitFor(() => {
                expect(comp.getByText('Cancel', {exact:false})).toBeVisible()
                expect(comp.getByText('north', {exact:false})).toBeVisible()
                expect(comp.getByText('east', {exact:false})).toBeVisible()
                expect(comp.getByText('south', {exact:false})).toBeVisible()
                expect(comp.getByText('west', {exact:false})).toBeVisible()
            })
        })

        it('hide place and move buttons', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            await act(()=>user.click(placeRobotBtn))
            await expectAllMainButtonsNotRendered(comp)
        })

        it('places a robot and exit place mode if click on empty cell', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            const emptyCell = comp.container.querySelector('.cell--empty')!
            
            await user.click(placeRobotBtn)
            await user.click(emptyCell)
            
            const robotCell = comp.container.querySelector('.cell--robot')!
            expect(emptyCell).equal(robotCell)

            expectAllMainButtonsRendered(comp)
        })

        it('place the robot facing the selected direction', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            const emptyCell = comp.container.querySelector('.cell--empty')!
            
            await user.click(placeRobotBtn)
            const southBtn = await comp.findByText('south', {exact: false})
            await user.click(southBtn)
            await user.click(emptyCell)
            
            const robotCell = comp.container.querySelector('.cell--robot')!
            expect(robotCell.classList.contains('cell--south')).toBeTruthy()
        })
    })

    describe('Place wall mode', ()=>{
        it('renders a cancel button', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            
            await act(()=>user.click(placeRobotBtn))
            await waitFor(() => {
                expect(comp.getByText('Cancel', {exact:false})).toBeVisible()
            })
        })

        it('hide place and move buttons', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            const placeWallBtn = await comp.findByText('Place wall', {exact: false})
            const fwdBtn = await comp.findByText('forward', {exact: false})
            const leftBtn = await comp.findByText('left', {exact: false})
            const rightBtn = await comp.findByText('right', {exact: false})
            
            await act(()=>user.click(placeRobotBtn))

            await waitFor(() => {
                expect(placeRobotBtn).not.toBeVisible()
                expect(placeWallBtn).not.toBeVisible()
                expect(fwdBtn).not.toBeVisible()
                expect(leftBtn).not.toBeVisible()
                expect(rightBtn).not.toBeVisible()
            })
        })

        it('places a wall and exit place mode if click on empty cell', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()
            const placeWallBtn = await comp.findByText('Place wall', {exact: false})
            const emptyCell = comp.container.querySelector('.cell--empty')!
            
            await user.click(placeWallBtn)
            await user.click(emptyCell)
            
            const wallCell = comp.container.querySelector('.cell--wall')!
            expect(emptyCell).equal(wallCell)

            expectAllMainButtonsRendered(comp)
        })
    })

    describe('Cancel button', ()=>{
        it('return from place mode and show or rerender all buttons', async ()=>{
            const user = userEvent.setup()
            const comp = cleanAndRender()

            // Return from place robot
            const placeRobotBtn = await comp.findByText('Place robot', {exact: false})
            await act(()=>user.click(placeRobotBtn))
            let cancelBtn = await comp.findByText('cancel', {exact: false})
            await act(()=>user.click(cancelBtn))
            await expectAllMainButtonsRendered(comp)

            // Return from place wall
            const placeWallBtn = await comp.findByText('Place wall', {exact: false})
            await act(()=>user.click(placeWallBtn))
            cancelBtn = await comp.findByText('cancel', {exact: false})
        })
    })
})

