import './History.css'
import { encodeCommand } from '@/lib/CommandParser'
import { useGameStore } from '@/stores/GameStore'
import { useRef } from 'react'
import CommandInput from './CommandInput'

export default function History() {
    const msgs = useGameStore().history.map(
        ({name, params, result}) => ({
            type: name, 
            text: encodeCommand(name, params),
            result
        })
    )

    const list = useRef<HTMLDivElement>(null)
    if (list.current) { list.current.scrollTop = 99999 }

    return <section className="history">
        <h2 className="history__title">History</h2>
        <div className="history__list" ref={list}>
            {msgs.map(({text, type, result},i) => 
                <p key={i} 
                    className={`history__message history__message--${type}`}>
                    {text} 
                    {result && 
                    <span className="history__message--result">{result}</span>}
                </p>
            )}
        </div>
        <CommandInput />
    </section>
}