import React from 'react';
import { useDispatch } from 'react-redux';
import { setTheme } from '../../helpers/reducers/Theme'
import { Link } from 'react-router-dom';

const Header = (props) => {
    const dispatch = useDispatch()

    return (
        <header>
            <ul>
                User:
                <li>Address: {props.user.address}</li>
                <li>ETH: {props.user.eth}</li>
                <li>DBC: {props.user.dbc}</li>
            </ul>

            <Link to="/about">About</Link>

            <button onClick={() => dispatch(setTheme({color: props.theme.color === 'light' ? 'dark' : 'light'}))}>
                {props.themeColor}
            </button>
        </header>
    );
}

export default Header;