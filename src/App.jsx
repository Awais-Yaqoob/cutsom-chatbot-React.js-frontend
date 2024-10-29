// src/App.js
import { useState } from 'react';
import './App.css';
import Chatbot from './Chatbot';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <h1>Simple Chatbot</h1>
            <Chatbot />
        </div>
    );
}

export default App;
