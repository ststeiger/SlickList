//_.Slicklist.Sorter
;(function(ns){
	'use strict';

	ns.Slicklist = ns.Slicklist || {};
	ns.Slicklist.Sorter = {
		Boolean: function(a, b, s){
			var tA = ~~a,
				tB = ~~b;

			return (tA == tB ? 0 : (tA > tB ? 1 : -1)) * s
		},

		Date: function(a, b, s){
			var tA = (a || ''),
				tB = (b || '');

			tA = (tA.indexOf('/Date') === -1) ? tA = tA.split('.').reverse().join('') : new Date(parseInt(tA.substr(6)));
			tB = (tB.indexOf('/Date') === -1) ? tB = tB.split('.').reverse().join('') : new Date(parseInt(tB.substr(6)));

			return (tA == tB ? 0 : (tA > tB ? 1 : -1)) * s
		},
	
		Float: function(a, b, s){
			var tA = +((a || 0).toString().replace(/['’]/g, '')),
				tB = +((b || 0).toString().replace(/['’]/g, ''));

			return (tA == tB ? 0 : (tA > tB ? 1 : -1)) * s
		}
	}
}(window._ = window._ || {}));