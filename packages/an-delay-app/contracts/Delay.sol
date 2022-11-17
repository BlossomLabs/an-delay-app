pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/common/IForwarder.sol";
import "@aragon/os/contracts/common/IForwarderFee.sol";
import "@aragon/os/contracts/lib/math/SafeMath64.sol";
import "@aragon/os/contracts/common/SafeERC20.sol";
import "@aragon/os/contracts/lib/token/ERC20.sol";


contract Delay is AragonApp, IForwarder, IForwarderFee {
    using SafeMath64 for uint64;
    using SafeERC20 for ERC20;

    bytes32 public constant CHANGE_DELAY_ROLE = keccak256("CHANGE_DELAY_ROLE");
    bytes32 public constant DELAY_EXECUTION_ROLE = keccak256("DELAY_EXECUTION_ROLE");
    bytes32 public constant PAUSE_EXECUTION_ROLE = keccak256("PAUSE_EXECUTION_ROLE");
    bytes32 public constant RESUME_EXECUTION_ROLE = keccak256("RESUME_EXECUTION_ROLE");
    bytes32 public constant CANCEL_EXECUTION_ROLE = keccak256("CANCEL_EXECUTION_ROLE");
    bytes32 public constant CHANGE_AMOUNT_ROLE = keccak256("CHANGE_AMOUNT_ROLE");
    bytes32 public constant CHANGE_DESTINATION_ROLE = keccak256("CHANGE_DESTINATION_ROLE");

    string private constant ERROR_NO_SCRIPT = "DELAY_NO_SCRIPT";
    string private constant ERROR_CAN_NOT_EXECUTE = "DELAY_CAN_NOT_EXECUTE";
    string private constant ERROR_CAN_NOT_PAUSE = "DELAY_CAN_NOT_PAUSE";
    string private constant ERROR_SCRIPT_EXECUTION_PASSED = "DELAY_SCRIPT_EXECUTION_PASSED";
    string private constant ERROR_CAN_NOT_RESUME = "DELAY_CAN_NOT_RESUME";
    string private constant ERROR_CAN_NOT_FORWARD = "DELAY_CAN_NOT_FORWARD";
    string private constant ERROR_INVALID_EXECUTION_SCRIPT = "DELAY_INVALID_EXECUTION_SCRIPT";
    string private constant ERROR_INVALID_EXECUTION_DELAY = "DELAY_INVALID_EXECUTION_DELAY";
    string private constant ERROR_INVALID_FEE_TOKEN = "DELAY_INVALID_FEE_TOKEN";
    string private constant ERROR_INVALID_FEE_AMOUNT = "DELAY_INVALID_FEE_AMOUNT";
    string private constant ERROR_INVALID_FEE_DESTINATION = "DELAY_INVALID_FEE_DESTINATION";
    string private constant ERROR_FEE_TRANSFER_REVERTED = "DELAY_FEE_TRANSFER_REVERTED";
 
    struct DelayedScript {
        uint64 executionTime;
        uint64 pausedAt;
        address sender;
        bytes32 evmCallScriptHash;
        uint256 feeAmount;
    }

    uint64 public executionDelay;
    uint256 public delayedScriptsNewIndex = 0;
    mapping(uint256 => DelayedScript) public delayedScripts;
    ERC20 public feeToken;
    uint256 public feeAmount;
    address public feeDestination;

    event DelayedScriptStored(uint256 scriptId, uint256 feeAmount, uint64 executionTime, bytes evmCallScript);
    event ChangeExecutionDelay(uint64 executionDelay);
    event ExecutedScript(uint256 scriptId);
    event ExecutionPaused(uint256 scriptId);
    event ExecutionResumed(uint256 scriptId, uint64 newExecutionTime);
    event ExecutionCancelled(uint256 scriptId);
    event ChangeFeeAmount(uint256 newAmount);
    event ChangeFeeDestination(address indexed newDestination);

    modifier scriptExists(uint256 _scriptId) {
        require(delayedScripts[_scriptId].executionTime != 0, ERROR_NO_SCRIPT);
        _;
    }

    /**
    * @notice Initialize the Delay app with a fee of `@tokenAmount(_feeToken, _feeAmount)`
    * @param _executionDelay The delay in seconds a user will have to wait before executing a script
    * @param _feeToken ERC20 address for the fee token
    * @param _feeAmount Amount of tokens collected as a fee on each forward
    * @param _feeDestination Destination for collected fees
    */
    function initialize(uint64 _executionDelay, ERC20 _feeToken, uint256 _feeAmount, address _feeDestination) external onlyInit {
        initialized();
        require(_feeDestination != address(0), ERROR_INVALID_FEE_DESTINATION);
        require(address(_feeToken) != address(0), ERROR_INVALID_FEE_TOKEN);

        executionDelay = _executionDelay;

        feeToken = _feeToken;
        feeAmount = _feeAmount;
        feeDestination = _feeDestination;
    }

    /**
    * @notice Set the execution delay to `_executionDelay`
    * @param _executionDelay The new execution delay
    */
    function changeExecutionDelay(uint64 _executionDelay) external auth(CHANGE_DELAY_ROLE) {
        require(_executionDelay != executionDelay, ERROR_INVALID_EXECUTION_DELAY);
        emit ChangeExecutionDelay(executionDelay);
        executionDelay = _executionDelay;
    }

    /**
    * @notice Change fee to `@tokenAmount(self.feeToken(): address, _feeAmount)`
    * @param _feeAmount Fee amount
    */
    function changeFeeAmount(uint256 _feeAmount) external authP(CHANGE_AMOUNT_ROLE, arr(_feeAmount, feeAmount)) {
        require(_feeAmount != feeAmount, ERROR_INVALID_FEE_AMOUNT);
        emit ChangeFeeAmount(_feeAmount);
        feeAmount = _feeAmount;
    }

    /**
    * @notice Change fee destination to `_feeDestination`
    * @param _feeDestination Destination for collected fees
    */
    function changeFeeDestination(address _feeDestination) external authP(CHANGE_DESTINATION_ROLE, arr(_feeDestination, feeDestination)) {
        require(_feeDestination != feeDestination && _feeDestination != address(0), ERROR_INVALID_FEE_DESTINATION);
        emit ChangeFeeDestination(_feeDestination);
        feeDestination = _feeDestination;
    }

    /**
    * @notice Delays execution for `@transformTime(self.executionDelay(): uint)`
    * @param _evmCallScript The script that can be executed after a delay
    */
    function delayExecution(bytes _evmCallScript) external auth(DELAY_EXECUTION_ROLE) returns (uint256) {
        return _delayExecution(_evmCallScript);
    }

    /**
     * @dev Disable recovery escape hatch for fee token
     */
    function allowRecoverability(address _token) public view returns (bool) {
        return feeToken != _token;
    }

    /**
    * @notice Tells the forward fee token and amount of the Delay app
    * @dev IFeeForwarder interface conformance
    * @return Forwarder fee token address
    * @return Forwarder fee amount
    */
    function forwardFee() external view returns (address, uint256) {
        return (address(feeToken), feeAmount);
    }

    function isForwarder() external pure returns (bool) {
        return true;
    }

    /**
    * @notice Pause the script execution with ID `_delayedScriptId`
    * @param _delayedScriptId The ID of the script execution to pause
    */
    function pauseExecution(uint256 _delayedScriptId) external auth(PAUSE_EXECUTION_ROLE) {
        DelayedScript storage delayedScript = delayedScripts[_delayedScriptId];
        require(!_isExecutionPaused(_delayedScriptId), ERROR_CAN_NOT_PAUSE);
        require(getTimestamp64() < delayedScript.executionTime, ERROR_SCRIPT_EXECUTION_PASSED);

        delayedScript.pausedAt = getTimestamp64();

        emit ExecutionPaused(_delayedScriptId);
    }

    /**
    * @notice Resume a paused script execution with ID `_delayedScriptId`
    * @param _delayedScriptId The ID of the script execution to resume
    */
    function resumeExecution(uint256 _delayedScriptId) external auth(RESUME_EXECUTION_ROLE) {
        require(_isExecutionPaused(_delayedScriptId), ERROR_CAN_NOT_RESUME);
        DelayedScript storage delayedScript = delayedScripts[_delayedScriptId];

        uint64 timePaused = getTimestamp64().sub(delayedScript.pausedAt);
        delayedScript.executionTime = delayedScript.executionTime.add(timePaused);
        delayedScript.pausedAt = 0;

        emit ExecutionResumed(_delayedScriptId, delayedScript.executionTime);
    }

    /**
    * @notice Cancel script execution with ID `_delayedScriptId`
    * @param _delayedScriptId The ID of the script execution to cancel
    */
    function cancelExecution(uint256 _delayedScriptId) external scriptExists(_delayedScriptId) auth(CANCEL_EXECUTION_ROLE) {
        uint256 amount = delayedScripts[_delayedScriptId].feeAmount;

        // Don't do an unnecessary transfer if there was no fee
        if (amount > 0) {
          // We do not check the transfer with safeTransfer because we want the contract to cancel the execution even if it
          // does not have the funds.
          feeToken.transfer(feeDestination, amount);
        }

        delete delayedScripts[_delayedScriptId];

        emit ExecutionCancelled(_delayedScriptId);
    }

    /**
    * @notice Execute the script with ID `_delayedScriptId`
    * @param _delayedScriptId The ID of the script to execute
    */
    function execute(uint256 _delayedScriptId, bytes _evmCallScript) external {
        require(canExecute(_delayedScriptId), ERROR_CAN_NOT_EXECUTE);

        DelayedScript memory delayedScript = delayedScripts[_delayedScriptId];
        delete delayedScripts[_delayedScriptId];

        require(delayedScript.evmCallScriptHash == keccak256(_evmCallScript), ERROR_INVALID_EXECUTION_SCRIPT);

        // Don't do an unnecessary transfer if there was no fee
        if (delayedScript.feeAmount > 0) {
          // We do not check the transfer with safeTransfer because we want the contract to perform the execution even if
          // it does not have the funds to give back to the user.
          feeToken.transfer(delayedScript.sender, delayedScript.feeAmount);
        }

        runScript(_evmCallScript, new bytes(0), new address[](0));
        emit ExecutedScript(_delayedScriptId);
    }

    /**
    * @notice Return whether a script with ID #`_scriptId` can be executed
    * @param _scriptId The ID of the script to execute
    */
    function canExecute(uint256 _scriptId) public view returns (bool) {
        bool withinExecutionWindow = getTimestamp64() > delayedScripts[_scriptId].executionTime;
        bool isUnpaused = !_isExecutionPaused(_scriptId);

        return withinExecutionWindow && isUnpaused;
    }

    function canForward(address _sender, bytes) public view returns (bool) {
        return canPerform(_sender, DELAY_EXECUTION_ROLE, arr());
    }

    /**
    * @notice Delays execution for `@transformTime(self.executionDelay(): uint)`
    * @param _evmCallScript The script that can be executed after a delay
    */
    function forward(bytes _evmCallScript) public {
        require(canForward(msg.sender, _evmCallScript), ERROR_CAN_NOT_FORWARD);
        _delayExecution(_evmCallScript);
    }

    function _isExecutionPaused(uint256 _scriptId) internal view scriptExists(_scriptId) returns (bool) {
        return delayedScripts[_scriptId].pausedAt != 0;
    }

    function _delayExecution(bytes _evmCallScript) internal returns (uint256) {

        // Don't do an unnecessary transfer if there's no fee right now
        if (feeAmount > 0) {
            require(feeToken.safeTransferFrom(msg.sender, address(this), feeAmount), ERROR_FEE_TRANSFER_REVERTED);
        }

        uint256 delayedScriptIndex = delayedScriptsNewIndex++;
        uint64 executionTime = getTimestamp64().add(executionDelay);

        delayedScripts[delayedScriptIndex] = DelayedScript(executionTime, 0, msg.sender, keccak256(_evmCallScript), feeAmount);

        emit DelayedScriptStored(delayedScriptIndex, feeAmount, executionTime, _evmCallScript);

        return delayedScriptIndex;
    }

}
