import React from 'react';
import { useDispatch } from 'react-redux';
import { withdrawETH } from '../../helpers/reducers/DeBank';

import SectionHeader from '../reusables/SectionHeader';

function WithdrawForm() {
    const dispatch = useDispatch()

    // On click
    function handleSubmit() {
        dispatch(withdrawETH())
    }

    return (
        <section>
            <SectionHeader heading="Withdraw Form" />

            <h4>Are you sure you want to withdraw ETH and gain DBC?</h4>

            <button onClick={handleSubmit}>Withdraw Now</button>
        </section>
    );
}

export default WithdrawForm;