;(function(ns){
	'use strict';

	ns.QueryString = {
		//k:='key', l:='link'
		Read: function(k, l){
			var tP = null;

			if(k){
				tP = (l || document.location.href).split(k + '=')[1]
			};

			return tP ? decodeURIComponent(tP.split('&')[0]) : ''
		},

		readAll: function(link){
			var tListOfPairs = [],
				tPairs = (link || document.location.href).slice(window.location.href.indexOf('?') + 1).split('&');

			if(tPairs.length){
				for(var i=0, j=tPairs.length; i<j; i++){
					var tPair = tPairs[i].split('=');
					tListOfPairs[tPair[0]] = tPair[1]
				}
			};

			return tListOfPairs
		}
	}
}(window._ = window._ || {}));