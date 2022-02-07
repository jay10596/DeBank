import React, { useEffect }  from 'react';
import Web3 from 'web3';
import DeBank from '../build/DeBank.json';
import Token from '../build/Token.json';
import { useDispatch, useSelector } from 'react-redux';
import { setDeBank } from '../helpers/reducers/DeBank'
import Router from '../helpers/router';

import Header from './sections/Header';
import Loading from './reusables/Loader';
import Footer from './sections/Footer';

// Can't use Redux hooks in a class component
function App() {    
    const dispatch = useDispatch()
    const deBank = useSelector((state) => state.deBank.value)
    const theme = useSelector((state) => state.theme)

    // Equivalent to componentWillMount()
    useEffect(() => {
        loadWeb3()
        loadBlockchain()
    })

    const loadWeb3 = async () => {
        // Modern dapp broswers
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.eth_requestAccounts
        }
        // Lagacy dapp broswers
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        // No-dapp broswers
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    const loadBlockchain = async () => {
        if(typeof window.ethereum == 'undefined') {
            window.alert('Please install MetaMask')
        } else {
            const web3 = new Web3(window.ethereum) // Anything to do with web3 is related to MetaMask such as gettting balance
            const netId = await web3.eth.net.getId() // Network ID - eg: Kovan, Ganache etc.
            const account = await web3.eth.getAccounts() // Current logged in account - eg: ['0xji2817s82hs']
            
            if(typeof account[0] == 'undefined') {
                window.alert('Please login with MetaMask')
            } else {
                const token = new window.web3.eth.Contract(Token.abi, Token.networks[netId].address)
                const deBank = new window.web3.eth.Contract(DeBank.abi, DeBank.networks[netId].address)
    
                dispatch(setDeBank({ 
                    user: {
                        address: account[0],
                        eth: await web3.eth.getBalance(account[0]),
                        dbc: await token.methods.balanceOf(account[0]).call() /* https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#id26 */
                    },
                    deBank: {
                        contract: deBank,
                        address: deBank._address,
                        eth: await web3.eth.getBalance(deBank._address),
                        dbc: await token.methods.totalSupply().call()  // Total minted DBC
                    },
                    loading: false
                }))
            }
        }        
    }

    return (
        <div className="App" >
            <Header user={deBank.user} theme={theme} />

            {deBank.loading 
                ? <Loading />
                : <Router />                    
            }
        
            <Footer />
        </div>
    )
}

export default App;



/*
Extra Notes:
    1) Why token.methods.balanceOf(address).call()
    In test, we can directly use 'token.balanceOf(account[0])' without methods because token is imported directly via Smart Contract.
    Here, token is imported via build json in which all these methods are under 'methods: {...}'. Hence, 'token.methods.balanceOf(account[0]).call()'.
    Read: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#id26
*/