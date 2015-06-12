/**
 *	Theme Store
 *	all the colourschemes for the game
 *	(c) doublespeak games 2015	
 **/
define(function() {
	
	var themes = [{
		primary1: '#962d3e',
		secondary1: '#edbdc4',
		primary2: '#348899',
		secondary2: '#99c3cc',
		background:  '#979c9c',
		negative: '#f2ebc7',
		menu: '#343642'
	},{
		primary1: '#fc4349',
		secondary1: '#fda1a4',
		primary2: '#6dbcdb',
		secondary2: '#a4ddf4',
		background:  '#c6c8c8',
		negative: '#2c3e50',
		menu: '#ffffff'
	},{
		primary1: '#c9d787',
		secondary1: '#e4ebc3',
		primary2: '#ffc0a9',
		secondary2: '#99c3cc',
		background:  '#ff8598',
		negative: '#7d8a2e',
		menu: '#ffffff'
	},{
		primary1: '#ff358b',
		secondary1: '#f6a9ca',
		primary2: '#01b0f0',
		secondary2: '#98e1fc',
		background:  '#3e3e3e',
		negative: '#aeee00',
		menu: '#000000'
	},{
		primary1: '#74a588',
		secondary1: '#b9d2c3',
		primary2: '#dc9c76',
		secondary2: '#edcdba',
		background:  '#42282f',
		negative: '#d6ccad',
		menu: '#d6655a'
	},{
		primary1: '#45b29d',
		secondary1: '#a2d8ce',
		primary2: '#e27a3f',
		secondary2: '#f0bc9f',
		background:  '#334d5c',
		negative: '#efc94c',
		menu: '#df5a49'
	},{
		primary1: '#c0ca55',
		secondary1: '#dfe4aa',
		primary2: '#ad5472',
		secondary2: '#d6a9b8',
		background:  '#f07c6c',
		negative: '#56626b',
		menu: '#6c9380'
	},{
		primary1: '#fff68f',
		secondary1: '#fffac7',
		primary2: '#a2fbb9',
		secondary2: '#d0fddc',
		background:  '#78c0f9',
		negative: '#fe86a4',
		menu: '#ffffff'
	},{
		primary1: '#fff0a5',
		secondary1: '#fff7d2',
		primary2: '#ffb03b',
		secondary2: '#ffd79d',
		background:  '#468966',
		negative: '#8e2800',
		menu: '#d77555'
	},{
		primary1: '#e6d6af',
		secondary1: '#f2ead7',
		primary2: '#7ea784',
		secondary2: '#bed3c1',
		background:  '#046380',
		negative: '#002f2f',
		menu: '#efecca'
	}];

	return {
		getTheme: function(themeIndex) {
			if (themeIndex == null) {
				themeIndex = Math.floor(Math.random() * themes.length);
			}
			return themes[themeIndex];
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