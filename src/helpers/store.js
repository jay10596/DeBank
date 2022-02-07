import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

import themeReducer from "./reducers/Theme";
import deBankReducer from "./reducers/DeBank";

const Store = configureStore({
    reducer: {
        theme: themeReducer,
        deBank: deBankReducer
    },
    middleware: [thunk]
})

export default Store