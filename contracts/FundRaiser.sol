pragma solidity ^0.5.0;

/**
 * @title FundRaiser Smart Contract
 * @dev Contract used to raise funds and distribute based on contributors voting
 */
contract FundRaiser {
  using SafeMath for uint256;
  // Initial set-up of Struct for Spending Request
  struct Request {
    string description;
    uint256 value;
    address payable recipient;
    bool completed;
    uint256 numberOfVoters;
    mapping(address => bool) voters;
  }

  // Initial storage variables
  uint256 public totalContributors;  // Total number of contributors
  uint256 public minimumContribution;  // Minimum contribution value
  uint256 public deadline;  // Deadline Block Number for fundraising campaign
  uint256 public goal;  // Total amount needing to be raised
  uint256 public amountRaised;  // Total amount actually raised
  address public owner;  // Project Owner

  Request[] public requests;

  mapping(address => uint256) public contributions;

  event Contribution(address indexed from, uint256 value);
  event Refund(address indexed to, uint256 value);
  event RequestCreated(address indexed from, uint256 requestId, string description, uint256 value, address recipient);
  event Vote(address indexed from, uint256 requestId);
  event PaymentReleased(address indexed from, uint256 requestId, uint256 value, address recipient);

  constructor(uint256 _duration, uint256 _goal, uint256 _minimumContribution) public {
    deadline = block.number + _duration;
    goal = _goal;
    minimumContribution = _minimumContribution;
    owner = msg.sender;
  }

/**
   * @dev Function Modifiers to restrict:
   * @dev - onlyOwner - Can only be processed by the contract owner
   * @dev - goalReached - Can only be processed if the contract goal is reached
   */
  modifier onlyOwner {
    require(msg.sender == owner, "Caller is not the contract owner");
    _;
  }

  modifier goalReached {
    require(amountRaised >= goal, "Goal is not yet reached");
    _;
  }

  /**
   * @dev Fallback Function not allowed
   */
  function() external {
    revert("Fallback method not allowed");
  }

  /**
   * @dev Process a Contribution
   * @dev Require that minimum contribution value is met and deadline is not passed
   */
  function contribute() public payable returns (bool) {
    require(msg.value >= minimumContribution, "Minimum Contribution level not met");
    require(block.number <= deadline, "Deadline is passed");

    // Check if it is the first time the contributor is contributing
    if(contributions[msg.sender] == 0) {
      totalContributors = totalContributors.add(1);
    }
    contributions[msg.sender] = contributions[msg.sender].add(msg.value);
    amountRaised = amountRaised.add(msg.value);
    emit Contribution(msg.sender, msg.value);
    return true;
  }

  /**
   * @dev Process a Refund
   * @dev Require that deadline has passed, goal was not reached and contribution exists
   */
  function getRefund() public returns (bool) {
    require(block.number > deadline, "Deadline not yet reached");
    require(amountRaised < goal, "Goal already reached");
    require(contributions[msg.sender] > 0, "No contribution to return");

    msg.sender.transfer(contributions[msg.sender]);
    emit Refund(msg.sender, contributions[msg.sender]);
    contributions[msg.sender] = 0;
    return true;
  }

  /**
   * @dev Create a spending request
   * @dev Require that value does not exceed total amount raised
   */
  function createRequest(string memory _description, uint256 _value, address payable _recipient) public onlyOwner goalReached returns (bool) {
    require(_value <= amountRaised, "Spending request value greater than amount raised");
    require(_value <= address(this).balance, "Spending request value greater than amount available");

    Request memory newRequest = Request({
      description: _description,
      value: _value,
      recipient: _recipient,
      completed: false,
      numberOfVoters: 0
    });
    requests.push(newRequest);
    emit RequestCreated(msg.sender, requests.length.sub(1), _description, _value, _recipient);
    return true;
  }

  /**
   * @dev Vote for a spending request
   * @dev Require that the request exists and is not completed, and that
   * @dev the caller made a contribution and has not already voted
   */
  function voteForRequest(uint256 _index) public goalReached returns (bool) {
    require(requests.length > _index, "Spending request does not exist");

    Request storage thisRequest = requests[_index];
    
    require(thisRequest.completed == false, "Request already completed");
    require(contributions[msg.sender] > 0, "No contribution from Caller");
    require(thisRequest.voters[msg.sender] == false, "Caller already voted");

    thisRequest.voters[msg.sender] = true;
    thisRequest.numberOfVoters = thisRequest.numberOfVoters.add(1);
    emit Vote(msg.sender, _index);
    return true;
  }

  /**
   * @dev View if account has voted for spending request
   * @dev Require that the request exists
   */
  function hasVoted(uint256 _index, address _account) public view returns (bool) {
    require(requests.length > _index, "Spending request does not exist");
    Request storage thisRequest = requests[_index];
    return thisRequest.voters[_account];
  }

  /**
   * @dev Release the payment for a spending request
   * @dev Require that the request exists and is not completed, and that
   * @dev over a majority of contributors voted for the request, and that
   * @dev there are funds available to make the payment
   */
  function releasePayment(uint256 _index) public onlyOwner goalReached returns (bool) {
    require(requests.length > _index, "Spending request does not exist");

    Request storage thisRequest = requests[_index];

    require(thisRequest.completed == false, "Request already completed");
    require(thisRequest.numberOfVoters > totalContributors / 2, "Less than a majority voted");
    require(thisRequest.value <= address(this).balance, "Spending request value greater than amount available");

    thisRequest.recipient.transfer(thisRequest.value);
    emit PaymentReleased(msg.sender, _index, thisRequest.value, thisRequest.recipient);
    thisRequest.completed = true;
  }
}

/**
 * @title SafeMath Library
 * @dev Based on OpenZeppelin/SafeMath Library
 * @dev Used to avoid Solidity Overflow Errors
 * @dev Only add and sub functions used in this contract - others removed
 */
library SafeMath {
  // Returns the addition of two unsigned integers & reverts on overflow
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "SafeMath: addition overflow");
    return c;
  }

  // Returns the subtraction of two unsigned integers & reverts on overflow
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a, "SafeMath: subtraction overflow");
    uint256 c = a - b;
    return c;
  }

}