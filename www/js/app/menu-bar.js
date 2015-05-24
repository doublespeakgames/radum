/**
 *	Menu Bar
 *  in-game options menu
 *	(c) doublespeak games 2015	
 **/
define(['app/util', 'app/graphics'], function(Util, Graphics) {
	
	var MENU_ITEMS = {
		mainMenu: {
			text: 'main menu',
			action: function() { require('app/engine').reset(); }
		}
	};

	var _menuBar = null
	, _menuStyles = null
	;

	var _handler = Util.timeGate(function(e) {
		var target = e.target;

		if (target.id === 'burger-button' || target.parentNode.id === 'burger-button') {
			_toggleMenu(e);
		} else if(target.nodeName === 'LI') {
			_toggleMenu(e);
			MENU_ITEMS[target.getAttribute('data-id')].action();
		}
	}, 200);

	function _init() {
		// Create menu
		var el = _menuBar = document.createElement('div');
		el.addEventListener('touchstart', function(e) { 
			if (!_visible()) return; e.stopPropagation(); setTimeout(function() { _handler(e); }, 50); return false; 
		});
		el.addEventListener('mousedown', function(e) { 
			if (!_visible()) return; e.stopPropagation(); setTimeout(function() { _handler(e); }, 50); return false; 
		});
		el.setAttribute('id', 'menu-bar');
		_menuStyles = _initStylesheet();
		_initColours();

		// Create menu contents
		_createHamburger(el);
		_createLogo(el);
		_createMenu(el);

		// Add the whole thing to the page
		document.body.appendChild(el);
	}

	function _visible() {
		return document.body.className === 'show-menu';
	}

	function _initStylesheet() {
		var style = document.createElement('style');
		style.setAttribute('id', 'menu-bar-style');
		style.appendChild(document.createTextNode("")); // Stupid Webkit
		document.head.appendChild(style);
		return style.sheet;
	}

	function _addStyleRule(selector, rules) {
		if(_menuStyles.addRule) {
			// Useless goddamn IE non-standard API. Rabble rabble.
			var length = _menuStyles.cssRules.length;
			_menuStyles.addRule(selector, rules);
			return length;
		} else {
			return _menuStyles.insertRule(selector + '{' + rules + '}', 0);
		}
	}

	function _clearStyles() {
		while (_menuStyles.cssRules.length > 0) {
			_menuStyles.deleteRule(0);
		}
	}

	function _initColours() {
		_clearStyles();
		_addStyleRule('#menu-bar', 'color:' + Graphics.colour('menu'));
		_addStyleRule('#menu-bar.open', 'background:' + Graphics.colour('menu') + ';color:' + Graphics.colour('negative'));
	}

	function _createHamburger(menu) {
		var el = document.createElement('div')
		, handler = Util.timeGate(_toggleMenu, 100)
		;

		el.setAttribute('id', 'burger-button');
		for (var i = 0; i < 3; i++) {
			el.appendChild(document.createElement('div'));
		}
		menu.appendChild(el);
	}

	function _createLogo(menu) {
		// TODO
	}	

	function _createMenu(menu) {
		var list = document.createElement('ul');
		list.setAttribute('id', 'menu-list');

		Object.keys(MENU_ITEMS).forEach(function(key) {
			var li = document.createElement('li');
			li.innerHTML = MENU_ITEMS[key].text;
			li.setAttribute('data-id', key);
			list.appendChild(li);
		});

		menu.appendChild(list);
	}

	function _toggleMenu(e) {
		if (!_visible()) { return true; }
		_menuBar.className = _menuBar.className === 'open' ? '' : 'open';
		e && e.stopPropagation();
		return false;
	}

	return {
		init: _init
	};
});