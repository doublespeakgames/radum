/**
 *  Round Robin
 *  handles round pairings for a round-robin tournament
 *  (c) doublespeak games 2015  
 **/
define(function() {

    var _matches;

    function _generateMatches(players) {
        var matches = [];

        // One match for every possible pairing
        players.forEach(function(player1, idx) {
            players.slice(idx + 1).forEach(function(player2) {
                matches.push({
                    players: [ player1, player2 ]
                });
            });
        });

        return matches;
    }
    
    return {
        init: function(players) {
            _matches = _generateMatches(players);
        },

        nextMatch: function() {
            return _matches.pop();
        }
    }
});