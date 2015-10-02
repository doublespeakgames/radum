/**
 *  Tournament
 *  manages match-ups, standings, etc for tournaments
 *  (c) doublespeak games 2015  
 **/
define(['app/tournaments/round-robin'], function(RoundRobin) {

    var WIN_POINTS = 2
    ,   LOSE_POINTS = 0
    ,   DRAW_POINTS = 1
    ;

    var _activeTournament = null;

    Tournament = function(options) {
        this.players = options.players.map(function(playerName, idx) {
            return {
                number: idx,
                name: playerName,
                points: 0
            };
        });

        // TODO: Select between tournament types
        this.tournamentType = RoundRobin;

        this.tournamentType.init(this.players);
        this.match = this.tournamentType.nextMatch();
    };

    Tournament.prototype = {
        currentMatch: function() {
            return this.match;
        },

        endMatch: function(scores) {
            var players = this.currentMatch().players;

            if (scores[0] > scores[1]) {
                players[0].points += WIN_POINTS;
            } else if (scores[1] > scores[0]) {
                players[1].points += WIN_POINTS;
            } else {
                players[0].points += 1;
                players[1].points += 1;
            }

            this.match = this.tournamentType.nextMatch();
        },

        isComplete: function() {
            return !this.match;
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