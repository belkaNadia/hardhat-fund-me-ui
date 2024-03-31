import { ABI, ADDRESS } from "./constants.js";
import { ethers } from "./ethers-5.1.esm.min.js";

const connectButton = document.getElementById("connect");
const fundButton = document.getElementById("fund");
const balanceButton = document.getElementById("balance");
const withdrawButton = document.getElementById("withdraw");
connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", () => fund());
balanceButton.addEventListener("click", () => getBalance());
withdrawButton.addEventListener("click", () => withdraw());

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log("Connected with address:", address);
  } else {
    console.log("Please install MetaMask!");
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log("Funding", ethAmount, "ETH");
  if (typeof window.ethereum !== "undefined") {
    //provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); //return wallet
    console.log("Signer", signer);
    const contract = new ethers.Contract(ADDRESS, ABI, signer);
    try {
      const transaction = await contract.fund({
        value: ethers.utils.parseEther(ethAmount.toString()),
      });
      await listenForTransaction(transaction, provider);
    } catch (error) {
      console.log("Error", error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum === "undefined") {
    console.log("Please install MetaMask!");
    return;
  } else {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    console.log("Balance", ethers.utils.formatEther(balance), "ETH");
  }
}

async function withdraw() {
  if (typeof window.ethereum === "undefined") {
    console.log("Please install MetaMask!");
    return;
  } else {
    console.log("Withdrawing");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(ADDRESS, ABI, signer);
    try {
      const transaction = await contract.cheaperWithdraw();
      await listenForTransaction(transaction, provider);
    } catch (error) {
      console.log("Error", error);
    }
  }
}

function listenForTransaction(transaction, provider) {
  console.log("Mining", transaction.hash);
  return new Promise((resolve, reject) => {
    provider.once(transaction.hash, (receipt) => {
      if (receipt.status === 1) {
        console.log("Mined", transaction.hash);
        resolve(receipt);
      } else {
        reject(new Error("Transaction failed"));
      }
    });
  });
}
