/**************************************************************************************************
* Erstellt s'Nando-Dialog-Fenster ohni zuesätzlichi Style-Sheets (bis uf d'Chnöpf).
**************************************************************************************************/
;(function(ns){
	'use strict';

	var _List = [],
		_Settings = {
			Preserve: !1, //[false:löscht bestehendi dialog weg | true:löscht bestehendi dialog ned weg]
			Share: !1 //[false:blockiert anderi fenster | true:blockiert anderi fenster ned]
		};

	//o:={options}
	function _createBackground(o){
		var tE = _.Element.Create('div', {className: 'Background', 'tabindex': 0});
		tE.style.background = 'rgba(119, 119, 119, 0.25';
		tE.style.height = '100%';
		tE.style.left = '0';
		tE.style.outline = 'none'; 
		tE.style.position = 'absolute';
		tE.style.top = '0';
		tE.style.width = '100%';
		tE.style.zIndex = '100001';

		tE.oncontextmenu = function(){return false};
		tE.onkeyup = function(o, e){_onkeyup(o, e)}.bind(tE, o);

		return tE
	};

	//o:={Body, autoresize}
	function _createBody(o){
		var tB = _.Element.Create('div', {className: 'Body'});
		tB.style.marginTop = '0';
		tB.style.position = 'relative';
		tB.style.width = '100%';

		var tL = _.Element.Create('div', {className: 'Content', 'data-dialogue-autoresize': +!!o.autoResize}, tB);
		tL.style.boxSizing = 'border-box';
		tL.style.marginTop = '0';
		tL.style.overflow = 'hidden';
		tL.style.overflowY = 'auto';
		tL.style.padding = '5px';
		tL.style.position = 'relative';
		tL.style.width = '100%';

		(typeof o.Body === 'object') ? tL.appendChild(o.Body) : tL.innerHTML = o.Body;

		return tB
	};

	//REM: https://stackoverflow.com/questions/27000492/css3-transform-property-working-differently-in-internet-explorer
	//o:={className}
	function _createContainer(o){
		var tE = _.Element.Create('div', {className: o.className || 'Dialogue', 'tabindex': 1});
		//var tE = _.Element.Create('div', {className: o.className || 'Dialogue'});
		//if(!o.className || o.className.indexOf('Dialogue') !== -1){

		if(!o.className || o.className.split(' ').indexOf('Dialogue') !== -1){
			tE.style.backgroundColor = '#666666';
			tE.style.border = 'solid 1px black';
			tE.style.bottom = '50%'; 
			tE.style.boxSizing = 'border-box';
			tE.style.boxShadow = '5px 5px 6px 0px #000';
			tE.style.color = '#ffffff';
			tE.style.display = 'block';
			tE.style.fontFamily = 'Arial, Helvetica, Sans-Serif';
			tE.style.fontSize = '11px';
			tE.style.height = 'auto'; 
			tE.style.marginLeft = '0';
			tE.style.marginRight = '0';
			tE.style.overflow = 'hidden';
			//tE.style.overflow = 'hidden auto';  //REM: Es kann nun testweise vertikal gescrollt werden
			tE.style.outline = 'none'; 
			tE.style.position = 'absolute'; 
			tE.style.right = '50%';
			tE.style.width = 'auto';
			tE.style.zIndex = '20000';
			tE.style.transform = 'translate(50%, 50%)';
			tE.style['-ms-transform'] = 'translate(50%, 50%)';
			tE.style['-webkit-transform'] = 'translate(50%, 50%) scale(1.001)';
			tE.style['-webkit-font-smoothing'] = 'antialiased';

			if(o.Width){
				tE.style.width = o.Width
			}
			else{
				tE.style.maxWidth = '75%';
				tE.style.minWidth = '25%'
			};

			if(o.Height){
				tE.style.height = o.Height
			}
			else{
				tE.style.maxHeight = '75%'
			}
		};

		if(o.id){
			tE.id = o.id
		};

		tE.onkeyup = function(o, e){_onkeyup(o, e)}.bind(tE, o);

		return tE
	};

	//o:={name, class, onclick}
	function _createFunction(o){
		o.Element = _.Element.addStyles(_.Element.Create('button', {className: o.className || 'Round'}), o.Styles);
		o.Element.textContent = o.Name || '';

		if(o.onclick){
			o.Element.onclick = o.onclick.bind(_That, o)
		}
		else{
			o.Element.onclick = function(o){this.Remove(o.Element)}.bind(_That, o);
			o.accessKeys = 'esc,escape,27'
		};

		return o.Element
	};

	//l:=[{Name, className, onclick}]
	function _createFunctions(l){
		var tF = _.Element.addStyles(_.Element.Create('div', {className: 'Functions'}), {position: 'relative', padding: '5px', 'min-height': '35px'});

		if(l && l.length){
			for(var i=0, j=l.length; i<j; i++){
				l[i].Element = _createFunction(l[i]);
				tF.appendChild(l[i].Element)
			}
		};

		return tF
	};

	//o:={Header}
	function _createHeader(o){
		var tE = _.Element.Create('div', {className: 'Title'});
		tE.style.background = '#3d3d3d';
		tE.style.border = 'none';
		tE.style.borderBotEom = '1px solid black';
		tE.style.color = 'orange';
		tE.style.lineHeight = '25px';
		tE.style.height = '25px';
		tE.style.overflow = 'hidden';
		tE.style.position = 'relative';
		tE.style.textIndent = '5px';
		tE.style.textOverflow = 'ellipsis';
		tE.style.whiteSpace = 'nowrap';

		(typeof o.Header === 'object') ? tE.appendChild(o.Header) : tE.innerHTML = o.Header;
        
		return tE
	};

	function _onkeyup(o, event){
		if(o.Functions){
			var tKey = (event.key || event.keyCode || '').toString().toLowerCase();

			if(tKey){
				for(var i=0, j=o.Functions.length; i<j; i++){
					var tAccessKeys = (o.Functions[i].accessKeys || '').toLowerCase().split(','),
						tButton = o.Functions[i].Element;

					if(tAccessKeys.indexOf(tKey) !== -1 && tButton){
						event.stopPropagation();
						tButton.onclick()
					}
				}
			}
		}
	};

	function _onResize(element){
		var tList = element ? [element] : _List;
		if(tList && tList.length){
			for(var i=0, j=tList.length; i<j; i++){
				if(tList[i]){
					var tContent = tList[i].querySelector(".Content[data-dialogue-autoresize='1']");
					if(tContent){
						tContent.style.height = _That.getPotentialContentHeight(tContent) + 'px'
					}
				}
			}
		}
	};

	//e:=<.Dialogue>
	function _Remove(e){
		if(e){
			for(var i=0, j=_List.length; i<j; i++){
				if(_List[i] === e){
					_.Element.Remove(_List.splice(i, 1)[0]);
					break
				}
			}
		}
	};

	function _removeAll(){
		for(var i=_List.length-1; i>=0; i--) _Remove(_List[i])
	};

	var _That = ns.Dialogue = {
		//o:={}
		Init: function(o){
			var tO = o || JSON.parse(JSON.stringify(_Settings)),
				tF = document.createDocumentFragment(),
				tC = tF.appendChild(_createContainer(tO));

			//REM: Falls vorhanden, wird eine Kopfzeile (.Title) hinzugefügt
			if(tO.Header){
				tC.appendChild(_createHeader(tO))
			};

			//REM: Falls vorhanden, wird ein Körper (.Body) hinzugefügt
			if(tO.Body){
				tC.appendChild(_createBody(tO))
			};

			//REM: Andere Dialogue sollen nicht beibehalten werden
			if(!tO.Preserve){
				_removeAll()
			};

			//REM: Es wird zusätzlich ein blockierendes Hintergrund-Element (.Background) erstellt
			if(!tO.Share){
				tF.appendChild(_createBackground(tO)).appendChild(tC)
			};

			//REM: Die übergebenen Funktionen werden als Knopf-Elemente (button) angefügt
			if(tO.Functions && tO.Functions.length){
				(tF.querySelector('.Body') || tF).appendChild(_createFunctions(tO.Functions))
			};

			_List.push(tF.firstChild);

			(tO.Parent || document.body).appendChild(tF);

			//REM: Passt die Höhen und die Breite des Inhalts (.Content) dem zu verfügung stehenden Platz (getPotentialContentHeight()) an
			if(tO.autoResize){
				_onResize(tC)
			};

			tC.focus();

			return tC
		},

		//e:=<element>
		getBody: function(e){
			var tE = function fP(e){return (!e || e.className.indexOf('Dialogue') !== -1) ? e : fP(e.parentNode)}(e);
			return tE
		},

		//e:=<element>
		getContainer: function(e){
			if(e){
				var tB = this.getBody(e);
				return tB.parentNode && tB.parentNode.className === 'Background' ? tB.parentNode : tB
			}
		},

		//e:=<element>
		getPotentialContentHeight: function(e){
			var tR = 0,
				tB = this.getBody(e);

			if(tB){
				var tT = tB.querySelector('.Title'),
					tF = tB.querySelector('.Body > .Functions');

				tR = tB.offsetHeight - (tT ? tT.offsetHeight : 0) - (tF ? tF.offsetHeight : 0)
			};

			return tR
		},

		//e:=<element>
		Remove: function(e){
			_Remove(this.getContainer(e))
		},

		removeAll: function(){
			_removeAll()
		},

		setFunctions: function(e, f){
			var tB = this.getBody(e);

			if(tB){
				//REM: Funktionen entfernen
				_.Element.Remove(tB.querySelector('.Functions'));

				//REM: Funtionen anfügen, sofern vorhanden
				if(f && f.length){
					tB.querySelector('.Body').appendChild(_createFunctions(f));
				};

				//REM: Inhaltshöhe neu berechnen
				tB.querySelector('.Content').style.height = this.getPotentialContentHeight(tB) + 'px'
			}
		}
	};

	if(window.addEventListener){
		var tResize = _onResize.bind(null, null);
		window.removeEventListener('resize', tResize);
		window.addEventListener('resize', tResize)
	}
}(window._ = window._ || {}));