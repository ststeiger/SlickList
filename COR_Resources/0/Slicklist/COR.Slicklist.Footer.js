//_.Slicklist.Footer
;(function(ns){
	'use strict';

	ns.Slicklist = ns.Slicklist || {};
	var _That = ns.Slicklist.Footer = {
		/**************************************************************************************************
		* Stellt die beiden Werte gegenüber
		**************************************************************************************************/
		Boolean: function(value, length){
			return '@Value. (@Length.)'
				.replace('@Value.', value)
                .replace('@Length.', length);
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten zurück
		**************************************************************************************************/
		Float: function(value, length){
            return (value || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'");
		},

		/**************************************************************************************************
		* Gibt eine ganze Zahl zurück
		**************************************************************************************************/
		Integer: function(value, length){
            return (value || 0).toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'");
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (m) zurück
		**************************************************************************************************/
		Meters: function(value, length){
			//return (v || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'") + 'm'
            return (value || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'");
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (m2) zurück
		**************************************************************************************************/
		Squaremeters: function(value, length){
			//return (v || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'") + 'm2'
            return (value || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'");
		}
    };
}(window._ = window._ || {}));
