/**
 *	Theme Store
 *	all the colourschemes for the game
 *	(c) doublespeak games 2015	
 **/
define(function() {

	// Tan background, red/blue pieces
	var themes = [{
		primary1: '#962d3e',
		secondary1: '#edbdc4',
		primary2: '#348899',
		secondary2: '#99c3cc',
		background:  '#979c9c',
		negative: '#f2ebc7',
		menu: '#343642'
	},{
		// My favourite space one
		primary1: '#fc4349',
		secondary1: '#fda1a4',
		primary2: '#6dbcdb',
		secondary2: '#a4ddf4',
		background:  '#c6c8c8',
		negative: '#2c3e50',
		menu: '#ffffff'
	},{
		// Pea soup with ham
		primary1: '#c9d787',
		secondary1: '#e4ebc3',
		primary2: '#ffc0a9',
		secondary2: '#ffdfd4',
		background:  '#ff8598',
		negative: '#7d8a2e',
		menu: '#ffffff'
	},{
		// Hot-dog stand
		primary1: '#45b29d',
		secondary1: '#a2d8ce',
		primary2: '#e27a3f',
		secondary2: '#f0bc9f',
		background:  '#334d5c',
		negative: '#efc94c',
		menu: '#df5a49'
	},{
		// Grey/blue and pink
		primary1: '#c0ca55',
		secondary1: '#dfe4aa',
		primary2: '#ad5472',
		secondary2: '#d6a9b8',
		background:  '#f07c6c',
		negative: '#56626b',
		menu: '#6c9380'
	}];

	function _randomIndex() {
		return Math.floor(Math.random() * themes.length);
	}

	return {
		getTheme: function(themeIndex) {
			if (themeIndex == null) {
				themeIndex = _randomIndex();
			}
			return themes[themeIndex];
		},

		numThemes: function() {
			return themes.length;
		},

		next: function(theme) {
			var idx = themes.indexOf(theme);
			if (idx < 0) {
				return;
			}
			idx++;
			idx = idx == themes.length ? 0 : idx;

			return themes[idx];
		}
	};
});