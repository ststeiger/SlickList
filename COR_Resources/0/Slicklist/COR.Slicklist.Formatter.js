//_.Slicklist.Formatter
;(function(ns){
	'use strict';

	//REM: Ist einfacher als die Bilder im ganzen Projekt zu verstreuen - eine erweiterte Resources.ashx wäre wohl ideal (todo)
	var _Images = [];
	_Images['true'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAMAAACeyVWkAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGHRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuMzap5+IlAAAAVFBMVEUAAAAeywAgxwAhyAAgyQAhyAAgyQAgyQAcUYAcYmwdaWYdfFEfrB4hyQBB0CVV1Txn2lF33WOF4XSU5YWh6JSu66O77rHH8b/d9tnp+eb0/PP///9bgsevAAAACHRSTlMAGU56nK7D2mEwif8AAAB+SURBVBjTpdE3DgMxDERR2utAhy9pkzfM/e/pYgsJEuDGv3wAm6HZX3Vda6fbtcXz/WJmZl724kBz5Qbe1mhP9EZHwtroDB/VusCorEtMkvZAVNYnMEiJsBXqM4RtgkmlaoB03JeqALDU2gNJtW6BsDaq1O+q1N0febUf7/gCx3AQ+9msUCMAAAAASUVORK5CYII=';
	_Images['false'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGHRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuMzap5+IlAAAANklEQVQ4T2NgGAVDJwRkAhv+k4tx+hJkIDkApG/UUOwhMBqm5KQocNoeTVLDIUlRvZSidiENAMb7DSrn96JPAAAAAElFTkSuQmCC';
	_Images['remove'] = 'data:image/gif;base64,R0lGODlhDwAPAOccAAAAAIAAAACAAICAAAAAgIAAgACAgMDAwMDcwKbK8P+EhP8ICP8QEP8YGP8hIf85Of9CQv9SUv9jY/9zc/+EhP+lpf+trf+1tf/Gxv/Ozv/v7//39//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////78KCgpICAgP8AAP///////////////////////yH5BAEKAP8ALAAAAAAPAA8AAAgxAP8JHEiwoMGDCBMqXMjwn4MFAhs4UOjAAYOJC/NBXOggXz6MCC1GBNmwpMmTKAUGBAA7';

	ns.Slicklist = ns.Slicklist || {};
	var _That = ns.Slicklist.Formatter = {
		/**************************************************************************************************
		* Jeder Formatter sollte schlussendlich auf diesen Verweisen
		**************************************************************************************************/
		Any: function(r, c, v, cd, dc, opt){
            var tV = v || '',
				tColor = dc[cd.colorfield],
				tBackground = dc[cd.backgroundcolorfield];

			if(
				(tColor || tBackground) &&
				((tColor || '#FFFFFF') !== (tBackground || '#FFFFFF'))
			){
				tV = "<font class = 'slick-formatter-colorise' style = '@Color. @Background.'>@Value.</font>"
					.replace('@Color.', tColor ? 'color: ' + tColor + ';' : '')
					.replace('@Background.', tBackground ? 'background-color: ' + tBackground + ';' : '')
					.replace('@Value.', tV)
			};

			return tV
		},

		/**************************************************************************************************
		* Für das Öffnen von Aperture-Zeichnungen aus Übersichten
		**************************************************************************************************/
		Aperture: function(r, c, v, cd, dc, opt){
			var tV = '',
				tN1 = Object.getOwnPropertyNames(dc).filter(function(e){return e.indexOf('_ApertureObjID') > -1}).pop(),
				tN2 = Object.getOwnPropertyNames(dc).filter(function(e){return e.indexOf('_ParentApertureObjID') > -1}).pop();

			if((v || dc[tN1] || '').length > 3){
				tV = "<div class = 'slick-formatter-icon _resDWG' onclick = 'return _.Slicklist.Edit(this, " + r + ", \"Aperture\")'></div>"
			}
			else if((dc[tN2] || '').length > 3){
				tV = "<div class = 'slick-formatter-icon iDWG2' onclick = 'return _.Slicklist.Edit(this, " + r + ", \"Aperture\")'></div>"
			};

			return _That.Any(r, c, tV, cd, dc, opt, 'Aperture')
		},

		/**************************************************************************************************
		* Gibt den Wert als Boolean zurück
		**************************************************************************************************/
		Boolean: function(r, c, v, cd, dc, opt){		
            return _That.Any(
				r,
				c,
				"<div data-value = '@Value.' class = 'slick-formatter-icon' style = 'background-image: url(\"@Image.\")'></div>"
					.replace('@Value.', (!!v).toString())
					.replace('@Image.', _Images[(!!v).toString()]),
				cd,
				dc,
				opt,
				'Boolean'
			)
		},

		/**************************************************************************************************
		* Datum im deutschen Format
		**************************************************************************************************/
		Date: function(r, c, v, cd, dc, opt){
			var tV = v;
			if(tV && tV.indexOf('/Date') !== -1){
				var tD = new Date(parseInt(v.substr(6)));
				tV = 'dd.MM.yyyy'
					.replace('dd', ('0' + tD.getDate()).slice(-2))
					.replace('MM', ('0' + (tD.getMonth() + 1)).slice(-2))
					.replace('yyyy', tD.getFullYear())
			};

			return _That.Any(r, c, tV, cd, dc, opt, 'Date')
		},

		/**************************************************************************************************
		* Datum und Zeit im deutschen Format
		**************************************************************************************************/
		DateTime: function(r, c, v, cd, dc, opt){
			var tV = v;
			if(tV && tV.indexOf('/Date') !== -1){
				var tD = new Date(parseInt(v.substr(6)));
				tV = 'dd.MM.yyyy hh:mm'
					.replace('dd', ('0' + tD.getDate()).slice(-2))
					.replace('MM', ('0' + (tD.getMonth() + 1)).slice(-2))
					.replace('yyyy', tD.getFullYear())
					.replace('hh', ('0' + tD.getHours()).slice(-2))
					.replace('mm', ('0' + tD.getMinutes()).slice(-2))
					.replace(' 00:00', '')
			};

			return _That.Any(r, c, tV, cd, dc, opt, 'DateTime')
		},

		/**************************************************************************************************
		* Herunterladen
		* A) Für das Herunterladen von Dateien
		**************************************************************************************************/
		Download: function(r, c, v, cd, dc, opt){
			var tValue = '';
			if(v) tValue = "<div class = '_Res "+ (dc.IsLink ? '_resLink' : '_resDownload') + " slick-formatter-icon' onclick = 'return _.Slicklist.Edit(this, " + r + ", \"Download\")'></div>";
			return _That.Any(r, c, tValue, cd, dc, opt, 'Download')
		},

		/**************************************************************************************************
		* Bearbeiten - Öffnen der Formulare
		* A) Erstellt einen <div /> mit der Klasse i+[OBJT_Code]
		* B) Reagiert auf _.Slicklist.Edit
		**************************************************************************************************/
		Edit: function(r, c, v, cd, dc, opt){
			var tV = "<div class = 'slick-formatter-icon _resEdit _resOBJT@OBJT.' onclick = 'return _.Slicklist.Edit(this, @Row.)'></div>"
				.replace(/@OBJT./g, dc.OBJT_Code || dc.OBJ_OBJT_Code || (opt.Parameters && opt.Parameters.OBJ_OBJT_Code) || 'Edit')
				.replace('@Row.', r);

			if(dc._isNew | dc._isRemoved){
				tV = ''
			};

			return _That.Any(r, c, tV, cd, dc, opt, 'Edit')
		},

		/**************************************************************************************************
		* Gibt das Symbol aus, falls der Wert wahr ist.
		**************************************************************************************************/
		Flagged: function(r, c, v, cd, dc, opt){
			var tValue = '';

			if(v){
				tValue = "<div class = 'slick-formatter-icon _resRequiresAttention'></div>"
			};

            return _That.Any(r, c, tValue, cd, dc, opt, 'Flagged')
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten zurück
		**************************************************************************************************/
		Float: function(r, c, v, cd, dc, opt){          
            return _That.Any(
				r,
				c,
				(v || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'"),
				cd,
				dc,
				'Money'
			)
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (m) zurück
		**************************************************************************************************/
		Meters: function(r, c, v, cd, dc, opt){
			return _That.Any(
				r,
				c,
				(v || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'"),
				cd,
				dc,
				'Meters'
			)
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (CHF) zurück
		**************************************************************************************************/
		Money: function(r, c, v, cd, dc, opt){
            return _That.Any(
				r,
				c,
				((isNaN(v) ? 0.00 : parseFloat(v)) || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'"),
				cd,
				dc,
				'Money'
			)
		},

        /**************************************************************************************************
        * Upload 
        **************************************************************************************************/
        Upload: function (r, c, v, cd, dc, opt){
			var tValue = '';

			if(v){
				tValue = '<label class="_Res _resCloud slick-formatter-icon" style=display: block; position: absolute; top: 0; bottom: 0; left: 0; right: 0;" ><input type="file" onchange="return _.Slicklist.uploadRow(this, @Row., \'@Field.\')" name="uploadFile" id="file"  style="display: block; opacity: 0;" /></label>'
					.replace('@Field.', cd.field)
					.replace('@Row.', r)
			};

            return _That.Any(r, c, tValue, cd, dc, opt, 'Upload');
        },

		/**************************************************************************************************
		* Bericht
		* A) Erstellt einen Link <a /> für das Öffnen von Berichten
		**************************************************************************************************/
		Report: function(r, c, v, cd, dc, opt){
			var tValue = '';

			if(v){
				tValue = "<a class = '_Res _resReport slick-formatter-icon' target = '_blank' href = '@Value.'></a>"
					.replace('@Value.', v)
			};

			return _That.Any(r, c, tValue, cd, dc, opt, 'Report')
		},

		/**************************************************************************************************
		* Entfernen
		* A) Erstellt einen <div /> mit der Klasse iRemove
		* B) Reagiert auf _.Slicklist.Remove
		**************************************************************************************************/
		Remove: function(r, c, v, cd, dc, opt){
			var tValue = '';
			if(v){
				tValue = "<div class = 'slick-formatter-icon' style = 'background-image: url(\"@Image.\")' onclick = 'return _.Slicklist.removeRow(this, @Row.)'></div>"
					.replace('@Image.', _Images['remove'])
					.replace('@Row.', r)
			};

			return _That.Any(r, c, tValue, cd, dc, opt, 'Remove')
		},

		/**************************************************************************************************
		* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (m2) zurück
		**************************************************************************************************/
		Squaremeters: function(r, c, v, cd, dc, opt){          
            return _That.Any(
				r,
				c,
				(v || 0.00).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1'"),
				cd,
				dc,
				'Squaremeters'
			)
		},

		/**************************************************************************************************
		* Für das Öffnen von SVG-Zeichnungen aus Übersichten
		**************************************************************************************************/
		SVGLink: function(r, c, v, cd, dc){
			return v ? "<div class = 'slick-formatter-icon iSVG' onclick = 'return _.Slicklist.Edit(this, " + r + ", \"SVGLink\")'></div>" : ''
		},


		/**************************************************************************************************
		* Textarea
		* A) Erstellt eine textarea
		**************************************************************************************************/
		Textarea: function(r, c, v, cd, dc, opt){
			var tValue = '';
			if(v){
				tValue = "<textarea readonly='readonly' style='min-height:@H.;max-height:@H.;'>@Value.</textarea>".replace('@Value.', v).replace(/@H./g, (opt && opt.rowHeight ?  opt.rowHeight + 'px' : 'px' ))
			};

			return _That.Any(r, c, tValue, cd, dc, opt, 'Textarea')
		},
	}
}(window._ = window._ || {}));