/**
 *	Utils
 *	common useful utilities
 *	(c) doublespeak games 2015	
 **/

/**
 *	Event Manager
 *	handles basic non-DOM eventing
 *	(c) doublespeak games 2015	
 **/

/**
 *	Theme Store
 *	all the colourschemes for the game
 *	(c) doublespeak games 2015	
 **/

/**
 *	Scaler
 *	base scaler that does nothing at all
 *	(c) doublespeak games 2015	
 **/

/**
 *	Native Scaler
 *  no scaling at all!
 *	(c) doublespeak games 2015	
 **/

/**
 *	CSS Scaler
 *  scale the viewport with CSS transforms
 *	(c) doublespeak games 2015	
 **/

/**
 *	Javascript Scaler
 *  scales programmatically
 *	(c) doublespeak games 2015	
 **/

/**
 *	Scaler Store
 *  gets you a scaler, dude
 *	(c) doublespeak games 2015	
 **/

/**
 *	Graphics
 *	simple canvas-based graphics library
 *	(c) doublespeak games 2015	
 **/

/**
 *	Scene
 *	base class for representing game scenes
 *	(c) doublespeak games 2015	
 **/

/**
 *	State Machine
 *	simple state machine to track allowable transitions
 *	(c) doublespeak games 2015	
 *
 * 	Transition model:
 *	{
 *		STATE1: {
 *			TRANSITION1: STATE2,
 *			TRANSITION2: STATE3
 *		},
 * 		STATE2: {
 *			TRANSITION1: STATE1,
 *			TRANSITION2: STATE3
 * 		},
 *		STATE3: {
 *			TRANSITION1: STATE1,
 *			TRANSITION2: STATE2
 *		}
 *	}
 **/

/**
 *	Touch Prompt
 *	little pulsing animation prompting a touch/click
 *	(c) doublespeak games 2015	
 **/

/**
 *	Piece
 *	game-piece that can be played to the board
 *	(c) doublespeak games 2015	
 **/

/**
 *	Score Horizon
 *	horizon animation that scores the board
 *	(c) doublespeak games 2015	
 **/

/**
 *	Game Board
 *  scene for the main game board
 *	(c) doublespeak games 2015	
 **/

/**
 *	Main Menu
 *	scene for the main menu
 *	(c) doublespeak games 2015	
 **/

/**
 *	Stage Screen
 *	scene for the different stage notification prompts
 *	(c) doublespeak games 2015	
 **/

/**
 *	Game Over Screen
 *	scene for the final score display
 *	(c) doublespeak games 2015	
 **/

/**
 *	Scene Store
 *	retrieve scenes by name
 *	(c) doublespeak games 2015	
 **/

/**
 *	Engine
 *	handles game loop and input
 *	(c) doublespeak games 2015	
 **/

/**
 *	Radum
 *	(c) doublespeak games 2015	
 **/

define("app/util",[],function(){function e(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e}function t(){return typeof performance=="object"?performance.now():Date.now()}function n(e,n){var r=null;return function(){if(r!==null&&t()-r<n)return;r=t(),e.apply(this,arguments)}}function r(e,t){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))}return{merge:e,time:t,timeGate:n,requestFrame:window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){return setTimeout(e,30)},distance:r}}),define("app/event-manager",[],function(){function t(t,n){var r=e[t];r||(r=e[t]=[]),r.push(n)}function n(t,n){var r=e[t];if(!n){delete e[t];return}r&&(e[t]=r.filter(function(e){return e!==n}))}function r(t){var n=Array.prototype.slice.call(arguments,1),r=e[t];r&&r.forEach(function(e){e.apply(this,n)})}var e={};return{fire:r,on:t,off:n}}),define("app/theme-store",[],function(){var e=[{primary1:"#3FB8AF",secondary1:"#7FC7AF",primary2:"#FF3D7F",secondary2:"#FF9E9D",background:"#DAD8A7",negative:"#FFFFFF"}];return{getTheme:function(t){return t==null&&(t=Math.floor(Math.random()*e.length)),e[t]}}}),define("app/scalers/scaler",["app/util"],function(e){function t(t){e.merge(this,t),this._scale=1}return t.prototype={setScale:function(e){this._scale=e},scaleValue:function(e){return e},scaleCoords:function(e){return e},scaleCanvas:function(e){}},t}),define("app/scalers/native",["app/scalers/scaler"],function(e){function n(e,t,n){e.addRule?e.addRule(t,n):e.insertRule(t+"{"+n+"}",e.cssRules.length)}var t=null;return new e({scaleCoords:function(e){var t=require("app/graphics");e.x-=(t.realWidth()-t.width())/2,e.y-=(t.realHeight()-t.height())/2},scaleCanvas:function(e){if(!t){var r=require("app/graphics");t=document.createElement("style"),t.id="radum-scalesheet",t.appendChild(document.createTextNode("")),document.head.appendChild(t),t=t.sheet,n(t,".radum-canvas","width:"+r.width()+"px;"+"height:"+r.height()+"px;"+"position: absolute;"+"top: 50%;"+"left: 50%;"+"margin-top: -"+r.height()/2+"px;"+"margin-left: -"+r.width()/2+"px;")}}})}),define("app/scalers/css",["app/scalers/scaler"],function(e){function n(e,t,n){e.addRule?e.addRule(t,n):e.insertRule(t+"{"+n+"}",e.cssRules.length)}var t=null;return new e({scaleCoords:function(e){var t=require("app/graphics");return e.x-=t.realWidth()/2,e.y-=t.realHeight()/2,e.x/=this._scale,e.y/=this._scale,e.x+=t.width()/2,e.y+=t.height()/2,e},scaleCanvas:function(e){var r=require("app/graphics");t?t.deleteRule(1):(t=document.createElement("style"),t.id="radum-scalesheet",t.appendChild(document.createTextNode("")),document.head.appendChild(t),t=t.sheet,n(t,".radum-canvas","width:"+r.width()+"px;"+"height:"+r.height()+"px;"+"position: absolute;"+"top: 50%;"+"left: 50%;"+"margin-top: -"+r.height()/2+"px;"+"margin-left: -"+r.width()/2+"px;")),n(t,".radum-canvas","transform-origin: 50% 50% 0;-webkit-transform-origin: 50% 50% 0;-moz-transform-origin: 50% 50% 0;-ms-transform-origin: 50% 50% 0;-o-transform-origin: 50% 50% 0;transform: scale("+this._scale+");"+"-webkit-transform: scale("+this._scale+");"+"-moz-transform: scale("+this._scale+");"+"-ms-transform: scale("+this._scale+");"+"-o-transform: scale("+this._scale+");")}})}),define("app/scalers/javascript",["app/scalers/scaler"],function(e){function n(e,t,n){e.addRule?e.addRule(t,n):e.insertRule(t+"{"+n+"}",e.cssRules.length)}var t=null;return new e({scaleCoords:function(e){var t=require("app/graphics");return e.x-=t.realWidth()/2,e.y-=t.realHeight()/2,e.x/=this._scale,e.y/=this._scale,e.x+=t.width()/2,e.y+=t.height()/2,e},scaleCanvas:function(e){var r=require("app/graphics"),i=Math.round(r.height()*this._scale),s=Math.round(r.width()*this._scale);t?t.deleteRule(0):(t=document.createElement("style"),t.id="radum-scalesheet",t.appendChild(document.createTextNode("")),document.head.appendChild(t),t=t.sheet),e.width=s,e.height=i,n(t,".radum-canvas","width:"+s+"px;"+"height:"+i+"px;"+"position: absolute;"+"top: 50%;"+"left: 50%;"+"margin-top: -"+Math.round(i/2)+"px;"+"margin-left: -"+Math.round(s/2)+"px;")},scaleValue:function(e){return Math.round(e*this._scale)}})}),define("app/scaler-store",["app/scalers/native","app/scalers/css","app/scalers/javascript"],function(e,t,n){return{get:function(e){return require("app/scalers/"+e)}}}),define("app/graphics",["app/util","app/theme-store","app/scaler-store"],function(e,t,n){function f(t){s=e.merge(s,t),o=n.get(s.scalingMode||"native"),c(),window.addEventListener("resize",c)}function l(e,t,n){var r=document.createElement("canvas");return r.width=e,r.height=t,r.className=n,r}function c(){var e=window.innerWidth/s.width,t=window.innerHeight/s.height;r||(i=l(s.width,s.height,"radum-canvas"),document.body.appendChild(i),r=i.getContext("2d"),r.save()),o.setScale(e<t?e:t),o.scaleCanvas(i)}function h(){return o}function p(){r.clearRect(0,0,o.scaleValue(s.width),o.scaleValue(s.height))}function d(){return window.innerWidth}function v(){return window.innerHeight}function m(){return s.width}function g(){return s.height}function y(e,t,n,i,s,a,f){r.globalAlpha=this._globalAlpha,s=s||"negative",r.textAlign=f||"center",r.textBaseline="middle",r.font=o.scaleValue(i)+"px Arial, Helvetica, sans-serif",a&&(r.fillStyle=u[a],r.fillText(e,o.scaleValue(t+1),o.scaleValue(n+1))),r.fillStyle=u[s],r.fillText(e,o.scaleValue(t),o.scaleValue(n))}function b(e){document.body.style.background=e?u[e]:"transparent"}function w(e,t,n,i,s,a,f,l,c){f=f==null?1:f,a=a==null?4:a;var h=n-a/2;circleWidth=n-(s?1:0),circleWidth=circleWidth<0?0:circleWidth,r.globalAlpha=f*this._globalAlpha,i&&(c&&(r.globalCompositeOperation="source-atop"),r.beginPath(),r.arc(o.scaleValue(e),o.scaleValue(t),o.scaleValue(circleWidth),0,2*Math.PI,!1),r.fillStyle=u[i],r.fill(),c&&(r.globalCompositeOperation="source-over")),s&&(l&&(r.globalCompositeOperation="destination-over",h+=a-1),h=h<0?0:h,r.beginPath(),r.arc(o.scaleValue(e),o.scaleValue(t),o.scaleValue(h),0,2*Math.PI,!1),r.lineWidth=o.scaleValue(a),r.strokeStyle=u[s],r.stroke(),l&&(r.globalCompositeOperation="source-over")),r.globalAlpha=this._globalAlpha}function E(e,t,n,i,s){s=s||"negative",r.globalAlpha=this._globalAlpha,r.beginPath(),r.fillStyle=null,r.strokeStyle=u[s],r.lineWidth=o.scaleValue(2),r.rect(o.scaleValue(e),o.scaleValue(t),o.scaleValue(n),o.scaleValue(i)),r.stroke()}function S(e){this._globalAlpha=e,r.globalAlpha=e}function x(){var e=require("app/scenes/game-board").getCenter(),t=require("app/scenes/game-board").getRadius();r.beginPath(),r.arc(o.scaleValue(e.x),o.scaleValue(e.y),o.scaleValue(t),0,2*Math.PI,!1),r.clip()}function T(){r.save()}function N(){r.restore()}var r,i,s={width:480,height:640,scalingMode:"javascript"},o=null,u=t.getTheme(),a=1;return{init:f,setAlpha:S,getScaler:h,clear:p,save:T,restore:N,width:m,height:g,realWidth:d,realHeight:v,setBackground:b,clipToBoard:x,text:y,circle:w,rect:E}}),define("app/scenes/scene",["app/util","app/graphics"],function(e,t){function n(t){e.merge(this,t)}return n.prototype={background:null,onActivate:function(){},activate:function(e){this.onActivate(e),t.setBackground(this.background)},drawFrame:function(e){},onInputStart:function(e){},onInputStop:function(){},onInputMove:function(e){}},n}),define("app/state-machine",[],function(){function t(e){var t=this._transitions[this._currentState];return!!t&&!!t[e]}function n(t){var n=this._transitions[this._currentState];if(!n||!n[t])return;return this._currentState=n[t],e&&console.debug("STATEMACHINE: Transitioned to "+this._currentState+" via "+t),this._currentState}function r(e){if(typeof e=="string")return this._currentState===e;for(var t=0,n=e.length;t<n;t++)if(e[t]===this._currentState)return!0;return!1}function i(e){var t=e[this._currentState];t&&t()}function s(t,n){this._transitions=t,this._currentState=n,e&&console.debug("STATEMACHINE: Started in state "+n)}var e=!1;return s.prototype={can:t,go:n,is:r,choose:i},s}),define("app/touch-prompt",["app/graphics","app/util"],function(e,t){function i(e,t){this._coords=e,this._aPos=0,this._colour=t}var n=20,r=800;return i.prototype.draw=function(t){this._aPos+=t/r,this._aPos>1&&(this._aPos%=1),e.circle(this._coords.x,this._coords.y,n/2,this._colour,null,0,1-this._aPos),e.circle(this._coords.x,this._coords.y,n/2+n/2*this._aPos,null,this._colour,2,1-this._aPos)},i}),define("app/piece",["app/graphics","app/util","app/touch-prompt"],function(e,t,n){function c(e,t,r){this._coords=e,this._type=t,this._player=r,this._real=!0,this._transitionScale=.4,this._transitionMove=1,this._prompt=new n(e,"primary"+r),this._active=t===c.Type.FOOTPRINT,this._pulsing=0,this._label=null,this._savedPos=null,this._level=1}var r=25,i=200,s=400,o=400,u=1.5,a=4,f=36,l=3;return c.Type={FOOTPRINT:0,TARGET:1,TARGET_FORECAST:2,SENTRY:3},c.RADIUS=r,c.prototype={draw:function(t){if(this._real||!this._real&&this._transitionScale>0){var n,l,h=1,p=r,d,v;switch(this._type){case c.Type.FOOTPRINT:n=null,l="primary"+this._player,h=.8;break;case c.Type.SENTRY:n="primary"+this._player,l="secondary"+this._player;break;case c.Type.TARGET:n="negative",l="background";break;case c.Type.TARGET_FORECAST:n="negative",h=.5}!this._savedPos||this._savedPos.x===this._coords.x&&this._savedPos.y===this._coords.y?(d=this._coords.x,v=this._coords.y):(this._transitionMove===1&&(this._transitionMove=0),this._transitionMove+=t/s,this._transitionMove=this._transitionMove>1?1:this._transitionMove,d=this._savedPos.x+this._transitionMove*(this._coords.x-this._savedPos.x),v=this._savedPos.y+this._transitionMove*(this._coords.y-this._savedPos.y),this._transitionMove===1&&(this._savedPos=null)),e.circle(d,v,p*this._transitionScale,n,l,a*this._transitionScale,h,this._type===c.Type.TARGET,this._type===c.Type.TARGET_FORECAST),this._label&&e.text(this._label.text,this._coords.x,this._coords.y,f*this._transitionScale,this._label.colour,"negative"),this._level>1&&e.circle(d,v,p*.7*this._transitionScale,null,"secondary"+this._player,3),this._level>2&&e.circle(d,v,p*.4*this._transitionScale,null,"secondary"+this._player,3)}this._pulsing>0&&this._transitionScale<u?(this._transitionScale+=t/o,this._transitionScale>=u&&(this._transitionScale=u,this._pulsing=-1)):this._pulsing<0&&this._transitionScale>1?(this._transitionScale-=t/o,this._transitionScale<=1&&(this._transitionScale=1,this._pulsing=0)):this._transitionScale<1&&this._real?(this._transitionScale+=t/i,this._transitionScale=this._transitionScale>1?1:this._transitionScale,this._transitionScale===1&&this._realCallback&&(this._realCallback(),this._realCallback=null)):this._transitionScale>0&&!this._real?(this._transitionScale-=t/i,this._transitionScale=this._transitionScale<0?0:this._transitionScale,this._transitionScale===0&&this._realCallback&&(this._realCallback(),this._realCallback=null)):this._real&&this._type===c.Type.FOOTPRINT&&this._active&&this._prompt.draw(t)},move:function(e){this._coords=e,this._prompt._coords=e},applyVector:function(e){this._coords.x+=e.x,this._coords.y+=e.y},collidesWith:function(e){return t.distance(this._coords,e.getCoords())<r*2},contains:function(e){return Math.sqrt(Math.pow(this._coords.x-e.x,2)+Math.pow(this._coords.y-e.y,2))<=r/2},getReboundVector:function(e){var n=t.distance(this._coords,e),i=r*2-n,s=e.x-this._coords.x,o=e.y-this._coords.y;return i>0?(s===0&&o===0&&(s+=Math.random()*.2-.1,o+=Math.random()*.2-.1,n=Math.sqrt(Math.pow(s,2)+Math.pow(o,2))),{x:i*(s/n),y:i*(o/n)}):{x:0,y:0}},getCoords:function(){return this._coords},isReal:function(){return this._real},isa:function(e){return this._type===e},ownerNumber:function(){return this._player},setType:function(e){this._type=e},setReal:function(e,t){this._real=e,this._realCallback&&this._realCallback(!0),this._realCallback=t},setActive:function(e){this._active=this._type===c.Type.FOOTPRINT&&e},setLabel:function(e){this._label=e},appear:function(){this._transitionScale=0},pulse:function(){this._pulsing=1},savePos:function(){this._savedPos={x:this._coords.x,y:this._coords.y}},levelUp:function(){this._level++,this._level=this._level>l?l:this._level},resetLevel:function(){this._level=1},pointValue:function(){return Math.pow(2,this._level-1)}},c}),define("app/score-horizon",["app/util","app/graphics"],function(e,t){function i(e,t){this._scale=0,this._coords=t,this._player=e,this._stopped=!1}var n=5e3,r=400;return i.prototype={draw:function(e){!this._stopped&&this._scale<1&&(this._scale+=e/n,this._scale=this._scale>=1?1:this._scale),t.circle(this._coords.x,this._coords.y,r*this._scale,"primary"+this._player,null,0,.3)},stop:function(){this._stopped=!0}},i.DURATION=n,i.RATE=n/r,i}),define("app/scenes/game-board",["app/util","app/scenes/scene","app/graphics","app/state-machine","app/piece","app/touch-prompt","app/score-horizon"],function(e,t,n,r,i,s,o){function T(t){var n=e.distance(t,u),r=1;return n>a?(r=a/n,{x:r*t.x+(1-r)*u.x-t.x,y:r*t.y+(1-r)*u.y-t.y}):{x:0,y:0}}function N(e,t){var n=T(e);return t=t||0,m.forEach(function(t){if(!t.isReal())return;var r=t.getReboundVector(e);n.x+=r.x,n.y+=r.y}),e.x+=n.x,e.y+=n.y,n.x!=0||n.y!=0?t>=h?!1:N(e,t+1):!0}function C(e,t,n){var r=T(e.getCoords()),i=T(t.getCoords());return n=n||0,m.forEach(function(n){var s,o;if(!n.isReal())return;n!==e&&(s=n.getReboundVector(e.getCoords()),n===t&&(s.x/=2,s.y/=2),r.x+=s.x,r.y+=s.y),n!==t&&(o=n.getReboundVector(t.getCoords()),n===e&&(o.x/=2,o.y/=2),i.x+=o.x,i.y+=o.y)}),e.applyVector(r),t.applyVector(i),r.x!==0||r.y!==0||i.x!==0||i.y!==0?n>=h?!1:C(e,t,n+1):!0}function k(e){return 2*Math.sqrt(Math.pow(a,2)-Math.pow(e,2))}function L(){var e={x:Math.floor(Math.random()*a*2)},t=e.x-a,r=k(t);return e.y=Math.floor(Math.random()*r+(a-r/2)),e.x+=n.width()/2-a,e.y+=n.height()/2-a,e}function A(){var e=null,t=0;while(e===null&&t++<100)e=L(),e=M(e)?e:null;return e}function O(){var e=A();return e?new i(e,i.Type.TARGET_FORECAST,0):(console.debug("Couldn't find a free space for the target. Write better code."),null)}function M(t){var n=!0;return m.forEach(function(r){e.distance(r.getCoords(),t)<i.RADIUS*2&&(n=!1)}),n}function _(){var e=[],t,n=!1,r;d.go("SCORE"),m.forEach(function(t){t.isa(i.Type.FOOTPRINT)&&(t.setReal(!0),t.setActive(!1),e.push(t))}),e[0].collidesWith(e[1])&&(e[0].savePos(),e[1].savePos(),C(e[0],e[1])),E&&(e.forEach(function(e){E.collidesWith(e)&&(n=!0)}),n&&(r=A(),r?E.move(r):E=null),E&&(E.setType(i.Type.TARGET),E.appear())),t=D(e);if(t.length==0){d.go("DONESCORING");return}e.forEach(function(e){w.push(new o(e.ownerNumber(),e.getCoords()))}),setTimeout(function s(){var e=t.shift(),n=0,r;e.player&&e.piece.pulse(),e.player&&e.piece.ownerNumber()!==e.player?(e.piece.ownerNumber()===0?(r=e.player,n=-2):(r=e.player===1?2:1,n=e.piece.pointValue()),S[r-1]+=n,e.piece.setLabel({text:n,colour:"secondary"+r}),e.piece.resetLevel()):e.player&&e.piece.levelUp(),t.length>0?setTimeout(s,(t[0].distance-e.distance)*o.RATE):(w.forEach(function(e){e.stop()}),d.go("DONESCORING"))},t[0].distance*o.RATE)}function D(t){function r(r){if(!r.isa(i.Type.SENTRY)&&!r.isa(i.Type.TARGET))return;var s=[e.distance(r.getCoords(),t[0].getCoords())-i.RADIUS,e.distance(r.getCoords(),t[1].getCoords())-i.RADIUS],o=Math.min.apply(Math,s),u=s[0]===o?s[1]===o?null:1:2;Math.abs(s[0]-s[1])<=p&&(u=null),n.push({distance:o,player:u,piece:r})}var n=[];return E&&r(E),m.forEach(r),n.sort(function(e,t){return e.distance-t.distance})}function P(e,t,r){for(var i=0;i<x[e-1];i++)d.is(["IDLE","MOVED","PRIMED"])&&b===e&&i+1===x[e-1]?n.circle(t,30+i*18,8,null,"primary"+e):n.circle(t,30+i*18,8,"primary"+e);g>0&&e===b&&(g-=r/c,g=g<0?0:g,n.circle(t,30+x[e-1]*18,8*g,null,"primary"+e))}function H(){return b===1?2:1}function B(){x=[l,l],S=[0,0],m.length=0,w.length=0,E=null}var u={x:n.width()/2,y:n.height()/2},a=200,f=400,l=6,c=200,h=10,p=5,d=new r({IDLE:{PLAYPIECE:"MOVED",CLICKPIECE:"PRIMED"},MOVED:{STOP:"IDLE",MOVE:"MOVED"},PRIMED:{MOVE:"MOVED",SUBMIT:"SUBMITTED"},SUBMITTED:{NEXTPLAYER:"IDLE",SCORE:"SCORING"},SCORING:{DONESCORING:"PAUSED"},PAUSED:{UNPAUSE:"UPKEEP",GAMEOVER:"ENDGAME"},UPKEEP:{NEXTTURN:"IDLE"},ENDGAME:{NEWGAME:"IDLE"}},"IDLE"),v=null,m=[],g=0,y=new s({x:n.width()/2,y:n.height()-60},"background"),b=1,w=[],E,S=[0,0],x=[l,l];return new t({background:null,getCenter:function(){return u},getRadius:function(){return a},drawFrame:function(e){n.circle(u.x,u.y,a,"background"),w.length>0&&(n.save(),n.clipToBoard(),w.forEach(function(t){t.draw(e)}),n.restore()),E&&E.draw(e),m.forEach(function(t){t.draw(e)}),v&&v.draw(e),n.text(S[0],50,38,40,"primary1",null,"left"),n.text(S[1],430,38,40,"primary2",null,"right"),P(1,30,e),P(2,450,e),d.is("PAUSED")&&y.draw(e)},onActivate:function(){d.can("NEWGAME")?(B(),d.go("NEWGAME")):b===1&&d.can("NEXTPLAYER")?(b=2,d.go("NEXTPLAYER")):b===2&&d.can("SCORE")?(b=1,_()):d.can("NEXTTURN")&&(w.length=0,m.forEach(function(e){e.isa(i.Type.FOOTPRINT)&&e.setType(i.Type.SENTRY),e.setLabel(null)}),d.go("NEXTTURN"))},onInputStart:function(e){if(x[H()-1]===0&&d.can("GAMEOVER"))require("app/engine").changeScene("game-over",S),d.go("GAMEOVER");else if(d.can("UNPAUSE"))require("app/engine").changeScene("stage-screen"),d.go("UNPAUSE");else if(d.can("CLICKPIECE")&&v&&v.contains(e))d.go("CLICKPIECE");else if(d.can("PLAYPIECE")){if(!N(e))return;v?v.move(e):v=new i(e,i.Type.FOOTPRINT,b),d.go("PLAYPIECE")}},onInputStop:function(){d.can("SUBMIT")?(v.setReal(!1),g=1,setTimeout(function(){require("app/engine").changeScene("stage-screen")},f),m.push(v),v=null,x[b-1]--,d.go("SUBMIT")):d.can("STOP")&&d.go("STOP")},onInputMove:function(e){if(d.can("MOVE")&&v){if(!N(e))return;v.move(e),d.go("MOVE")}}})}),define("app/scenes/main-menu",["app/scenes/scene","app/graphics"],function(e,t){function i(){require("app/engine").changeScene("stage-screen")}function s(){console.log("show rules")}var n=!1,r=[{x:0,y:295,width:360,height:100,onTrigger:i},{x:0,y:440,width:360,height:100,onTrigger:s}];return new e({background:"background",drawFrame:function(e){t.text("Radüm",t.width()/2,t.height()/3-30,100),t.text("play",t.width()/2,t.height()/2+20,50),t.text("rules",t.width()/2,t.height()/2+170,50),n&&r.forEach(function(e){t.rect(e.x,e.y,e.width,e.height)})},onInputStart:function(e){r.forEach(function(t){e.x>t.x&&e.x<t.x+t.width&&e.y>t.y&&e.y<t.y+t.height&&t.onTrigger()})}})}),define("app/scenes/stage-screen",["app/scenes/scene","app/graphics","app/state-machine","app/touch-prompt"],function(e,t,n,r){var i=new n({PLAYER1:{NEXT:"PLAYER2"},PLAYER2:{NEXT:"SCORE"},SCORE:{NEXT:"PLAYER1"}},"SCORE"),s,o=new r({x:t.width()/2,y:t.height()-60},"negative");return new e({onActivate:function(){var e;i.go("NEXT"),i.choose({PLAYER1:function(){e="primary1",s="Player 1"},PLAYER2:function(){e="primary2",s="Player 2"},SCORE:function(){e="background",s="Score"}}),this.background=e},drawFrame:function(e){t.text(s,t.width()/2,t.height()/3-30,80),o.draw(e)},onInputStart:function(e){require("app/engine").changeScene("game-board")}})}),define("app/scenes/game-over",["app/scenes/scene","app/graphics","app/touch-prompt"],function(e,t,n){var r=new n({x:t.width()/2,y:550},"negative");return _scores=[0,0],new e({background:"background",onActivate:function(e){_scores=e},drawFrame:function(e){t.text(_scores[0],t.width()/2-80,t.height()/3,80,"primary1"),t.text(_scores[1],t.width()/2+80,t.height()/3,80,"primary2"),r.draw(e)},onInputStart:function(e){require("app/engine").changeScene("stage-screen")}})}),define("app/scene-store",["app/scenes/game-board","app/scenes/main-menu","app/scenes/stage-screen","app/scenes/game-over"],function(e,t,n,r){return{get:function(e){return require("app/scenes/"+e)}}}),define("app/engine",["app/util","app/event-manager","app/graphics","app/scene-store"],function(e,t,n,r){function l(e,t){s&&(a=s),u=0,s=r.get(e),s.activate(t)}function c(){return u<1}function v(){n.init(),document.body.addEventListener("touchstart",h),document.body.addEventListener("mousedown",h),document.body.addEventListener("touchend",p),document.body.addEventListener("mouseup",p),document.body.addEventListener("touchmove",d),document.body.addEventListener("mousemove",d),l("main-menu"),function t(){var r=e.time(),f=r-o;e.requestFrame(t),n.clear(),a&&(n.setAlpha(1-u),a.drawFrame(f)),n.setAlpha(u),s.drawFrame(f),u<1&&(u+=f/i,u>=1&&(u=1,a=null)),o=r}()}var i=300,s,o=e.time(),u=1,a,f,h=e.timeGate(function(e){e=e||window.event,e.stopPropagation(),e.preventDefault(),e.changedTouches&&(e=e.changedTouches[0]);if(c())return;f={x:e.clientX,y:e.clientY},s.onInputStart(n.getScaler().scaleCoords({x:e.pageX,y:e.pageY}))},200),p=e.timeGate(function(e){if(c())return;s.onInputStop()},10),d=e.timeGate(function(e){e=e||window.event,e.preventDefault(),e.changedTouches&&(e=e.changedTouches[0]);if(c())return;if(f&&e.clientX===f.x&&e.clientY===f.y)return;f={x:e.clientX,y:e.clientY},s.onInputMove(n.getScaler().scaleCoords({x:e.clientX,y:e.clientY}))},10);return{init:v,changeScene:l}}),require(["app/engine"],function(e){e.init()}),define("app/main",function(){}),requirejs.config({baseUrl:"js/lib",shim:{"google-analytics":{exports:"ga"}},paths:{app:"../app","google-analytics":["http://www.google-analytics.com/analytics","analytics"]}}),requirejs(["app/main"]),define("app",function(){});