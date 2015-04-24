/**
 *	State Machine
 *	simple state machine to track allowable transitions
 *	(c) doublespeak games 2015	
 *
 * 	Transition model:
 *	{
 *		STATE1: {
 *			TRANSITION1: STATE2,
 *			TRANSITION2: STATE3
 *		},
 * 		STATE2: {
 *			TRANSITION1: STATE1,
 *			TRANSITION2: STATE3
 * 		},
 *		STATE3: {
 *			TRANSITION1: STATE1,
 *			TRANSITION2: STATE2
 *		}
 *	}
 **/
define([], function() {

	var DEBUG = false;

	function _canTransitionVia(transitionName) {
		var stateTransitions = this._transitions[this._currentState];
		return !!(stateTransitions && stateTransitions[transitionName]);
	}

	function _makeTransitionVia(transitionName) {
		var stateTransitions = this._transitions[this._currentState];
		if (!stateTransitions || !stateTransitions[transitionName]) {
			return;
		}
		this._currentState = stateTransitions[transitionName];
		DEBUG && console.debug('STATEMACHINE: Transitioned to ' + this._currentState + ' via ' + transitionName);
		return this._currentState;
	}

	function _isState(state) {
		if (typeof state === 'string') {
			return this._currentState === state;
		}

		// Array of possible states
		for (var i = 0, len = state.length; i < len; i++) {
			if (state[i] === this._currentState) {
				return true;
			}
		}
		return false;
	}

	function _chooseAction(actions) {
		var action = actions[this._currentState];
		action && action();
	}

	function StateMachine(transitions, initialState) {
		this._transitions = transitions;
		this._currentState = initialState;
		DEBUG && console.debug('STATEMACHINE: Started in state ' + initialState);
	}
	StateMachine.prototype = {
		can: _canTransitionVia,
		go: _makeTransitionVia,
		is: _isState,
		choose: _chooseAction
	}

	return StateMachine;
});