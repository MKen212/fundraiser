"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 03
 * Covers Refunds
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("03 - Refunds", async(accounts) => {

  it("Standard Single Refund", async() => {
    let instance = await FundRaiser.new("2", "10", "10000", "1000");
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
    let instance = await FundRaiser.new("2", "10", "10000", "1000");
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

  it("Refund after goal reached and after initialPaymentDeadline has passed", async() => {
    let instance = await FundRaiser.new("2", "3", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];
  
    await instance.contribute({from: bob, value: 5000});
    let bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 5000);

    await instance.contribute({from: peter, value: 5000});
    let peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 5000);

    let contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 10000);

    let request = await instance.createRequest("Request 01", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote1 = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote1.logs[0].event, "Vote");

    let vote2 = await instance.voteForRequest(0, {from: peter});
    assert.equal(vote2.logs[0].event, "Vote");

    let amountPaidOut = await instance.amountPaidOut();
    assert.equal(amountPaidOut, 0);

    let bobRefund = await instance.getRefund({from: bob});
    assert.equal(bobRefund.logs[0].event, "Refund");
  
    contractBalance = await web3.eth.getBalance(instance.address);
    assert.equal(contractBalance, 5000);
  
    bobContributions = await instance.contributions(bob);
    assert.equal(bobContributions, 0);
  
    peterContributions = await instance.contributions(peter);
    assert.equal(peterContributions, 5000);    
  });

  it("Refund from non-contributor should fail", async() => {
    let instance = await FundRaiser.new("1", "10", "10000", "1000");
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

  it("Refund before deadline should fail", async() => {
    let instance = await FundRaiser.new("100", "10", "10000", "1000");
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

  it("Refund after goal reached and payments made should fail", async() => {
    let instance = await FundRaiser.new("1", "1", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 01", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let vote = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote.logs[0].event, "Vote");

    let paymentRelease = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease.logs[0].event, "PaymentReleased");

    let amountPaidOut = await instance.amountPaidOut();
    assert.equal(amountPaidOut, 10000);

    try {
      await instance.getRefund({from: bob});
      assert.fail("Refunds after goal reached and payments made not allowed. Refund should fail");
    } catch (err) {
      assert(err.toString().includes("Payments have already been made"), "Message: " + err);
    }
  });

  it("Refund after goal reached and before initialPaymentDeadline should fail", async() => {
    let instance = await FundRaiser.new("1", "10", "10000", "1000");
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.getRefund({from: bob});
      assert.fail("Refunds after goal reached but before initialPaymentDeadline not allowed. Refund should fail");
    } catch (err) {
      assert(err.toString().includes("Initial Payment Deadline not yet reached"), "Message: " + err);
    }
  });

});