import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RenderResult, act, cleanup, render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useGameStore } from '@/stores/GameStore'
import Cell, { CellProps } from '@/components/Cell'

describe('Cell component (Cell.tsx)', ()=>{
    const defaultProps: CellProps = {
        position: {x:3, y:3},
        placing: undefined,
        onRobotPlace: vi.fn(),
        onWallPlace: vi.fn()
    }
    const cleanAndRender = (props?: CellProps) => {
        cleanup()
        return render(
            <Cell {...{
                ...defaultProps, 
                ...props
            }} />)
    }
    let comp: RenderResult

    beforeEach(()=>{
        useGameStore.getState().reset()
        comp = cleanAndRender()
    })

    // Structure based testing focusing on class presence and BEM.

    it('has a cell class', async ()=>{
        const cell = comp.container.firstElementChild!
        expect(cell.classList.contains('cell')).toBeTruthy()
    })

    describe('if has ROBOT...', ()=>{
        /** 
         * This test is really fragile and implementation details dependent.
         * Useful only during dev as long as there is no rendering specification
         * (emoji, img, text?). It brings specs. Can be skipped.
         */
        it('renders a robot 🤖 emoji', async ()=>{
            act(()=>useGameStore.getState().placeRobot(defaultProps.position, 'EAST'))
            await comp.findByText('🤖')
        })

        it('has a cell--robot class modifier', async ()=>{
            act(()=>useGameStore.getState().placeRobot(defaultProps.position, 'EAST'))
            const cell = await comp.findByText('🤖')
            expect(cell.classList.contains('cell--robot')).toBeTruthy()
        })

        it('has a cell--north, cell--east, etc class modifier based on robot direction', async ()=>{
            act(()=>useGameStore.getState().placeRobot(defaultProps.position, 'EAST'))
            const cell = await comp.findByText('🤖')
            expect(cell.classList.contains('cell--east')).toBeTruthy()

            act(()=>useGameStore.getState().right())
            await waitFor(
                ()=>expect(cell.classList.contains('cell--south')).toBeTruthy()
            )
            act(()=>useGameStore.getState().right())
            await waitFor(
                ()=>expect(cell.classList.contains('cell--west')).toBeTruthy()
            )
            act(()=>useGameStore.getState().right())
            await waitFor(
                ()=>expect(cell.classList.contains('cell--north')).toBeTruthy()
            )
        })
    })

    describe('if has WALL...', ()=>{
        /** 
         * This test is really fragile and implementation details dependent.
         * Useful only during dev as long as there is no rendering specification
         * (emoji, img, text?). It brings specs. Can be skipped.
         */
        it('renders a brick 🧱 emoji', async ()=>{
            act(()=>useGameStore.getState().placeWall(defaultProps.position))
            await comp.findByText('🧱')
        })

        it('has a cell--wall class modifier', async ()=>{
            act(()=>useGameStore.getState().placeWall(defaultProps.position))
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

        it('has a cell--empty class modifier', async ()=>{
            const cell = comp.container.firstElementChild!
            expect(cell.classList.contains('cell--empty')).toBeTruthy()
        })
    })

    describe('if placing mode...', ()=>{
        it('has cell--placing class if empty', ()=>{
            comp.rerender(<Cell {...{...defaultProps, placing: 'EAST'}} />)
            const cell = comp.container.firstElementChild!
            expect(cell.classList.contains('cell--placing')).toBeTruthy()
        })

        describe('and if placing robot (placing = a Direction)', ()=>{
            it('has cell--{Direction} class modifiers if empty', ()=> {
                comp.rerender(<Cell {...{...defaultProps, placing: 'EAST'}} />)
                let cell = comp.container.firstElementChild!
                expect(cell.classList.contains('cell--east')).toBeTruthy()

                comp.rerender(<Cell {...{...defaultProps, placing: 'SOUTH'}} />)
                cell = comp.container.firstElementChild!
                expect(cell.classList.contains('cell--south')).toBeTruthy()

                comp.rerender(<Cell {...{...defaultProps, placing: 'NORTH'}} />)
                cell = comp.container.firstElementChild!
                expect(cell.classList.contains('cell--north')).toBeTruthy()

                comp.rerender(<Cell {...{...defaultProps, placing: 'WEST'}} />)
                cell = comp.container.firstElementChild!
                expect(cell.classList.contains('cell--west')).toBeTruthy()
            })
        })


        describe('and if placing a wall (placing = WALL)', ()=>{
            it('has cell--wall class modifiers if empty', () => {
                comp.rerender(<Cell {...{...defaultProps, placing: 'WALL'}} />)
                const cell = comp.container.firstElementChild!
                expect(cell.classList.contains('cell--wall')).toBeTruthy()
            })
        })
    })

    describe('on pointer down (click, touch, pointer...)', ()=>{
        it('does nothing if not placing', async ()=>{
            const user = userEvent.setup()
            const mock = vi.fn()

            comp.rerender(<Cell {...{...defaultProps, 
                onRobotPlace:mock, 
                onWallPlace:mock
            }} />)

            const cell = comp.container.firstElementChild as HTMLElement
            await user.click(cell)
            await waitFor(()=>expect(mock).not.toHaveBeenCalled())
        })

        it('call onRobotPlace callback with position and direction if placing robot', async ()=>{
            const user = userEvent.setup()
            const onRobotPlaceMock = vi.fn()
            const onWallPlaceMock = vi.fn()

            comp.rerender(<Cell {...{...defaultProps, 
                onRobotPlace: onRobotPlaceMock, 
                onWallPlace: onWallPlaceMock,
                placing: 'EAST'
            }} />)

            let cell = comp.container.firstElementChild!
            await user.click(cell)
            await waitFor(()=>expect(onRobotPlaceMock).toHaveBeenCalled())
            expect(onRobotPlaceMock.mock.calls[0][0]).eql(defaultProps.position)
            expect(onRobotPlaceMock.mock.calls[0][1]).equal('EAST')
            await waitFor(()=>expect(onWallPlaceMock).not.toHaveBeenCalled())


            comp.rerender(<Cell {...{...defaultProps, 
                onRobotPlace: onRobotPlaceMock, 
                onWallPlace: onWallPlaceMock,
                placing: 'NORTH'
            }} />)

            cell = comp.container.firstElementChild!
            await user.click(cell)
            await waitFor(()=>expect(onRobotPlaceMock).toHaveBeenCalled())
            expect(onRobotPlaceMock.mock.calls[1][0]).eql(defaultProps.position)
            expect(onRobotPlaceMock.mock.calls[1][1]).equal('NORTH')
            await waitFor(()=>expect(onWallPlaceMock).not.toHaveBeenCalled())
        })

        it('call onWallPlace with position if placing wall', async ()=>{
            const user = userEvent.setup()
            const onRobotPlaceMock = vi.fn()
            const onWallPlaceMock = vi.fn()

            comp.rerender(<Cell {...{...defaultProps, 
                onRobotPlace: onRobotPlaceMock, 
                onWallPlace: onWallPlaceMock,
                placing: 'WALL'
            }} />)

            const cell = comp.container.firstElementChild!
            await user.click(cell)
            await waitFor(()=>expect(onRobotPlaceMock).not.toHaveBeenCalled())
            await waitFor(()=>expect(onWallPlaceMock).toHaveBeenCalled())
            expect(onWallPlaceMock.mock.calls[0][0]).eql(defaultProps.position)
        })
    })
})