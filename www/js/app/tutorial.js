/**
 *	Tutorial
 *	interactive tutorial module
 *	(c) doublespeak games 2015	
 **/
define(['app/graphics', 'app/touch-prompt'], function(Graphics, TouchPrompt) {
	
	var HEIGHT = 200
	ANIMATION_DURATION = 300
	;

	var _stages
	, _transition = 1
	, _prompt = new TouchPrompt({x: Graphics.width() / 2, y: Graphics.height() - 30}, 'negative');
	;

	function _init(stages) {
		_stages = stages;
		_transition = 0;
	}

	function _testAdvance() {
		if (_stages[0].advanceTest && _stages[0].advanceTest()) {
			_stages.shift();
		}
	}

	function _do(delta) {
		if (_transition < 1) {
			_transition += delta / ANIMATION_DURATION;
			_transition = _transition > 1 ? 1 : _transition;
		}

		_prompt.do(delta);
		_testAdvance();
	}

	function _draw() {
		Graphics.setAlpha(_transition);
		Graphics.rect(20, Graphics.height() - (HEIGHT * _transition) + 2, Graphics.width() - 40, HEIGHT, 'negative', 'background', 4, 0.9);

		_stages[0].message.forEach(function(text, idx) {
			Graphics.text(text, Graphics.width() / 2, Graphics.height() - (HEIGHT * _transition) + 50 + (idx * 34), 32, 'negative');
		});

		if (_transition === 1 && !_stages[0].advanceText) {
			_prompt.draw();
		}
		Graphics.setAlpha(1);
	}

	return {
		do: _do,
		draw: _draw,
		init: _init,
		isActive: function() { 
			return !!_stages; 
		}
	};
});