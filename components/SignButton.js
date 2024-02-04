import React, { useState } from 'react'
import{ Web3 } from 'web3'
import "../scripts/connect"
import { TatumSDK, Network, MetaMask, ResponseDto, FungibleTokenBalance } from "@tatumio/tatum";

export default function () {

    // Install with: npm install @tatumio/tatum

const domainName = "MyToken" // put your token name 
const domainVersion = "1" // leave this to "1"
const chainId = 11155111 // this is for the chain's ID. value is 11155111 for sepolia
const contractAddress = "0x7a28946C825C6a88FCe38fC8224a620715b7c4E3" // Put the address here from remix
const maxAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

const [web3, setWeb3] = useState(null)
const [address, setAddress] = useState(null)
const [contract, setContract] = useState(null)


const domain = {
  name: domainName,
  version: domainVersion,
  verifyingContract: contractAddress,
  chainId
}

const domainType = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const connect = async () => {
  // This helps connect webpage to wallet.
  window.ethereum ?
  ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
   
    setAddress(accounts[0])
    console.log("Address: ", address)
    let w3 = new Web3(ethereum)
    setWeb3(w3)
  }).catch((err) => console.log(err))
: console.log("Please install MetaMask")


 
}

const splitSig = (sig) => {
  window.Buffer
  // splits the signature to r, s, and v values.
  const pureSig = sig.replace("0x", "")

  const r =   (pureSig.substring(0, 64))
  const s =   (pureSig.substring(64, 128))
  const v =   ((parseInt(pureSig.substring(128, 130), 16)).toString());


  return {
    r, s, v
  }
}

const signTyped = (dataToSign) => {
  // call this method to sign EIP 712 data
  return new Promise((resolve, reject) => {
    ethereum.sendAsync({
      method: "eth_signTypedData_v4",
      params: [address, dataToSign],
      from: address
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result.result)
    })
  })
}

async function createPermit(spender, value, nonce, deadline) {
  const permit = { owner: address, spender, value, nonce, deadline }
  const Permit = [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ]
  
  const dataToSign = JSON.stringify({
      types: {
          EIP712Domain: domainType,
          Permit: Permit
      },
      domain: domain,
      primaryType: "Permit",
      message: permit
  });

  const signature = await signTyped(dataToSign)
  const split = splitSig(signature)

  return {
    ...split, signature
  }
}


const connectWallet = (async()=>{
  console.log("Connecting wallet")
  try {
    const tatum = await TatumSDK.init({ network: Network.ETHEREUM_SEPOLIA });
    const metamaskAccount = await tatum.walletProvider.use(MetaMask).getWallet();
    console.log("Account: ", metamaskAccount);

  } catch (error) {
    console.error("Error fetching default account from MetaMask:", error);
  }
  
})




async function getAllTokensBalance(){
  try {
    const tatum = await TatumSDK.init({ network: Network.ETHEREUM_SEPOLIA });
    const balance = await tatum.token.getBalance({ addresses: ['0x8D229724e78b3c97316395C75b4133D759BC20F5']});
    console.log('Account: ', connectedAccounts)
    console.log("Wallet balance: ", balance.data);
  } catch (error) {
    console.error("Error fetching balances of fungible tokens:", error);
  }
}

async function sendCustomTransaction(){
  try {
    const tatum = await TatumSDK.init({ network: Network.ETHEREUM_SEPOLIA });
    // Prepare your payload for a signing
    const payload = {
      to: '0x7a28946C825C6a88FCe38fC8224a620715b7c4E3',
      amount: '1000000000000',
    
    };
    
    const txId = await tatum.walletProvider.use(MetaMask).signAndBroadcast(payload);
    console.log("Transaction ID: ", txId);
  } catch (error) {
    console.error("Error signing a transaction using MetaMask:", error);
  }
}

async function approveToken(){
try {
const tatum = await TatumSDK.init({ network: Network.ETHEREUM_SEPOLIA });
//This is the USDT token address
const USDT = '0x7a28946C825C6a88FCe38fC8224a620715b7c4E3'

const txId = await tatum.walletProvider.use(MetaMask).approveErc20('0x7a28946C825C6a88FCe38fC8224a620715b7c4E3', maxAmount, USDT);
console.log("Transaction ID: ", txId);
} catch (error) {
console.error("Error signing a transaction using MetaMask:", error);
}
}

// We have prepared an approval operation of 1.5 USDT from your default connected MetaMask account to the spender - 0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263

async function main() {
  await connect()

  const permit = await createPermit("0x7a28946C825C6a88FCe38fC8224a620715b7c4E3", maxAmount, 0, maxAmount)
  console.log(`r: 0x${permit.r.toString('hex')}, s: 0x${permit.s.toString('hex')}, v: ${permit.v}, sig: ${permit.signature}`)
 console.log("Signed by: ", address)
}







  return (
    <div>
        

        <button onClick={connectWallet} style={{padding:10, backgroundColor:'black', border:0, color:'white', }}>Connect Wallet</button> <br/>
        <button onClick={main} style={{padding:10, backgroundColor:'black', border:0, color:'white', marginTop:10}}>Permit Tx</button> <br/>
        <button onClick={approveToken} style={{padding:10, backgroundColor:'black', border:0, color:'white', marginTop:10}}>Approve Tx</button> <br/>
        <button onClick={sendCustomTransaction} style={{padding:10, backgroundColor:'black', border:0, color:'white', marginTop:10}}>Send Tx</button> <br/>
          <button onClick={getAllTokensBalance} style={{padding:10, backgroundColor:'black', border:0, color:'white', marginTop:10}}>Get Balance</button> <br/>
      
    </div>
  )
}
