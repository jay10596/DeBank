import React from 'react';

import Banner from '../sections/Banner';
import DepositForm from '../sections/DepositForm';
import WithdrawForm from '../sections/WithdrawForm';
import BorrowForm from '../sections/BorrowForm';
import ReturnForm from '../sections/ReturnForm';

function Home() {
    return (
        <main>
            <Banner />

            <DepositForm />

            <WithdrawForm />

            <BorrowForm />

            <ReturnForm />
        </main>
    );
}

export default Home;