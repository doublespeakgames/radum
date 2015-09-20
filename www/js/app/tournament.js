/**
 *  Tournament
 *  manages match-ups, standings, etc for tournaments
 *  (c) doublespeak games 2015  
 **/
define(function() {

    var _activeTournament = null;

    Tournament = function(options) {
        this.players = options.players.map(function(playerName, idx) {
            return {
                number: idx,
                name: playerName,
                points: 0
            };
        });
    };

    Tournament.prototype = {

    };

    Tournament.start = function(playerNames) {
        _activeTournament = new Tournament({ players: playerNames });
    };

    Tournament.get = function() {
        return _activeTournament;
    };

    Tournament.isActive = function() {
        return !!_activeTournament;
    }

    return Tournament; 
});