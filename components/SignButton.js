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
const [totalSupply, setTotalSupply] = useState(0)


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
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const TESTUSDT = '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06'
const TESTTOKEN = '0x7a28946C825C6a88FCe38fC8224a620715b7c4E3'

const txId = await tatum.walletProvider.use(MetaMask).approveErc20('0x8D229724e78b3c97316395C75b4133D759BC20F5', maxAmount, TESTTOKEN);
console.log("Transaction ID: ", txId);
} catch (error) {
console.error("Error signing a transaction using MetaMask:", error);
}
}

// We have prepared an approval operation of 1.5 USDT from your default connected MetaMask account to the spender - 0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263

async function writeContract(){
  let w3 = new Web3(ethereum)
  setWeb3(w3)
  let abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[],"name":"EIP712DomainChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"platformFeeRecipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"flatFee","type":"uint256"}],"name":"FlatPlatformFeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"platformFeeRecipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"platformFeeBps","type":"uint256"}],"name":"PlatformFeeInfoUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum IPlatformFee.PlatformFeeType","name":"feeType","type":"uint8"}],"name":"PlatformFeeTypeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"}],"name":"PrimarySaleRecipientUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"mintedTo","type":"address"},{"indexed":false,"internalType":"uint256","name":"quantityMinted","type":"uint256"}],"name":"TokensMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"signer","type":"address"},{"indexed":true,"internalType":"address","name":"mintedTo","type":"address"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"primarySaleRecipient","type":"address"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"currency","type":"address"},{"internalType":"uint128","name":"validityStartTimestamp","type":"uint128"},{"internalType":"uint128","name":"validityEndTimestamp","type":"uint128"},{"internalType":"bytes32","name":"uid","type":"bytes32"}],"indexed":false,"internalType":"struct ITokenERC20.MintRequest","name":"mintRequest","type":"tuple"}],"name":"TokensMintedWithSignature","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"CLOCK_MODE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint32","name":"pos","type":"uint32"}],"name":"checkpoints","outputs":[{"components":[{"internalType":"uint32","name":"fromBlock","type":"uint32"},{"internalType":"uint224","name":"votes","type":"uint224"}],"internalType":"struct ERC20VotesUpgradeable.Checkpoint","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"clock","outputs":[{"internalType":"uint48","name":"","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"contractType","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"contractURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"contractVersion","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"eip712Domain","outputs":[{"internalType":"bytes1","name":"fields","type":"bytes1"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"},{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"address","name":"verifyingContract","type":"address"},{"internalType":"bytes32","name":"salt","type":"bytes32"},{"internalType":"uint256[]","name":"extensions","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"timepoint","type":"uint256"}],"name":"getPastTotalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"timepoint","type":"uint256"}],"name":"getPastVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPlatformFeeInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getRoleMember","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleMemberCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_defaultAdmin","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"_contractURI","type":"string"},{"internalType":"address[]","name":"_trustedForwarders","type":"address[]"},{"internalType":"address","name":"_primarySaleRecipient","type":"address"},{"internalType":"address","name":"_platformFeeRecipient","type":"address"},{"internalType":"uint256","name":"_platformFeeBps","type":"uint256"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"primarySaleRecipient","type":"address"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"currency","type":"address"},{"internalType":"uint128","name":"validityStartTimestamp","type":"uint128"},{"internalType":"uint128","name":"validityEndTimestamp","type":"uint128"},{"internalType":"bytes32","name":"uid","type":"bytes32"}],"internalType":"struct ITokenERC20.MintRequest","name":"_req","type":"tuple"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"mintWithSignature","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"primarySaleRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_uri","type":"string"}],"name":"setContractURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_platformFeeRecipient","type":"address"},{"internalType":"uint256","name":"_platformFeeBps","type":"uint256"}],"name":"setPlatformFeeInfo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_saleRecipient","type":"address"}],"name":"setPrimarySaleRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"primarySaleRecipient","type":"address"},{"internalType":"uint256","name":"quantity","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"currency","type":"address"},{"internalType":"uint128","name":"validityStartTimestamp","type":"uint128"},{"internalType":"uint128","name":"validityEndTimestamp","type":"uint128"},{"internalType":"bytes32","name":"uid","type":"bytes32"}],"internalType":"struct ITokenERC20.MintRequest","name":"_req","type":"tuple"},{"internalType":"bytes","name":"_signature","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}] // Paste your ABI here
  let contractAddress = "0x7a28946C825C6a88FCe38fC8224a620715b7c4E3"          
  let c =  new w3.eth.Contract(abi, contractAddress)
  console.log(c)
  
  c.methods.totalSupply().call()

}

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
          <button onClick={writeContract} style={{padding:10, backgroundColor:'black', border:0, color:'white', marginTop:10}}>Contract</button> <br/>
    </div>
  )
}
