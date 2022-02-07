import { createSlice } from "@reduxjs/toolkit"

const deBankSlice = createSlice({
    name: 'deBank',
    initialState: {
        value: {
            user: {
                address: null,
                eth: 0,
                dbc: 0
            },
            deBank: {
                contract: [],
                address: null,
                eth: 0,
                dbc: 0 // Total minted DBC
            },
            loading: false
        }
    },
    reducers: {
        setDeBank: (state, action) => {
            state.value = action.payload
        },
        depositETH: (state, action) => {
            state.value.loading = true

            state.value.deBank.contract.methods.depositETH()
                .send({ from: state.value.user.address, value: action.payload.amount })
                .on('receipt', (receipt) => {
                    state.value.loading = false
                })
        },
        withdrawETH: (state, action) => {
            state.value.loading = true

            state.value.socialMedia.methods.tipPost(action.payload.id)
                .send({ from: state.value.account, value: action.payload.tip })
                .on('receipt', (receipt) => {
                    state.value.loading = false
                })
        },
        borrowDBC: (state, action) => {

        },
        returnDBC: (state, action) => {
            
        }
    }
})

export const { setDeBank, depositETH, withdrawETH, borrowDBC, returnDBC } = deBankSlice.actions;

export default deBankSlice.reducer;