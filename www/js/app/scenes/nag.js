/**
 *  Nag Screen
 *  convince people to buy the app!
 *  (c) doublespeak games 2015  
 **/
define(['app/scenes/scene', 'app/graphics', 'app/touch-prompt', 'app/audio',
        'app/tween-manager', 'app/tween', 'app/event-manager'], 
        function(Scene, Graphics, TouchPrompt, Audio, TweenManager, Tween, E) {
    
    var DEBUG = false
    ,   BULLET_TOP = 280
    ,   BULLET_HEIGHT = 100
    ,   BULLET_SIZE = 30
    ,   TITLE_TOP = 50
    ,   TITLE_SIZE = 50
    ,   BULLET_TEXT = ['play offline', 'more themes', 'tournaments']
    ,   ANIM_DURATION = 500
    ,   ANIM_OFFSET = 100
    ,   LINKS_TOP = 160
    ,   LINKS_SIZE = 100
    ,   LINKS_OFFSET = 100
    ;

    var APPLE_LOGO = '<svg width="{size}" height="{size}" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg"><path fill="{fill}" d="m127.805969,90.003128c0.224838,24.213104 21.241287,32.270615 21.474121,32.373459c-0.177704,0.56826 -3.358078,11.482742 -11.072464,22.756622c-6.668747,9.746841 -13.590027,19.457977 -24.493088,19.659103c-10.713348,0.197403 -14.158287,-6.353043 -26.406677,-6.353043c-12.24469,0 -16.072174,6.151901 -26.213551,6.550446c-10.52422,0.398254 -18.538303,-10.539917 -25.26247,-20.251053c-13.740021,-19.864456 -24.24024,-56.132286 -10.1411,-80.613663c7.004152,-12.157551 19.521101,-19.85622 33.10713,-20.053638c10.334515,-0.197132 20.089069,6.952717 26.406689,6.952717c6.313614,0 18.167473,-8.59832 30.628998,-7.335548c5.21682,0.217129 19.860519,2.1073 29.263641,15.871029c-0.75766,0.469692 -17.472931,10.200527 -17.291229,30.443592m-20.134499,-59.456692c5.587379,-6.7633 9.348007,-16.178439 8.322067,-25.546439c-8.053787,0.32369 -17.792625,5.36682 -23.569427,12.126399c-5.177124,5.985922 -9.711121,15.566772 -8.48777,24.749359c8.976891,0.69453 18.147476,-4.561718 23.73513,-11.329308"/></svg>'
        DROID_LOGO = '<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" ><path fill="{fill}" d="M223.351,96.805H77.019c-3.37,0-6.283,2.84-6.283,6.21v99.455c0,16.706,12.194,31.076,24.39,37.357v34.402c0,9.742,7.692,16.77,18.291,16.77s18.291-7.027,18.291-16.77v-31.091h36.583v31.091c0,9.742,7.696,16.77,18.294,16.77c10.599,0,18.29-7.027,18.29-16.77v-34.557c12.195-6.359,24.389-20.603,24.389-37.203v-99.455C229.263,99.645,226.72,96.805,223.351,96.805z"/><path fill="{fill}" d="M77.185,82.623c1.156,1.292,2.816,1.988,4.562,1.988h136.376c1.744,0,3.405-0.697,4.561-1.988c1.16-1.307,1.701-3.025,1.495-4.752c-2.483-20.593-11.142-36.444-24.758-47.06l9.224-12.01c2.055-2.668,1.548-6.495-1.119-8.544c-2.675-2.055-6.503-1.527-8.552,1.117l-9.896,12.891c-10.908-5.502-23.995-8.518-39.144-8.518c-16.112,0-29.985,3.311-41.281,9.525L97.99,11.375c-2.048-2.646-5.866-3.17-8.551-1.119c-2.668,2.049-3.174,5.882-1.119,8.55l10.241,13.334c-12.582,10.606-20.495,26.054-22.87,45.729C75.482,79.597,76.024,81.315,77.185,82.623z"/><path fill="{fill}" d="M259.749,96.918c-10.087,0-18.291,8.205-18.291,18.292v60.971c0,10.082,8.204,18.287,18.291,18.287c10.089,0,18.293-8.205,18.293-18.287V115.21C278.042,105.123,269.838,96.918,259.749,96.918z"/><path fill="{fill}" d="M40.25,96.918c-10.086,0-18.292,8.205-18.292,18.292v60.971c0,10.082,8.206,18.287,18.292,18.287c10.087,0,18.292-8.205,18.292-18.287V115.21C58.542,105.123,50.337,96.918,40.25,96.918z"/></svg>';

    var _hitBoxes = [{
        x: Graphics.width() / 2 - LINKS_OFFSET - LINKS_SIZE / 2,
        y: LINKS_TOP - LINKS_SIZE / 2,
        width: LINKS_SIZE,
        height: LINKS_SIZE,
        onTrigger: function() { 
            console.log('APPLE'); 
            E.fire('storeClicked', { store: 'apple' });
        }
    },{
        x: Graphics.width() / 2 + LINKS_OFFSET - LINKS_SIZE / 2,
        y: LINKS_TOP - LINKS_SIZE / 2,
        width: LINKS_SIZE,
        height: LINKS_SIZE,
        onTrigger: function() { 
            console.log('DROID'); 
            E.fire('storeClicked', { store: 'android' });
        }
    }];

    var _prompt = new TouchPrompt({x: Graphics.width() / 2, y: 90}, 'negative', true)
    ,   _bullets = []
    ,   _tweens = new TweenManager()
    ,   _callback
    ;

    return new Scene({
        background: 'menu',

        doFrame: function(delta) {
            _prompt.do(delta);
            _tweens.run(delta);
        },

        drawFrame: function() {

            Graphics.text('Get the app.', Graphics.width() / 2, TITLE_TOP, TITLE_SIZE);
            _bullets.forEach(function(bullet, idx) {
                Graphics.text(
                    bullet.text,
                    Graphics.width() / 2 + (ANIM_OFFSET * (1 - bullet.progress)),
                    BULLET_TOP + (idx * BULLET_HEIGHT),
                    BULLET_SIZE,
                    null,
                    null,
                    'center',
                    false,
                    bullet.progress
                );
            });

            Graphics.svg(APPLE_LOGO, Graphics.width() / 2 - 100, LINKS_TOP, LINKS_SIZE, 'negative');
            Graphics.svg(DROID_LOGO, Graphics.width() / 2 + 100, LINKS_TOP, LINKS_SIZE, 'negative');
            
            if (_tweens.empty()) {
                _prompt.draw();
            }

            if (DEBUG) {
                _hitBoxes.forEach(function(box) {
                    Graphics.rect(box.x, box.y, box.width, box.height, 'negative');
                });
            }
        },

        onInputStart: function(coords) {

            var handled = false;
            _hitBoxes.forEach(function(box) {
                if (coords.x > box.x && coords.x < box.x + box.width &&
                    coords.y > box.y && coords.y < box.y + box.height) {
                    box.onTrigger();
                    handled = true;
                }
            });

            if (handled || !_tweens.empty()) { return; }
            Audio.play('READY');
            _callback();
        },

        onActivate: function(opts) {

            _callback = opts.callback;
            _bullets.length = 0;

            E.fire('nag', { manual: opts.manual });

            BULLET_TEXT.forEach(function(text, index) {
                var bullet = { text: text, progress: 0 }
                ,   tween = new Tween({
                        target: bullet,
                        property: 'progress',
                        start: 0,
                        end: 1,
                        duration: ANIM_DURATION,
                        stepping: Tween.EaseOut()
                })
                ;

                _bullets.push(bullet);
                _tweens.add(tween);

                setTimeout(tween.start.bind(tween), (index + 1) * ANIM_DURATION);
            });
        }
    });
});