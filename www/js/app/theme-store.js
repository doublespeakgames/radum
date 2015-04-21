/**
 *	Theme Store
 *	all the colourschemes for the game
 *	(c) doublespeak games 2015	
 **/
define(function() {
	
	var themes = [{
		primary1: '#3FB8AF',
		secondary1: '#7FC7AF',
		primary2: '#FF3D7F',
		secondary2: '#FF9E9D',
		background:  '#DAD8A7',
		negative: '#FFFFFF'
	}];

	return {
		getTheme: function(themeIndex) {
			if (themeIndex == null) {
				themeIndex = Math.floor(Math.random() * themes.length);
			}
			return themes[themeIndex];
		}
	};
});