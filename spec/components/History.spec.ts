import { beforeEach, describe, vi } from 'vitest'
import { RenderResult, act, cleanup, render} from '@testing-library/react'
import { useGameStore } from '@/stores/GameStore'
import Cell, { CellProps } from '@/components/Cell'

describe('History component', ()=>{
    
    const cleanAndRender = () => {
        cleanup()
        return render(
            < History />)
    }
    let comp: RenderResult

    beforeEach(()=>{
        useGameStore.getState().reset()
        comp = cleanAndRender()
    })

    // Structure based testing focusing on class presence and BEM.


})