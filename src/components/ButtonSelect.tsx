import './ButtonSelect.css'
import { useState } from 'react'

type ButtonProps = {
    text?: string,
    value: string | number,
}
type ButtonSelectProps = {
    options: ButtonProps[],
    defaultSelected: string,
    onInput?: (option: ButtonProps, index: number) => void,
}

/**
 * A simple select component with buttons. I treat it like an external 
 * library. Copypasted from old toy projects and tested with another library
 * different to React Testing Library & Vitest.
 */
export default function ButtonSelect(props: ButtonSelectProps) {
    const [selected, setSelected] = 
        useState<string|number|undefined>(props.defaultSelected)

    const buttons = props.options.map(({ text, value }, i) => {
        const modifier = 
            (value == selected) ? 'button-select__option--selected' : ''
        
        return <button
            key={i}
            className={`button-select__option ${modifier}`}
            onPointerDown={()=>{
                setSelected(value)
                if (props.onInput) { props.onInput(props.options[i], i) }
            }}>{text === undefined ? value : text}
        </button>
    })

    return <div className="button-select">{ buttons }</div>
}