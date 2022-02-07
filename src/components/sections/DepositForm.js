import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { depositETH } from '../../helpers/reducers/DeBank';

import SectionHeader from '../reusables/SectionHeader';

function DepositForm() {
    const dispatch = useDispatch()

    const [deposit, setDeposit] = useState(0.01)

    // Binding values
    const updateDeposit = (e) => setDeposit(e.target.value)

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Default tip amount is 0 when you create a post
        dispatch(depositETH({ amount: window.web3.utils.toWei(deposit, 'Ether') }))
    }

    return (
        <section>
            <SectionHeader heading="Deposit Form" />

            <h4>How much you want to deposit? (Min 0.01 ETH)</h4>

            <form onSubmit={handleSubmit}>
                <label>
                    deposit amount:
                    <input type="number" step="0.01" name="deposit" placeholder="amount" value={deposit} onChange={updateDeposit} required />
                </label>

                <input type="submit" value="Submit" />
            </form>
        </section>
    );
}

export default DepositForm;