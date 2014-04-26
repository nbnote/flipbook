/*!
 * Flipbook.js
 *
 * @version 1.1.4
 * @author Kazuhiro Shintani
 * @license MIT License (https://github.com/nbnote/flipbook/blob/master/LICENSE)
 * @link https://github.com/nbnote/flipbook
 */

;
(function( window, document, undefined ) {

	var Flipbook = function( screen, numFrames, direction ) {
		this._screen = typeof screen === 'string' ? document.getElementById( screen ) :
		screen instanceof jQuery ? screen[0] :
		screen;
		this._totalFrames = numFrames === undefined ? 0 : numFrames;
		this._direction = direction === undefined ? 0 : direction;

		this._frameLength = parseInt( this._getStyle( this._screen, this._direction === 0 ? 'width' : 'height' ) ) || 0;
		this._posList = null;
		this._timer = 0;
		this._fps = 30;
		this._speed = Math.floor( 1000 / this._fps );
		this._currentFrame = 0;
		this._prevFrame = 0;
		this._loop = true;
		this._isPlaying = false;
		this._isReverse = false;

		this.onLastFrame = function( data ) {};
		this.onFirstFrame = function( data ) {};
		this.onUpdate = function( data ) {};

		this._posList = this._makePosList( this._totalFrames, this._direction, this._frameLength );

		this.setFrame( 0 );
	};

	Flipbook.prototype = {

		_getStyle: (function() {
			var func;

			if ( document.documentElement.currentStyle ) {
				func = function( element, property ) {
					var prop = property.replace( /-./g, function( m ) {
						return m.charAt( 1 ).toUpperCase();
					} );
					return element.currentStyle[prop];
				}
			} else if ( window.getComputedStyle ) {
				func = function( element, property ) {
					return document.defaultView.getComputedStyle( element, null ).getPropertyValue( property );
				}
			}

			return func;
		})(),

		_makePosList: function( numFrames, direction, length, shift ) {
			shift = shift === undefined ? 0 : shift;

			var ary = [];
			var i = 0;

			if ( direction === 0 ) {
				for ( ; i < numFrames; i++ ) {
					ary[i] = { x: length * i * -1, y: shift }
				}
			} else {
				for ( ; i < numFrames; i++ ) {
					ary[i] = { x: shift, y: length * i * -1 }
				}
			}

			return ary;
		},

		play: function() {
			var that = this;

			if ( this._isPlaying && !this._isReverse || this._totalFrames < 2 ) {
				return;
			}

			this.pause();

			this._isPlaying = true;
			this._isReverse = false;

			this._timer = setInterval( function() {
				if ( !that._loop && that._currentFrame === that._totalFrames - 1 ) {
					that.pause();
				} else {
					that.setFrame( that._currentFrame + 1 );
				}
			}, this._speed );
			this.setFrame( this._currentFrame + 1 );
		},

		replay: function() {
			this.stop();
			if ( !this._isReverse ) {
				this.play();
			} else {
				this.reverse();
			}
		},

		reverse: function() {
			var that = this;

			if ( this._isPlaying && this._isReverse || this._totalFrames < 2 ) {
				return;
			}

			this.pause();

			this._isPlaying = true;
			this._isReverse = true;

			this._timer = setInterval( function() {
				if ( !that._loop && that._currentFrame === 0 ) {
					that.pause();
				} else {
					that.setFrame( that._currentFrame - 1 );
				}
			}, this._speed );
			this.setFrame( this._currentFrame - 1 );
		},

		pause: function() {
			if ( !this._isPlaying ) return;

			clearInterval( this._timer );
			this._isPlaying = false;
		},

		stop: function() {
			this.pause();
			this.setFrame( 0 );
		},

		setFrame: function( frameNumber ) {
			this._prevFrame = this._currentFrame;

			var current = this._currentFrame = frameNumber >= this._totalFrames ? 0 :
			frameNumber < 0 ? this._totalFrames - 1 :
			frameNumber;

			var pos = this._posList[current];
			this._screen.style.backgroundPosition = '0px 0px';
			if ( this._screen.style.backgroundPosition === '0px 0px' ) {
				this._screen.style.backgroundPosition = pos.x + 'px ' + pos.y + 'px';
			} else {
				this._screen.style.backgroundPositionX = pos.x + 'px';
				this._screen.style.backgroundPositionY = pos.y + 'px';
			}

			this.onUpdate( { type: 'update', frameNumber: current } );
			if ( current === 0 ) {
				this.onFirstFrame( { type: 'first_frame', frameNumber: current } );
			} else if ( current === this._totalFrames - 1 ) {
				this.onLastFrame( { type: 'last_frame', frameNumber: current } );
			}
		},

		setPos: function( num ) {
			this._posList = this._makePosList( this._totalFrames, this._direction, this._frameLength, num );
			this.setFrame( this._currentFrame );
		},

		getSpeed: function() {
			return this._speed;
		},

		setSpeed: function( milliSecond ) {
			this._speed = milliSecond;
			this._fps = Math.floor( 1000 / milliSecond );
		},

		getFPS: function() {
			return this._fps;
		},

		setFPS: function( fps ) {
			this._fps = fps;
			this._speed = Math.floor( 1000 / fps );
		},

		getLoop: function() {
			return this._loop;
		},

		setLoop: function( value ) {
			this._loop = value;
		},

		getCurrentFrame: function() {
			return this._currentFrame;
		},

		getTotalFrames: function() {
			return this._totalFrames;
		},

		setTotalFrames: function( num ) {
			this._totalFrames = num;
		},

		isPlaying: function() {
			return this._isPlaying;
		},

		isReverse: function() {
			return this._isReverse;
		},

		isLoaded: function() {
			return this._isLoaded;
		}

	};

	window.Flipbook = Flipbook;

}( window, document ));