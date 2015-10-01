/**
 *  Tournament
 *  manages match-ups, standings, etc for tournaments
 *  (c) doublespeak games 2015  
 **/
define(function() {

    var WIN_POINTS = 2
    ,   LOSE_POINTS = 0
    ,   DRAW_POINTS = 1
    ;

    var _activeTournament = null;

    function _generateMatches(players) {
        var matches = [];

        // Everyone plays everyone once
        // TODO: Better tournament matching
        players.forEach(function(player1, idx) {
            players.slice(idx + 1).forEach(function(player2) {
                matches.push({
                    players: [ player1, player2 ]
                });
            });
        });

        return matches;
    }

    Tournament = function(options) {
        this.players = options.players.map(function(playerName, idx) {
            return {
                number: idx,
                name: playerName,
                points: 0
            };
        });
        this.matches = _generateMatches(this.players);
        this.currentMatchIndex = 0;
    };

    Tournament.prototype = {
        currentMatch: function() {
            return this.matches[this.currentMatchIndex];
        },

        endMatch: function(scores) {
            var players = this.currentMatch().players;

            if (scores[0] > scores[1]) {
                players[0].points += WIN_POINTS;
            } else if (scores[1] > scores[0]) {
                players[1].points += WIN_POINTS;
            } else {
                players[0] += 1;
                players[1] += 1;
            }
            
            this.currentMatchIndex++;
        },

        isComplete: function() {
            return this.currentMatchIndex >= this.matches.length;
        }
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

    Tournament.isComplete = function() {
        return _activeTournament && _activeTournament.isComplete()
    }

    Tournament.destroyTournament = function() {
        _activeTournament = null;
    }

    return Tournament; 
});