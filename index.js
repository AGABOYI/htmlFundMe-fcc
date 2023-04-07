// Before trying to connect to a blockchain , assuming we are only using ethereum here ,
// we have to check if the user
// has metamask installed

// NB: When it comes to develop frontent java script ,
// The syntaxe is a bit different to node js ( the syntaxe that we used in node js to test and deploy our smart contract)
// more precisely one of the difference is : in front end javascript, we can not use require , we have to use import.

import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("I see a Metamask")
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected"
  } else {
    console.log("No metamask!!")
    connectButton.innerHTML = "Pleaase install Metamask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  // console.log(`Fundind with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    // To send a transaction what do we absolutely need ?
    // need provider :connection to the blockchain
    // need signer / wallet / someone with some gas
    // need the contract we are interacting with , for that remenber , we will need the ABI & address

    // WebProvider ici c'est un object qui nous facilite la tache pour se connecter au network endpoint un peu comme
    // cetait le cas avec alchemy , ici il ira lui-meme dans metamask et regarder le network auquel nous sommes connectes
    // puis va nous retourner le http ( jsonRcp) de ce network
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // this will return the wallet or account connected to the provider
    const signer = provider.getSigner()
    console.log(signer)
    // time to interact with our contract, for that we will first create a constant file (check constants file)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // Now let's listen to the tx to be mined
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Done!!!")
    } catch (error) {
      console.log(error)
    }
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  // With ethers , in the ethers documentation we can listen to transactionResponce or event using the "once" function below
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations}confirmations`
      )
      resolve()
    })
  })
}
