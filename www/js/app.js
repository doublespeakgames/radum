requirejs.config({
	baseUrl: "js/lib",
	shim: {
		"google-analytics": {
			exports: "ga"
		},
		"cocoon-js": {
			exports: "Cocoon"
		}
	},
	paths: {
		app: "../app",
		"google-analytics": [
	        "http://www.google-analytics.com/analytics",
	        "analytics"
        ]
	}
});

function startGame() {
	// Load the main module to start the game
	requirejs(["app/main"]);
}
