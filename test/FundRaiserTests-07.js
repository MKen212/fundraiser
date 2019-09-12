"use strict";
/* global web3 */
/**
 * FundRaiser - Test Scripts 06
 * Covers SafeMath Functions
 * NOTE: These tests require the testAdd & testSub functions from FundRaiser.sol
 * to be un-commented in order to expose the internal library functions
 */

const assert = require("assert");
const FundRaiser = artifacts.require("FundRaiser");
const BN = web3.utils.BN;

contract("07 - SafeMath Functions", async() => {

  it("Standard addition", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    
    let result = await instance.testAdd(2, 3);
    assert.equal(result.valueOf(), 5);
  });

  it("Addition overflow should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");
    let maxUINT256 = new BN("2").pow(new BN("256")).sub(new BN("1"));

    try {
      await instance.testAdd(maxUINT256, 1);
      assert.fail("Overflow not allowed. Addition should fail!");
    } catch (err) {
      assert(err.toString().includes("SafeMath: addition overflow"), "Message: " + err);
    }
  });

  it("Standard subtraction", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");

    let result = await instance.testSub(5, 3);
    assert.equal(result.valueOf(), 2);
  });

  it("Subtraction resulting in negative number should fail", async() => {
    let instance = await FundRaiser.new("100", "10000", "1000");

    try {
      await instance.testSub(1, 2);
      assert.fail("Subtraction to negative value not allowed. Subtraction should fail!");
    } catch (err) {
      assert(err.toString().includes("SafeMath: subtraction overflow"), "Message: " + err);
    }
  });

});
