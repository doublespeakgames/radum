/**
 *  Swiss Style
 *  handles round pairings for a swiss style tournament
 *  (c) doublespeak games 2015  
 **/
define(function() {

    var NUM_ROUNDS = 3;

    var _players
    ,   _roundMatches
    ,   _roundNumber
    ;

    function _generateMatches() {

        _roundMatches = [];

        // Sort players by score
        _players.sort(function(a, b) {
            return b.points - a.points;
        });

        // Pair adjacent players
        for (var i = 0; i < _players.length - 1; i += 2) {
            _roundMatches.push({
                players: [_players[i], _players[i + 1]]
            });
        }

        // If there's a player left over, she gets a bye
        if (i < _players.length) {
            _players[i].points += 2;
        }
    }
    
    return {
        init: function(players) {
            _players = players.slice(0);
            _roundMatches = [];
            _roundNumber = 1;
        },

        nextMatch: function() {
            if (_roundMatches.length === 0 && _roundNumber <= NUM_ROUNDS) {
                _generateMatches();
                _roundNumber++;
            }

            return _roundMatches.pop();
        }
    }
});