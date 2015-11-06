/**
 *	HTML Menu Bar
 *  in-game options menu, built in HTML/CSS
 *	(c) doublespeak games 2015	
 **/
define(['app/event-manager', 'app/util', 'app/graphics'], function(E, Util, Graphics) {

	var MENU_ITEMS = {
		mainMenu: {
			text: 'main menu',
			action: function() { E.fire('quitToMain'); require('app/engine').reset(); _toggleMenu(); }
		},
		changeTheme: {
			text: 'change theme',
			action: function() { E.fire('changeTheme'); Graphics.changeTheme(); _initColours(); Graphics.setBackground('negative'); }
		}
	};

	var _menuBar = null
	, _menuStyles = null
	;

	function _init() {

		// Create menu
		var el = _menuBar = document.createElement('div');
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
		_addStyleRule('#logo path', 'fill:' + Graphics.colour('menu') + ';stroke:' + Graphics.colour('menu') + ';');
		_addStyleRule('#menu-bar.open #logo path', 'fill:' + Graphics.colour('negative') + ';stroke:' + Graphics.colour('negative') + ';');
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
		menu.appendChild(document.getElementById('logo'));
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

	function _toggleMenu() {
		E.fire('toggleMenu', {
			opening: _menuBar.className !== 'open'
		});
		_menuBar.className = _menuBar.className === 'open' ? '' : 'open';
	}

	function _handleEvent(coords, e) {
		if (e.target.getAttribute('id') === 'burger-button' || 
			(e.target.parentNode && e.target.parentNode.getAttribute('id') === 'burger-button')) {
			_toggleMenu();
			return true;
		} else if(e.target.nodeName === 'LI') {
			MENU_ITEMS[e.target.getAttribute('data-id')].action();
			return true;
		} else if(e.target.getAttribute('id') === 'logo' || 
			(e.target.parentNode && e.target.parentNode.getAttribute('id') === 'logo')) {
			window.open('http://www.doublespeakgames.com');
			E.fire('logoPressed');
			return true;
		}
		return false;
	}

	return {
		init: _init,
		do: function() { /* Nothing */ },
		draw: function() { /* Nothing */},
		isLoaded: function() {
			return !!_menuBar;
		},
		toggle: function(active) {
			require('app/graphics').toggleMenu(active);
		},
		handleEvent: _handleEvent
	};
});