"use strict";
//* global web3 */
/**
 * FundRaiser - Test Scripts 04
 * Covers Spending Requests
 * @author: Mark Kensington
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");

contract("04 - Spending Requests", async(accounts) => {

  it("Standard Single Spending Request", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 01", "10000", alice, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let requestDetails = await instance.requests(0);
    assert.equal(requestDetails.description, "Request 01");
    assert.equal(requestDetails.value, 10000);
    assert.equal(requestDetails.recipient, alice);
    assert.equal(requestDetails.completed, false);
    assert.equal(requestDetails.numberOfVoters, 0);
  });

  it("Multiple Spending Requests", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request01 = await instance.createRequest("Request 01", "8000", alice, {from: alice});
    assert.equal(request01.logs[0].event, "RequestCreated");

    let requestDetails01 = await instance.requests(0);
    assert.equal(requestDetails01.description, "Request 01");
    assert.equal(requestDetails01.value, 8000);
    assert.equal(requestDetails01.recipient, alice);
    assert.equal(requestDetails01.completed, false);
    assert.equal(requestDetails01.numberOfVoters, 0);

    let request02 = await instance.createRequest("Request 02", "4000", alice, {from: alice});
    assert.equal(request02.logs[0].event, "RequestCreated");

    let requestDetails02 = await instance.requests(1);
    assert.equal(requestDetails02.description, "Request 02");
    assert.equal(requestDetails02.value, 4000);
    assert.equal(requestDetails02.recipient, alice);
    assert.equal(requestDetails02.completed, false);
    assert.equal(requestDetails02.numberOfVoters, 0);
  });

  it("Spending Request to different recipient", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];
    let peter = accounts[2];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request = await instance.createRequest("Request 01", "10000", peter, {from: alice});
    assert.equal(request.logs[0].event, "RequestCreated");

    let requestDetails = await instance.requests(0);
    assert.equal(requestDetails.description, "Request 01");
    assert.equal(requestDetails.value, 10000);
    assert.equal(requestDetails.recipient, peter);
    assert.equal(requestDetails.completed, false);
    assert.equal(requestDetails.numberOfVoters, 0);
  });

  it ("Spending Request of zero value should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 01", "0", alice, {from: alice});
      assert.fail("Spending Request of zero value not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request value cannot be zero"), "Message: " + err);
    }
  });

  it ("Spending Request from non-owner should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 01", "10000", alice, {from: bob});
      assert.fail("Spending Request from non-owner not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Caller is not the contract owner"), "Message: " + err);
    }
  });

  it ("Spending Request before goal reached should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 4000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 01", "1000", alice, {from: alice});
      assert.fail("Spending Request before goal reached not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Goal is not yet reached"), "Message: " + err);
    }
  });

  it ("Spending Request value above amount raised should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 01", "11000", alice, {from: alice});
      assert.fail("Spending Request above amount raised not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request value greater than amount raised"), "Message: " + err);
    }
  });

  it ("Spending Request value above amount available should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    let request01 = await instance.createRequest("Request 01", "6000", alice, {from: alice});
    assert.equal(request01.logs[0].event, "RequestCreated");

    let vote01 = await instance.voteForRequest(0, {from: bob});
    assert.equal(vote01.logs[0].event, "Vote");

    let paymentRelease01 = await instance.releasePayment(0, {from: alice});
    assert.equal(paymentRelease01.logs[0].event, "PaymentReleased");
    
    try {
      await instance.createRequest("Request 02", "5000", alice, {from: alice});
      assert.fail("Spending Request above amount available not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Spending request value greater than amount available"), "Message: " + err);
    }
  });

  it ("Spending Request recipient of address zero should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let alice = accounts[0];
    let bob = accounts[1];

    let contribution = await instance.contribute({from: bob, value: 10000});
    assert.equal(contribution.logs[0].event, "Contribution");

    try {
      await instance.createRequest("Request 01", "10000", "0x0000000000000000000000000000000000000000", {from: alice});
      assert.fail("Spending Request recipient of address zero not allowed. Request creation should fail");
    } catch (err) {
      assert(err.toString().includes("Invalid Recipient of address zero"), "Message: " + err);
    }
  });

});