import React from 'react';
import ReactDOM from 'react-dom/client';
import Chatbot from './Chatbot';
import './index.css';

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Chatbot />
    </React.StrictMode>
);
