import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { borrowDBC } from '../../helpers/reducers/DeBank';

import SectionHeader from '../reusables/SectionHeader';

function BorrowForm() {
    const dispatch = useDispatch()

    const [collateral, setCollateral] = useState(0.01)

    // Binding values
    const updateCollateral = (e) => setCollateral(e.target.value)

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Default tip amount is 0 when you create a post
        dispatch(borrowDBC({ amount: window.web3.utils.toWei(collateral, 'Ether') }))
    }

    return (
        <section>
            <SectionHeader heading="Borrow Form" />

            <h4>How much you want to borrow? (Loan: 50% of collateral (min 0.01 ETH))</h4>

            <form onSubmit={handleSubmit}>
                <label>
                    collateral amount:
                    <input type="number" step="0.01" name="collateral" placeholder="amount" value={collateral} onChange={updateCollateral} required />
                </label>

                <input type="submit" value="Submit" />
            </form>
        </section>
    );
}

export default BorrowForm;