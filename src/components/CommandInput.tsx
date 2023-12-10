import { KeyboardEventHandler, useState } from 'react'
import './CommandInput.css'
import { useGameStore } from '@/stores/GameStore'

export default function CommandInput() {
    const [value, setValue] = useState('')
    const store = useGameStore()

    const confirm = () => {
        if (value.trim().length == 0) { return }
        
        store.commandString(value)
        setValue('')
    }
    const keyDownHandler: KeyboardEventHandler = (ev) => {
        if(ev.key == 'Enter') { confirm() }
    }
    
    return <div className="command-input">
        <input type="text" 
            onChange={(event)=>setValue(event.target.value)}
            value={value}
            onKeyDown={keyDownHandler}
            className="command-input__input-element" />
        <button disabled={value.trim() === ''}
            onPointerDown={confirm}>Confirm</button>
    </div>
}