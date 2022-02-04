import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Store from './helpers/store';
import App from './components/App';
import './styles/App.scss';

ReactDOM.render(
    <React.StrictMode >
        {/* Can't use Link without BrowserRoute i.e. can't move it in Router.js */}
        <BrowserRouter> 
            <Provider store={Store}>
                <App />
            </Provider>
        </BrowserRouter>
    </React.StrictMode>,
    
    document.getElementById('root')
);