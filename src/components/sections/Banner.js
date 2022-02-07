import React from 'react';
import { useSelector } from 'react-redux';

function Banner() {
    const deBank = useSelector((state) => state.deBank.value.deBank)

    // test()
    return (
        <div>
            <ul>
                Welcome to DeBank
                <li>Address: {deBank.address}</li>
                <li>ETH: {deBank.eth}</li>
                <li>DBC (Total Supply/Minted): {deBank.dbc}</li>
            </ul>
        </div>
    );
}

export default Banner;