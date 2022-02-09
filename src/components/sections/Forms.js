import React from 'react';
import { useSelector } from 'react-redux';

import DepositForm from '../sections/DepositForm';
import WithdrawForm from '../sections/WithdrawForm';
import BorrowForm from '../sections/BorrowForm';
import ReturnForm from '../sections/ReturnForm';

function Forms() {
    const user = useSelector((state) => state.deBank.value.user)

    return (
        <div>
            {user.account && user.account.isDeposited
                ?   <WithdrawForm />
                :   <DepositForm />
            }

            {user.account && user.account.isBorrowed 
                ?   <ReturnForm />
                :   <BorrowForm />
            }
        </div>
    );
}

export default Forms;