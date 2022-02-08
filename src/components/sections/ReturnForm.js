import React from 'react';
import { useDispatch } from 'react-redux';
import { returnDBC } from '../../helpers/reducers/DeBank';

import SectionHeader from '../reusables/SectionHeader';

function ReturnForm() {
    const dispatch = useDispatch()

    // On click
    function handleSubmit() {
        dispatch(returnDBC())
    }

    return (
        <section>
            <SectionHeader heading="Return Form" />

            <h4>Are you sure you want to return DBC and get back ETH (- 10% fee)?</h4>

            <button onClick={handleSubmit}>Return Now</button>
        </section>
    );
}

export default ReturnForm;