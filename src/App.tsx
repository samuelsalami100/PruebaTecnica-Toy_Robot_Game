import './App.css'
import Board from './components/Board'
import History from './components/History'

function App() {
    return (<>
        <header className="main-header">
            <h1>Toy Robot Game</h1>
            <p>Not mobile responsive atm</p>
        </header>
        <History />
        <Board />
    </>)
}

export default App
