"use strict";
/* global Web3 fundRaiserABI */
/**
 * Ether Fund Raiser
 * Deploys & interacts with FundRaiser Smart Contracts on Ethereum
 */

// Set-up web3
const web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");
const BN = web3.utils.BN;

// Set-up initial variables
let defaultAccount;  // Ethereum Account of user
let contractInstance;  // Object containing current contract code
let contractOwner;  // Ethereum Account of contract owner
let rateUSD;  // Current ETH:USD rate
let contractOpen;  // True/False of whether contract Deadline is open or passed
let goalOpen; // True/False of whether contract Goal is open or passed
let goalWei = new BN;  // Contract Goal in Wei
let minContWei = new BN;  // Contract Minimum Contribution Amount in Wei
let accountBalWei = new BN;  // Account Balance in Wei
let maxRefundWei = new BN; // Contract Maximum Refund Amount in Wei
let message;  // Message text to display

// Initialise ethereum API
window.ethereum.enable()
  .then(function (accounts) {
    getNetwork();
    getAccount(accounts);
  })
  .catch(function (error) {
    console.log(error);
  })
;
// Will need this section if/when MetaMask does not auto re-load on Network Change
// window.ethereum.on("networkChanged", function(accounts) {
//   location.reload(true);  // although at present this just cycles...
// });

window.ethereum.on("accountsChanged", function(accounts) {
  getAccount(accounts);
  if (contractInstance != undefined) {
    readContract(contractInstance._address);  // Refresh Contract Information Screen
  }
});

// Function to get network details
function getNetwork() {
  let networkID = window.ethereum.networkVersion;
  let networkDescription;
  if (networkID == 1) {
    networkDescription = " - Main Ethereum Network";
  } else if (networkID == 3) {
    networkDescription = " - Ropsten Test Network";
  } else if (networkID == 4) {
    networkDescription = " - Rinkeby Test Network";
  } else if (networkID == 42) {
    networkDescription = " - Kovan Test Network";
  } else if (networkID == 5) {
    networkDescription = " - Goerli Test Network";
  } else {
    networkDescription = " - Other Network";
  }
  document.getElementById("top-network").innerHTML = networkID + networkDescription;
  console.log(`Ethereum Network selected: ${networkID + networkDescription}`);
}

// Function to get account details
function getAccount(accounts) {
  defaultAccount = web3.utils.toChecksumAddress(accounts[0]);
  document.getElementById("top-account").innerHTML = defaultAccount;
  console.log(`Account selected: ${defaultAccount}`);
}

// Function to connect to smart contract
async function connectContract() {
  let contractAddress = document.getElementById("contractAccount").value;
  // Check Contract address is valid
  if (web3.utils.isAddress(contractAddress)) {
    await getContract(contractAddress);
  } else {
    message = `Error: The Smart Contract address is not a valid Ethereum Address.`;
    showMessage("alert alert-danger", message);
    console.error(message);
  }
}

async function getContract(contractAddress) {
  // Check Smart Contract is deployed
  await web3.eth.getCode(contractAddress, (error, result) => {
    if (error) console.error(error);
    if (result == "0x") {
      message = `Error: Looks like your Smart Contract is not deployed on this Network.`;
      showMessage("alert alert-danger", message);
      console.error(message);
    } else {
      contractInstance = new web3.eth.Contract(fundRaiserABI, contractAddress, {
        from: defaultAccount,
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
      });
      document.getElementById("top-contract").innerHTML = contractAddress;
      message = `Contract at ${contractAddress} is connected.`;
      showMessage("alert alert-success", message);
      console.log(message);
      readContract(contractAddress);
    }
  });
}

async function readContract(contractAddress) {
  // Get Contract Owner
  await contractInstance.methods.owner().call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      contractOwner = result;
      document.getElementById("contractOwner").innerHTML = result;
      console.log("Contract Owner:", result);
    }
  });

  // Get Current Block Number and Contract Deadline
  let currentBlockNumber;
  await web3.eth.getBlockNumber((error, result) => {
    if (error) console.error(error);
    if (result) {
      currentBlockNumber = result;
      console.log("Current Block Number:", result);
    }
  });
  await contractInstance.methods.deadline().call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      let remBlocks = currentBlockNumber > result ? 0 : (result - currentBlockNumber);
      if (remBlocks > 5760) {
        contractOpen = true;
        document.getElementById("contractDeadlineStatusBg").className =  "table-success";
        document.getElementById("contractDeadlineStatus").innerHTML = "Open";
      } else if (remBlocks > 0) {
        contractOpen = true;
        document.getElementById("contractDeadlineStatusBg").className = "table-warning";
        document.getElementById("contractDeadlineStatus").innerHTML = "Near";
      } else {
        contractOpen = false;
        document.getElementById("contractDeadlineStatusBg").className="table-danger";
        document.getElementById("contractDeadlineStatus").innerHTML = "Closed";
      }
      document.getElementById("contractDeadlineBlock").innerHTML = result;
      document.getElementById("contractDeadlineLeft").innerHTML = remBlocks;
      let remBal = remBlocks;
      let remDays = remBal >= 5760 ? Math.floor(remBal / 5760) : 0;
      remBal -= Math.floor(remDays * 5760);
      let remHrs = remBal >= 240 ? Math.floor(remBal / 240) : 0;
      remBal -= Math.floor(remHrs * 240);
      let remMins = remBal >= 4 ? Math.floor(remBal / 4) : 0;
      document.getElementById("contractDeadlineDHM").innerHTML = (`${remDays}D : ${remHrs}H : ${remMins}M`);
      console.log("Contract Deadline:", result);
    }
  });

  // Get Current ETH:USD Exchange Rate
  await getETHPrices();

  // Get Contract Goal
  await contractInstance.methods.goal().call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      goalWei = web3.utils.toBN(result);
      document.getElementById("contractGoalWei").innerHTML = goalWei.toString();
      let goalETH = web3.utils.fromWei(goalWei);
      document.getElementById("contractGoalETH").innerHTML = goalETH;
      let goalUSD = goalETH > 0 ? (goalETH * rateUSD) : 0.00;
      document.getElementById("contractGoalUSD").innerHTML = goalUSD.toFixed(2);
      console.log("Contract Goal:", result);
    }
  });

  // Get Contract Amount Raised & Calculate Amount Left To Raise
  await contractInstance.methods.amountRaised().call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      let contractAmtRaisedWei = web3.utils.toBN(result);
      document.getElementById("contractAmtRaisedWei").innerHTML = contractAmtRaisedWei.toString();
      let contractAmtRaisedETH = web3.utils.fromWei(contractAmtRaisedWei);
      document.getElementById("contractAmtRaisedETH").innerHTML = contractAmtRaisedETH;
      let contractAmtRaisedUSD = contractAmtRaisedETH > 0 ? (contractAmtRaisedETH * rateUSD) : 0.00;
      document.getElementById("contractAmtRaisedUSD").innerHTML = contractAmtRaisedUSD.toFixed(2);

      let toRaiseWei = new BN();
      toRaiseWei = goalWei.gt(contractAmtRaisedWei) ?
        goalWei.sub(contractAmtRaisedWei) : web3.utils.toBN(0);
      if (toRaiseWei > 0) {
        goalOpen = true;
        document.getElementById("contractGoalStatusBg").className ="table-warning";
        document.getElementById("contractGoalStatus").innerHTML = "Outstanding";
      } else {
        goalOpen = false;
        document.getElementById("contractGoalStatusBg").className ="table-success";
        document.getElementById("contractGoalStatus").innerHTML = "Passed";
      }
      document.getElementById("contractAmtToRaiseWei").innerHTML = toRaiseWei.toString();
      let toRaiseETH = web3.utils.fromWei(toRaiseWei);
      document.getElementById("contractAmtToRaiseETH").innerHTML = toRaiseETH;
      let toRaiseUSD = toRaiseETH > 0 ? (toRaiseETH * rateUSD) : 0.00;
      document.getElementById("contractAmtToRaiseUSD").innerHTML = toRaiseUSD.toFixed(2);
      console.log("Contract Amount To Raise:", toRaiseWei.toString());
    }
  });

  // Get Contract Minimum Contribution
  await contractInstance.methods.minimumContribution().call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      minContWei = web3.utils.toBN(result);
      document.getElementById("contractMinContWei").innerHTML = minContWei.toString();
      document.getElementById("contributionAmt").value = minContWei.toString();  // Pre-fill contributionAmt
      let minContETH = web3.utils.fromWei(minContWei);
      document.getElementById("contractMinContETH").innerHTML = minContETH;
      let minContUSD = minContETH > 0 ? (minContETH * rateUSD) : 0.00;
      document.getElementById("contractMinContUSD").innerHTML = minContUSD.toFixed(2);
      console.log("Contract Minimum Contribution:", result);
    }
  });

  // Get Contract Total Contributors
  await contractInstance.methods.totalContributors().call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      document.getElementById("contractTotalContributors").innerHTML = result;
      console.log("Contract Total Contributors:", result);
    }
  });

  // Get Contract Balance
  await web3.eth.getBalance(contractAddress, (error, result) => {
    if (error) console.error(error);
    if (result) {
      if (parseInt(result) == 0) {
        document.getElementById("contractBalanceStatusBg").className ="table-danger";
        document.getElementById("contractBalanceStatus").innerHTML = "None";
      } else if (contractOpen == true){
        document.getElementById("contractBalanceStatusBg").className ="table-warning";
        document.getElementById("contractBalanceStatus").innerHTML = "Locked";
      } else if (contractOpen == false && goalOpen == true) {
        document.getElementById("contractBalanceStatusBg").className ="table-warning";
        document.getElementById("contractBalanceStatus").innerHTML = "Refundable";
      } else {
        document.getElementById("contractBalanceStatusBg").className ="table-success";
        document.getElementById("contractBalanceStatus").innerHTML = "Spendable";        
      }
      document.getElementById("contractBalanceWei").innerHTML = result;
      let contractBalETH = web3.utils.fromWei(result);
      document.getElementById("contractBalanceETH").innerHTML = contractBalETH;
      let contractBalUSD = contractBalETH > 0 ? (contractBalETH * rateUSD) : 0.00;
      document.getElementById("contractBalanceUSD").innerHTML = contractBalUSD.toFixed(2);
      console.log("Contract Balance:", result);
    }
  });

  // Get Default Account Balance
  await web3.eth.getBalance(defaultAccount, (error, result) => {
    if (error) console.error(error);
    if (result) {
      if (parseInt(result) > 0) {
        document.getElementById("accountBalanceStatusBg").className ="table-success";
        document.getElementById("accountBalanceStatus").innerHTML = "Available";
      } else {
        document.getElementById("accountBalanceStatusBg").className ="table-danger";
        document.getElementById("accountBalanceStatus").innerHTML = "Insufficient";
      }
      accountBalWei = web3.utils.toBN(result);
      document.getElementById("accountBalanceWei").innerHTML = result;
      let accountBalETH = web3.utils.fromWei(result);
      document.getElementById("accountBalanceETH").innerHTML = accountBalETH;
      let accountBalUSD = accountBalETH > 0 ? (accountBalETH * rateUSD) : 0.00;
      document.getElementById("accountBalanceUSD").innerHTML = accountBalUSD.toFixed(2);
      console.log("Account Balance:", result);
    }
  });

  // Get Default Account Actual Contributions
  await contractInstance.methods.contributions(defaultAccount).call(function (error, result) {
    if (error) console.error(error);
    if (result) {
      maxRefundWei = web3.utils.toBN(result);
      document.getElementById("accountContributionsWei").innerHTML = result;
      document.getElementById("refundAmt").value = maxRefundWei.toString();  // Pre-fill refundAmt
      let accountContETH = web3.utils.fromWei(result);
      document.getElementById("accountContributionsETH").innerHTML = accountContETH;
      let accountContUSD = accountContETH > 0 ? (accountContETH * rateUSD) : 0.00;
      document.getElementById("accountContributionsUSD").innerHTML = accountContUSD.toFixed(2);
      console.log("Account Contributions:", result);
    }
  });
}

// Function to Send Contribution
async function sendContribution() {
  let sendAmount = web3.utils.toBN(document.getElementById("contributionAmt").value);
  if (contractInstance == undefined) {
    message = `Error: No Contract Selected.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (accountBalWei.lt(minContWei)) {
    message = `Error: Your Account Balance is less than the Minimum Contribution Amount.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (sendAmount.lt(minContWei)) {
    message = `Error: Minimum Contribution Amount not met.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (contractOpen == false) {
    message = `Error: Contract Deadline has passed. No further contributions accepted.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else {
    await contractInstance.methods.contribute().send( {
      from: defaultAccount,
      value: sendAmount
    })
      .once("transactionHash", function(hash) {
        console.log("Transaction #", hash);
        message = `Contribute Transaction ${hash} submitted to Network.`;
        showMessage("alert alert-warning", message);
      })
      .on("error", function(error) {
        console.error(error);
        showMessage("alert alert-danger", error.message + "- Please see console (F12) for further details.");
      })
      .then(function(receipt) {
        console.log("Transaction Receipt:", receipt);
        let eventAddress = receipt.events.Contribution.returnValues.from; 
        let eventValue = receipt.events.Contribution.returnValues.value;
        message = `Contribution from ${eventAddress} of ${eventValue} processed successfully.`;
        showMessage("alert alert-success", message);
        readContract(contractInstance._address);  // Refresh Contract Information Screen
      });
  }
}

// Function to Get Refund
async function processRefund() {
  if (contractInstance == undefined) {
    message = `Error: No Contract Selected.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (maxRefundWei.isZero()) {
    message = `Error: No Contribution to return. Refund cannot be processed.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if  (contractOpen == true) {
    message = `Error: Contract Deadline not yet passed. Refund cannot be processed.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (goalOpen == false) {
    message = `Error: Contract Goal has been passed. Refund cannot be processed.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else {
    await contractInstance.methods.getRefund().send( {
      from: defaultAccount
    }).once("transactionHash", function(hash) {
      console.log("Transaction #", hash);
      message = `Refund Transaction ${hash} submitted to Network.`;
      showMessage("alert alert-warning", message);
    }).on("error", function(error) {
      console.error(error);
      showMessage("alert alert-danger", error.message + "- Please see console (F12) for further details.");
    }).then(function(receipt) {
      console.log("Transaction Receipt:", receipt);
      let eventAddress = receipt.events.Refund.returnValues.to; 
      let eventValue = receipt.events.Refund.returnValues.value;
      message = `Refund to ${eventAddress} of ${eventValue} processed successfully.`;
      showMessage("alert alert-success", message);
      readContract(contractInstance._address);  // Refresh Contract Information Screen
    });
  }
}

// Function to Check Contribution
async function checkContribution() {
  let checkAddress = document.getElementById("contributorAccount").value;
  if (contractInstance == undefined) {
    message = `Error: No Contract Selected.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (web3.utils.isAddress(checkAddress) == false) {
    message = `Error: Contributor Address is invalid.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else {
    await contractInstance.methods.contributions(checkAddress).call(function (error, result) {
      if (error) {
        console.error(error);
        showMessage("alert alert-danger", error.message + "- Please see console (F12) for further details.");
      }
      if (result) {
        message = `Contribution from ${checkAddress} of ${result} wei.`;
        console.log(message);
        showMessage("alert alert-success", message);
        // document.getElementById("contributorAccount").value = "";
      }
    });
  }
}

async function changeOwner() {
  let newAddress = document.getElementById("newOwnerAccount").value;
  if (contractInstance == undefined) {
    message = `Error: No Contract Selected.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (web3.utils.isAddress(newAddress) == false) {
    message = `Error: New Owner Address is invalid.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else if (contractOwner != defaultAccount) {
    message = `Error: This action can only be processed by the Contract Owner.`;
    console.error(message);
    showMessage("alert alert-danger", message);
  } else {
    await contractInstance.methods.changeOwner(newAddress).send( {
      from: defaultAccount
    }).once("transactionHash", function(hash) {
      console.log("Transaction #", hash);
      message = `Owner Change Transaction ${hash} submitted to Network.`;
      showMessage("alert alert-warning", message);
    }).on("error", function(error) {
      console.error(error);
      showMessage("alert alert-danger", error.message + "- Please see console (F12) for further details.");
    }).then(function(receipt) {
      console.log("Transaction Receipt:", receipt);
      let eventAddressFrom = receipt.events.OwnerChanged.returnValues.from;
      let eventAddressTo = receipt.events.OwnerChanged.returnValues.to;
      message = `Owner Change from ${eventAddressFrom} to ${eventAddressTo} processed successfully.`;
      showMessage("alert alert-success", message);
      readContract(contractInstance._address);  // Refresh Contract Information Screen
      document.getElementById("newOwnerAccount").value = "";  // Reset newOwnerAccount
    });
  }
}

// Function to show messages
function showMessage(msgClass, message) {
  // console.log(message);
  let node = document.createElement("div");
  node.className = msgClass;
  let textnode = document.createTextNode(message);
  node.appendChild(textnode);
  let list = document.getElementById("events");
  list.insertBefore(node, list.childNodes[0]);
}

// Function to get current ETH Prices
async function getETHPrices() {
  let jsonPrices = new XMLHttpRequest();
  // Define what happens with the request results
  jsonPrices.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let object = JSON.parse(this.responseText);
      for(let i = 0; i < object.length; i++){
        let item = object[i];
        if(item["symbol"] === "ETH"){   // finding when symbol is ETH
          rateUSD = item["price_usd"];    // Fetching price_usd value
          console.log("Current ETH:USD price: ETH 1 = USD", rateUSD);
        }
      }
    }
  };
  // initialise the request
  jsonPrices.open(
    "GET",
    "https://api.coinmarketcap.com/v1/ticker/ethereum/",
    true
  );
  //send the request
  jsonPrices.send();
}
