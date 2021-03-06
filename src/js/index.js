import React from 'react';
import ReactDOM from 'react-dom';
import '../css/common.css';
import App from './app';


let text = document.getElementById('text').textContent;

ReactDOM.render(
    <App text={text} onlyRead={onlyRead} />,
    document.body
)