/**************************************************************************************************
* Neui Shared Version von js/Popup-Quatsch basierend uf COR._Dialogue.js
**************************************************************************************************/
;(function(ns){
	'use strict';

	var _lastData = null,
		_lastTop = 0,
		_lineHeight = '25px',
		_Images = {
		Close: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHMSURBVHjapFO/S0JRFP4UIUJIqMWgLQzalAyKIN4TxNXJoZaGIPwHXNMt/A+C1pZabKgQQd9kQ4pS0KBUi4MNNgT+ev54nXPeVTRoqQvfu+ee7zvnnnPvfQ7LsvCf4ZLvSZi/ScIpQScYv+g1QoGQEv15zk4wHo0k2BmJYJzNskB3XuTnkoyPQxKsNLwRnJTEycZwOJRgDAbgmdYF82hfmwSzzb4fGkni4DPoHu5K9sVw2I5wu9HNZKDagXDRKNBuy6Kbywm3ePlgSAUD0zQI+tftLdDrAa0WOIB8BYYEk4851rCWY1Qb1IJpYum6bNCsf97f0xZdoNHAUiwmYJt9zLFGaTFNMOj3ZbF882yQrX9ks0CnA9RqNshmH3OsmY1xqRampz21PR6g2bRtr3dOM6ubq+B9b1Uju7AWjwNvb3YVDLLZxxxrZmPkFurbK9NH4kskgHxeyHqpJLMvGLS3DYVQT6cnt2P4HluY3ILGpy3Bd3dy2i/F4uS0dbbldohjjbod+51wBU+bC5Z1dWZZBzsCXhM05hSviUbxrJU1cdJCZcMlTzng96NSrUqJZM89ZfJLizOaVKA2TEqC8rrjTz/T1quq4D/jW4ABAF7lQOO4C9PnAAAAAElFTkSuQmCC',
		Search: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wgODA8WhUVoUgAAAq1JREFUOMuVkltok2cYx3/vl+9rgqkp7dc2NLbRNh5AbBthXonVOpGBWg9sU6TiQKhCB4KwMnZhwQmK4AEPo1J1ohdOGEwEQRS1OtauG5U6GphxrVoxujRN1jSmsWneZxcqolXQ3+Xz8P8/R8X7UY0b1wemegoafOUz5uVZpk6NjnQNDUWvtB1vfwRwomUL6m2Vz+dTkUhEGjd+vruscmFLoKbesu1i8kwHqVQK1/jdeMeNy98fOXL00HtLT/f7d+3ad1LaO0ala1DLX09FQv+K3H6s5fCltIT6+rI71n26GcDxDr2/qanpF9fcL/AHvOREMaEhk4NnWUVhicXv/7iNMnOgSruLz5lvq0uK7a893tnYVZXE05CxwGmCAiY0jGXBZbso98+sWWQUeicZzJkVmDNmlRIohScJSD4HNQ4GkBMwDLDzweF0o4i5JxkMxYbTliQpcoOhIT0Oz3OgNZgGTLEg3+UgkUmjtWQnGdy9139dEv0bErEkJYUesk6YkBc5A7AsGL59DfF4Y4MPu+PGK+HK1wf98bdfbyWj4R4spcl3gicPPBZMdYIjlyMTvU+or/dCW9vxpybAagUXtHBMqaLPvmvc3xlYqkci9/jzepJZNZ9ge6chApnRBA86L9ETCv/RfvanbwBtfmsq9k4ISim611d1+JumVN8P+2TwxA9nzwxGy+rq6pZVlJfjcjpJDUV0d0/vnqzpbI1GHuWam5tf9LwVim59GeiVcIPIyQp53Do79rPLXvBypIpgsLZhfjC4fKmBG6C+vv710g5CYWdLsCsXWiFyqlJ6lln/HYAgwNVFtZO+rPWrNW8GWurKVg1fXCz6VJX8vdaKtxpUA2w3+CAcpbGxdMFYZkl4wP3s5h3Ppp3D8e4lwHnhw1kzs7ZgG9gAIqf5GP4Hab4Mbrm6FKYAAAAASUVORK5CYII=',
		Select: 'data:image/gif;base64,R0lGODlhEAAQAMQAAP///yJjjN3d3fr7/El/oCdnjy9sk5+7zaG9zuju81aIp1mKqCppkFOGpkyAovf5+z93m42uw9jj6yxqkWORrr7R3bvP3GiVsd3n7QAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAQABAAAAVnoCCOZCkCaKqqJzogS1EsyJC2iRPsvJOgpwGBRwwQbCfEjiGhFBGAk2JnQFkgPEVUAChQU4/IrrDtflHh3aTcOFewu0b5sMRcioeysMg7lgEJQ0UEP38AAwcLOwoHNkBcK5GPJpQiIQA7'
	};

	//o:={}
	function _Close(o){
		(typeof o.onClose === 'function') && o.onClose(o);

		var tB = ns.Dialogue.getBody(o.Dialogue);
		ns.Element.Remove(tB.parentNode.className === 'Background' ? tB.parentNode : tB)
	};

	//o:={Data, Columns}, t:=scrolltop
	function _createBody(o, t){
		var tD = _lastData,
			tT = t || 0;

		if(o && o.Columns && tD){
		//if(o && o.Columns && tD && tD.length){
			var tF = document.createDocumentFragment(),
				tB = ns.Dialogue.getBody(o.Dialogue),
				tC = tB.querySelector('.Content'),
				tV = ns.Element.Clear(tB.querySelector('.Viewport')),
				tH = parseInt(_lineHeight, 10);

			//REM: Scrolle falls nötig
			if(tC.scrollTop !== tT) tC.scrollTop = tT;

			//REM: Viewport apasse
			tV.style.height = tH * tD.length + 'px';

			//REM: Select
			var tS = ns.Element.Create('div');
			tS.style.boxSizing = 'border-box';
			tS.style.cursor = 'pointer';
			tS.style.height = _lineHeight;
			tS.style.width = '40px';
			tS.style.backgroundPosition = '50% 50%';
			tS.style.backgroundRepeat = 'no-repeat';
			tS.style.backgroundImage = 'url("' + _Images.Select + '")';
			tS.style.float = 'left';

			var tMin = Math.floor(tT / tH),
				tMax = tMin + Math.ceil(tC.offsetHeight / tH);

			for(var i=tMin, j=tMax; i<j; i++){
				var tL = ns.Element.Create('div', {className: 'Datarow'}, tV);
				tL.style.backgroundColor = (i % 2 === 0) ? '#777' : '#666';
				tL.style.height = _lineHeight;
				tL.style.position = 'absolute';
				tL.style.top = i * tH + 'px';
				tL.style.width = '100%';

				var tC = tL.appendChild(tS.cloneNode(true));
				tC.onclick = function(o, d){_Select(o, d)}.bind(tC, o, tD[i]);

				for(var m=0, n=o.Columns.length; m<n; m++){
					var tE = ns.Element.Create('div', {
						textContent: tD[i][o.Columns[m].ID],
						title: tD[i][o.Columns[m].ID],
						'data-column': m
					}, tL);

					tE.style.float = 'left';
					tE.style.height = tE.style.lineHeight = _lineHeight;
					tE.style.overflow = 'hidden';
					tE.style.position = 'relative';
					tE.style.textIndent = '5px';
					tE.style.textOverflow = 'ellipsis';
					tE.style.whiteSpace = 'nowrap';
					tE.style.width = 'calc((100% - 80px)/' + n + ')' //REM: -80 = Select + Close
				};

				//REM: Selected
				if(o.Selected && o.Selected.ID && o.Selected.Value && tD[i][o.Selected.ID] === o.Selected.Value){
					tL.className = (tL.className + ' Selected').trim();
					tL.style.backgroundColor = 'orange'
				}
			}
		};

		_lastTop = tT;

		return tF
	};

	//o:={Data, Columns}
	function _createHeader(o){
		var tF = document.createDocumentFragment();

		if(o && o.Columns){
			//REM: Zile eis: Suchfelder
			var tZ1 = ns.Element.Create('div', null, tF);
			tZ1.style.height = _lineHeight;

			//REM: Search
			var tS = ns.Element.Create('div', {className: 'Search'}, tZ1);
			tS.style.borderRight = '1px dotted transparent';
			tS.style.boxSizing = 'border-box';
			tS.style.cursor = 'pointer';
			tS.style.height = _lineHeight;
			tS.style.width = '40px';
			tS.style.backgroundPosition = '50% 50%';
			tS.style.backgroundRepeat = 'no-repeat';
			tS.style.backgroundImage = 'url("' + _Images.Search + '")';
			tS.style.float = 'left';
			tS.onclick = function(){_Search(this)}.bind(o);

			//REM: Close
			var tC = ns.Element.Create('div', {className: 'Close'}, tZ1);
			tC.style.borderLeft = '1px dotted transparent';
			tC.style.boxSizing = 'border-box';
			tC.style.cursor = 'pointer';
			tC.style.height = _lineHeight;
			tC.style.width = '40px';
			tC.style.backgroundPosition = '50% 50%';
			tC.style.backgroundRepeat = 'no-repeat';
			tC.style.backgroundImage = 'url("' + _Images.Close + '")';
			tC.style.position = 'absolute';
			tC.style.right = '0px';
			tC.onclick = function(){_Close(this)}.bind(o);

			//REM: Zile zwei: Spalte-Bezeichnige
			var tZ2 = ns.Element.Create('div', {className: 'Columns'}, tF);
			tZ2.style.height = _lineHeight;

			var tS2 = ns.Element.Create('div', null, tZ2);
			tS2.style.height = _lineHeight;
			tS2.style.width = '40px';
			tS2.style.float = 'left';

			//REM: Spaltene
			for(var i=0, j=o.Columns.length; i<j; i++){
				//REM: Bezeichnige
				var tI = ns.Element.Create('span', {
					textContent: o.Columns[i].Label,
					title: o.Columns[i].Label,
					'data-column': i
				}, tZ2);

				tI.style.cursor = 'pointer';
				tI.style.display = 'block';
				tI.style.float = 'left';
				tI.style.overflow = 'hidden';
				tI.style.textOverflow = 'ellipsis';
				tI.style.whiteSpace = 'nowrap';
				tI.style.width = 'calc((100% - 80px)/' + j + ')';
				tI.onclick = function(o, id){_Sort(this, o, id)}.bind(tI, o, o.Columns[i].ID);

				//REM: Suechfelder
				var tE = ns.Element.Create('input', {
					type: 'text',
					value: o.Columns[i].Default || '',
					placeholder: o.Columns[i].Label,
					title: o.Columns[i].Label,
					'data-column': i
				}, tZ1);

				tE.style.borderRadius = '4px';
				tE.style.boxSizing = 'border-box';
				tE.style.float = 'left';
				tE.style.height = _lineHeight;
				tE.style.outline = '0';
				tE.style.textIndent = '5px';
				tE.style.width = 'calc((100% - 80px)/' + j + ')'; //REM: -80 = Search + Close

				!o.Columns[i].Searchable && tE.setAttribute('readonly', 'readonly')
			}
		}
        
		return tF
	};

	//o:={Data, Columns}, s:=[{Search}]
	function _createViewport(o, s){
		var tD = _Filter(o, s);

		if(tD && tD.length){
			var tV = ns.Element.Create('div', {className: 'Viewport'});
			tV.style.width = '100%';
			tV.style.height = parseInt(_lineHeight, 10) * tD.length + 'px';

			return tV
		}
	};

	//o:={Data, Columns}, s:=[{Search}]
	function _Filter(o, s){
		var tO = JSON.parse(JSON.stringify(o.Data)),
			tD = [];

		if(o && o.Columns && tO){
			for(var i=0, j=tO.length; i<j; i++){
				var tV = 1;

				for(var m=0, n=o.Columns.length; m<n; m++){
					//REM: Default-Suechi
					if(!s){
						if(o.Columns[m].Default && tO[i][o.Columns[m].ID] !== o.Columns[m].Default){
							tV = 0;
							break
						}
					}
					//REM: Suechi
					else{
						if(s[m] && s[m].Value && (tO[i][o.Columns[m].ID] || '').toString().toLowerCase().indexOf(s[m].Value) === -1){
							tV = 0;
							break
						}
					}
				};

				tV && tD.push(tO[i])
			}
		};

		_lastData = tD;

		return _lastData
	};

	//REM: Bis de Portal.Waiting/Basic.Waiting i de Resources ibunde isch
	function _getWaiting(){
		if(typeof Basic !== 'undefined' && typeof Basic.Waiting !== 'undefined'){
			return Basic.Waiting
		}
	};

	//o:={}
	function _Search(o){
		var tD = ns.Dialogue.getBody(o.Dialogue),
			tW = _getWaiting();

		tW && tW.Start(tD);

		window.setTimeout(function(d, w){
			var tC = tD.querySelector('.Content');

			for(var tQ=1, tS={}, i=0, j=o.Columns.length; i<j; i++){
				if(o.Columns[i].Searchable){
					var tE =  d.querySelector('.Title input[data-column="' + i + '"]'),
						tV = tE.value.toLowerCase();

					tE.style.backgroundColor = '';

					if(o.Columns[i].Required && !tV){
						tQ = 0,
						tE.style.backgroundColor = 'crimson'
					}
					else if(tV){
						tS[i] = {Value: tV}
					}
				}
			};

			if(tQ){
				_Filter(o, tS);
				_createBody(o)
			};

			w && w.Stop(d)
		}.bind(this, tD, tW), 100)
	};

	//o:={}, d:={data}
	function _Select(o, d){
		(typeof o.onSelect === 'function') && o.onSelect(d, o);

		var tB = ns.Dialogue.getBody(o.Dialogue);
		ns.Element.Remove(tB.parentNode.className === 'Background' ? tB.parentNode : tB)
	};

	//e:=<element />, o:={}, i:=id
	function _Sort(e, o, i){
		var tD = ns.Dialogue.getBody(o.Dialogue),
			tW = _getWaiting();

		tW && tW.Start(tD);

		window.setTimeout(function(e, i, d, w){
			var tO = e.getAttribute('data-sort-order'),
				tS = _lastData.sort(function(a, b){
				var tA = (a[i] || '').toString().toLowerCase(),
					tB = (b[i] || '').toString().toLowerCase();

					if(!isNaN(tA) && !isNaN(tB)){
						return +(tA) > +(tB) ? 1 : -1
					}
					else{
						return tA > tB ? 1 : -1
					}
				});

			if(tO && tO === 'asc'){
				e.setAttribute('data-sort-order', 'desc');
				tS = tS.reverse()
			}
			else{
				e.setAttribute('data-sort-order', 'asc')
			};

			_createBody(o, _lastTop);

			w && w.Stop(d)
		}.bind(this, e, i, tD, tW), 100)
	};

	ns.Dialogue.Filter = {
		//o:={Data, Columns, Selected}
		Init: function(o){
			if(o){
				o.Header = _createHeader(o);
				o.Body = _createViewport(o);

				var tD = ns.Dialogue.Init(o),
					tC = tD.querySelector('.Content'),
					tT = tD.querySelector('.Title')//,
					//tS = tD.querySelector('.Selected');

				o.Dialogue = tD;

				tT.style.height = parseInt(_lineHeight, 10)*2 + 'px';
				tT.style.overflowY = 'scroll';

				if(tC){
					tC.style.padding = '0';
					tC.style.maxHeight = tD.offsetHeight - tT.offsetHeight + 'px';
					tC.style.overflowY = 'scroll';
					tC.onscroll = function(o){
						window.clearTimeout(o.Timer);
						o.Timer = window.setTimeout(function(t){
							delete this.Timer;
							_createBody(this, t)
						}.bind(o, this.scrollTop), 500)
					}.bind(tC, o);

					_createBody(o)

					//if(tS){
					//	tC.scrollTop = tS.offsetTop
					//}
				}
			}
		}
	};

	var _That = ns.Dialogue.Filter
}(window._ = window._ || {}));