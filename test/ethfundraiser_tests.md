# Test scenarios checked for ethfundraiser front-end

Last check date: 27/01/2020 @ 16:30

## 00 - Startup & Home Page
- 00-01 - Connect to Metamask / Error if does not exist - Passed
- 00-02 - Connect to Metamask / Error if disallowed - FAILED - Now Fixed
- 00-03 - Connect to Metamask shows Network / Account if allowed - Passed
- 00-04 - Change Metamask Network changes Network details - Passed
- 00-05 - Change Metamask Account change Account details - Passed
- 00-06 - Click on all hyperlinks on Home page works - Passed

## 01 - New Contract Page, including FRTests-01 - Setup/Deploy
- 01-01 - Block Converter works as expected - Passed
- 01-02 - Wei Converter works as expected - Passed
- 01-03 - Blank or Negative Duration gives error - Passed
- 01-04 - Duration over 1063210 gives error - Passed
- 01-05 - Blank or Negative IPDuration gives error - Passed
- 01-06 - Duration over 531605 gives error - Passed
- 01-07 - Blank or Negative Goal gives error - Passed
- 01-08 - Blank or Negative Min Contribution gives error - Passed
- 01-09 - Normal Deploy Rejected in MetaMask gives error - Passed
- 01-10 - Normal Deploy works OK (including hyperlinks & server log) and Existing Contract Screen updated correctly - Passed
- 01-11 - Email Link Works - Passed
- 01-12 - Change Owner to blank, address 0 or invalid address gives error - FAILED - Does not clear account field & give account field in error message - Now Fixed
- 01-13 - Change Owner to self gives error - FAILED - Now Fixed
- 01-14 - Change Owner to another account works OK (including hyperlinks & server log) and Existing Contract Screen updated correctly - Passed
- 01-15 - Try to change owner again (now no longer owner) gives error - Passed
- 01-16 - Normal Deploy with longer duration & larger amounts on different network Works - FAILED. Top Smart Contract is not hyperlinked - Now Fixed

## 02 - Existing Contract Page, including FRTests-02 - Contributions
- 02.01 - Blank address gives error on ALL buttons - Passed
- 02.02 - Address 0 or invalid address gives error - Passed
- 02.03 - Correct address but on different network gives error - Passed
- 02.04 - Normal Get Details works OK (including hyperlinks & server log) and Existing Contract Screen updated correctly - Passed
- 02.05 - Repeat for blank Get Details gives error and refreshes all fields - Passed
- 02.06 - Change Accounts and make 50% contribution works OK (including hyperlinks & server log) and Existing Contract Screen updated correctly - Passed
- 02.07 - Make another 30% contribution from same account works OK (including hyperlinks & server log) and Existing Contract Screen & Spending Request/Number of Voters updated correctly - Passed
- 02.08 - Make another 30% contribution from a different account works OK (including hyperlinks & server log) and Existing Contract Screen & Spending Request/Number of Voters updated correctly - Passed
- 02.09 - Make Contribution below minimum level gives error - Passed
- 02.10 - Contribution from account with zero balance gives error - Passed
- 02.11 - Change to contract passed its deadline and contribute  gives error - Passed
- 02.12 - Check Contribution from Address 0 or invalid address gives error - FAILED - Does not clear account field & give account field in error message - Now Fixed
- 02.13 - Check Contribution from valid Contributor and Non-Contributor works OK - Passed
- 02.14 - Create contract with 0 minimum contribution and contribution of 0 gives error - FAILED - no error check for blank/zero amount of contribution - Now Fixed

## 03 - Existing Contract Page, including FRTests-03 - Refunds
- 03.01 - Create short (10) contract & make 2 diff contributions from different accounts below goal. Refund before deadline give errors - Passed
- 03.02 - Refund from non-contributor gives error - Passed
- 03.03 - Wait for deadline to pass then Standard Refund for both contributors works OK (including hyperlinks & server log) and Existing Contract Screen updated correctly - Passed
- 03.04 - Create short (10) contract, make contribution of goal amount. Refund after deadline but before IP deadline gives error - Passed
- 03.05 - Refund after deadline and after IP deadline works OK (including hyperlinks & server log) and Existing Contract Screen updated correctly - Passed
- 03.06 - Create short (10) contract, make contribution of goal amount, raise SR for 50%, Vote for SR and pay SR. Refund after IP deadline gives error - Passed

## 04 - Spending Requests Page, including FRTests-04 - Spending Requests
- 04.01 - No contract selected and blank spending request gives contract error on Get Details, Check if Voted & Create Request - Passed
- 04.02 - No contract selected and blank spending request gives no spending request error on Pay Request & Vote for Request - Passed
- 04.03 - Create short (10) contract and try to create a spending request gives error - Passed
- 04.04 - Make contribution of goal amount, and select blank spending request gives error on ALL buttons - Passed
- 04.05 - Enter non-existant spending request gives error - Passed
- 04.05 - Blank Description and Create Request gives error - Passed
- 04.06 - Blank or 0 Request Value gives error - Passed
- 04.07 - Request Value of greater than contract balance gives error - Passed
- 04.08 - Recipient Account of Address 0, blank or invalid address gives error - Passed
- 04.09 - Change to non-owner and create normal spending request gives error - Passed
- 04.10 - Change to owner and Standard Spending Request works OK (including hyperlinks & server log) and Spending Request Screen & Existing Contract/Number of Spending Requests updated correctly - Passed
- 04-11 - Email Link Works - Passed
- 04.12 - Change Recipient Account and create Spending Request for 50% works OK, but with warning message (including hyperlinks & server log) and Spending Request Screen & Existing Contract/Number of Spending Requests updated correctly - Passed
- 04.13 - Display existing spending request and then create new contract clears spending request page - FAILED as page not cleared - Now Fixed

## 05 - Spending Requests Page, including FRTests-05 - Voting
- 05.01 - Create short (10) contract, make contribution of goal amount, and raise 2 SRs for 60% each. Connect as non-contributor, get request details and Vote for Request gives error - Passed
- 05.02 - Connect as contributor and Vote for first Request works OK (including hyperlinks & server log) and Spending Request Screen updated correctly - Passed
- 05.03 - Select second Request as same account and Vote for Request works OK (including hyperlinks & server log) and Spending Request Screen updated correctly - Passed
- 05.04 - Vote again for same Request gives error - Passed
- 05.05 - Check Voted from Address 0 or invalid address gives error - FAILED as Account field not blanked.  Now Fixed
- 05.06 - Check Contribution for contributor gives positive event message - Passed
- 05.07 - Check Contribution for non-contributor gives negative event message - Passed

## 06 - Spending Requests Page, including FRTests-06 - Payment Release
- 06.01 - Either load above contract as owner or repeat steps 05.01, 05.03 & 05.04. Connect as non-owner, get request details and Pay Request gives error - Passed
- 06.02 - Connect as owner and Pay Request works OK (including hyperlinks & server log) and Spending Request Screen & Existing Contract/Amount Paid Out updated correctly - Passed
- 06.03 - Attempt to Pay Same Request gives error - Passed
- 06.04 - Select 2nd request and attempt to Pay Request (which is now above contract balance) gives error - Passed
- 06.05 - Create new spending request for remaining balance, vote and Pay Request works OK (including hyperlinks & server log) and Spending Request Screen & Existing Contract/Amount Paid Out updated correctly - Passed
- 06.07 - Create short (10) contract, make 3 contributions up to goal amount, and raise SR for total. Vote from first account and attempt to Pay Request gives error - Passed
- 06.08 - Vote from second account and Pay Request works OK - Passed

## 07 - Other tests
- 07.01 - FRTests-07 - SafeMath Tests implicitly checked as part of above so no additional test scenarios created
- 07.02 - Run above tests across ALL Test Networks - Done for Goerli


Test for "Clear" Functions and any others not tested
- Add function names in above to check

Add error details to above
Include additional clear functions when errors occur



Connect to non-updated node and check error message on block times