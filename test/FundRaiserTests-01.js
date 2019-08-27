"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 01
 * Covers Contract Set-up
 * @author: Mark Kensington
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("01 - Contract Set-up", async(accounts) => {
  
  it("Deadline set", async() => {
    let instance = await FundRaiser.new("100", "10000000000000000000", "1000000000000000000");
    let currentBlockNumber = await web3.eth.getBlockNumber();

    let deadline = await instance.deadline();
    assert.equal(deadline, currentBlockNumber + 100);
  });

  it("Goal set", async() => {
    let instance = await FundRaiser.new("100", "10000000000000000000", "1000000000000000000");

    let goal = await instance.goal();
    assert.equal(goal, 10000000000000000000);
  });

  it("Minimun contribution set", async() => {
    let instance = await FundRaiser.new("100", "10000000000000000000", "1000000000000000000");

    let minimumContribution = await instance.minimumContribution();
    assert.equal(minimumContribution, 1000000000000000000);
  });

  it("Owner set", async() => {
    let instance = await FundRaiser.new("100", "10000000000000000000", "1000000000000000000");

    let owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  it("Contract does not allow fallback", async() => {
    let instance = await FundRaiser.new("100", "10000000000000000000", "1000000000000000000");

    try {
      await instance.sendTransaction("123");
      assert.fail("Contract does not allow Fallback. Transaction should fail!");
    } catch (err) {
      assert(err.toString().includes("Fallback method not allowed"), "Message: " + err);
    }
  });
  
});