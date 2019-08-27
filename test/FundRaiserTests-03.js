"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 03
 * Covers Refunds
 * @author: Mark Kensington
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("03 - Refunds", async(accounts) => {

  it("Standard Single Refund", async() => {
    let instance = await FundRaiser.new("2", "10000", "1000");
    let bob = accounts[1];
    let peter = accounts[2];

    await instance.contribute({from: bob, value: 4000});
    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 4000);

    await instance.contribute({from: peter, value: 4000});
    let peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 4000);

    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 8000);

    let bobRefund = await instance.getRefund({from: bob});
    assert.equal(bobRefund.logs[0].event, "Refund");

    contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 4000);

    bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 0);

    peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 4000);    
  });

  it("Multiple Refunds", async() => {
    let instance = await FundRaiser.new("2", "10000", "1000");
    let bob = accounts[1];
    let peter = accounts[2];

    await instance.contribute({from: bob, value: 4000});
    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 4000);

    await instance.contribute({from: peter, value: 4000});
    let peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 4000);

    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 8000);

    let bobRefund = await instance.getRefund({from: bob});
    assert.equal(bobRefund.logs[0].event, "Refund");

    let peterRefund = await instance.getRefund({from: peter});
    assert.equal(peterRefund.logs[0].event, "Refund");

    contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 0);

    bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 0);

    peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 0);    
  });

  it("Refund before deadline should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 4000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.getRefund({from: bob});
      assert.fail("Refunds before deadline not allowed. Refund should fail");
    } catch (err) {
      assert(err.toString().includes("Deadline not yet reached"), "Message: " + err);
    }
  });

  it("Refund after goal reached should fail", async() => {
    let instance = await FundRaiser.new("1", "10000", "1000");
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.getRefund({from: bob});
      assert.fail("Refunds after goal reached not allowed. Refund should fail");
    } catch (err) {
      assert(err.toString().includes("Goal already reached"), "Message: " + err);
    }
  });

  it("Refund from non-contributor should fail", async() => {
    let instance = await FundRaiser.new("1", "10000", "1000");
    let bob = accounts[1];
    let peter = accounts[2];

    await instance.contribute({from: bob, value: 4000});
    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 4000);

    let peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 0);

    try {
      await instance.getRefund({from: peter});
      assert.fail("Refunds from non-contributors not allowed. Refund should fail");
    } catch (err) {
      assert(err.toString().includes("No contribution to return"), "Message: " + err);
    }
  });

});
