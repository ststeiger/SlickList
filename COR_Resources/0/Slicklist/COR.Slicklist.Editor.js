//https://github.com/mleibman/SlickGrid/wiki/Writing-custom-cell-editors
//_.Slicklist.Editor
;(function(ns){
	'use strict';

	function _elementStyleDefault(c){
		c.style.border = 'none';
		c.style.display = 'block';
		c.style.height = '100%';
		c.style.margin = '0px';
		c.style.padding = '0px';
		c.style.width = '100%';
	};

	function _keyHandlerLeftRight(e, c){
		var tKey = (e.which) ? e.which : e.keyCode;
		if (c.value.trim() === '' || tKey === 37 || tKey === 39) e.stopImmediatePropagation(); //Left, Right
	};

	function _serializeValueDefault(args, c){
		var tO = {};
		tO[args.column.field] = c.value;

		return tO
	};

	function _serializeValueFloat(args, v){ return (tO = {}, tO[args.column.field] = v, tO)};

	ns.Slicklist = ns.Slicklist || {};
	var _That = ns.Slicklist.Editor = {
		onAddingElement: function(){},

		/**************************************************************************************************
		* Bearbeitung des Types [bit]
		**************************************************************************************************/
		Boolean: function(args){
			var tInput = null,
				tScope = this;

			this.init = function(){
				tInput = document.createElement('input');
				tInput.className = 'slick-input-text';
				tInput.type = 'checkbox';
				tInput.onkeydown = tScope.handleKeyDown;

				args.container.appendChild(tInput);
				tScope.focus();

				_elementStyleDefault(tInput)
			};

			this.applyValue = function(item, state){
				item[args.column.field] = tInput.checked
			};

			this.blur = function(){
				_onBlur(args)
			};

			this.destroy = function(){
				args.container.innerHML = ''
			};

			this.focus = function(){
				tInput.focus()
			};

			this.handleKeyDown = function(e){
				_keyHandlerLeftRight(e, tInput)
			};
			
			this.isValueChanged = function(){
				return args.item[args.column.field] != tInput.checked
			};

			this.loadValue = function(item){
				tInput.checked = !!~~(item[args.column.field] || tInput.value)
			};

			this.serializeValue = function(){
				return _serializeValueDefault(args, tInput)
			};		
			
			this.validate = function(){
				return {valid: true, msg: null}
			};

			this.init()
		},

		/**************************************************************************************************
		* Bearbeitung des Types [bit]
		* - Hierbei darf nur ein Wert der Ansicht wahr sein (zum Beispiel bei xxx_isDefault)
		**************************************************************************************************/
		Boolean_OnlyOneTrue: function(args){
			var tInput = null,
				tScope = this;

			this.init = function(){
				tInput = document.createElement('input');
				tInput.className = 'slick-input-text';
				tInput.type = 'checkbox';
				tInput.onkeydown = tScope.handleKeyDown;

				args.container.appendChild(tInput);
				tScope.focus();

				_elementStyleDefault(tInput)
			};

			this.applyValue = function(item, state){
				//REM: Falls der Wert wahr ist, müssen die restlichen unwahr übernehmen
				if(tInput.checked){
					var tSlicklist = _.Slicklist.getSlicklistByChildElement(args.container);

					for(var i=0, j=args.grid.getDataLength(); i<j; i++){
						var tData = args.grid.getDataItem(i);
						tData[args.column.field] = false

						tSlicklist && _.Slicklist.addChange(tSlicklist, args.column, tData)
					}
				};

				item[args.column.field] = tInput.checked
			};

			this.blur = function(){
				_onBlur(args)
			};

			this.destroy = function(){
				args.container.innerHML = ''
			};

			this.focus = function(){
				tInput.focus()
			};

			this.handleKeyDown = function(e){
				_keyHandlerLeftRight(e, tInput)
			};
			
			this.isValueChanged = function(){
				return args.item[args.column.field] != tInput.checked
			};

			this.loadValue = function(item){
				tInput.checked = !!~~(item[args.column.field] || tInput.value)
			};

			this.serializeValue = function(){
				return _serializeValueDefault(args, tInput)
			};		
			
			this.validate = function(){
				return {valid: true, msg: null}
			};

			this.init()
		},

		/**************************************************************************************************
		* Bearbeitung des Types [date]
		**************************************************************************************************/
		Date: function(args){
			var tInput = null,
				tScope = this;

			this.init = function(){
				tInput = args.container.appendChild(document.createElement('input'));
				tInput.className = 'slick-input-date';
				tInput.type = 'text';
				tInput.onkeydown = tScope.handleKeyDown;

				//REM: Datepicker
				$(tInput).datepicker({
					onSelect: function(){},
					showOn: 'focus',
					changeMonth: true,
					showButtonPanel: true,
					showOtherMonths: true,
					changeYear: true,
					regional: (typeof mGlobalLanguage === 'undefined') ? 'de-ch' : mGlobalLanguage
				});

				tScope.focus();
				_elementStyleDefault(tInput)
			};

			this.applyValue = function(item, state){
				item[args.column.field] = ~~state[args.column.field]
			};

			this.blur = function(){
				args.commitChanges()
			};

			this.destroy = function(){
				args.container.innerHML = ''
			};

			this.focus = function(){
				tInput.focus()
			};

			this.handleKeyDown = function(e){
				_keyHandlerLeftRight(e, tInput)
			};
			
			this.isValueChanged = function(){
				return args.item[args.column.field] != tInput.value
			};
			
			this.loadValue = function(item){
				tInput.value = (item[args.column.field] || tInput.value);
				tInput.setSelectionRange(0, 0);
			};

			this.serializeValue = function(){
				return _serializeValueDefault(args, tInput)
			};

			this.validate = function(){
				return {valid: true, msg: null}
			};

			this.init()
		},

		/**************************************************************************************************
		* Bearbeitung des Types [int]
		**************************************************************************************************/
		Integer: function(args){
			var tInput = null,
				tScope = this;

			this.init = function(){
				tInput = args.container.appendChild(document.createElement('input'));
				tInput.className = 'slick-input-text';
				tInput.type = 'text';
				tInput.onkeydown = tScope.handleKeyDown;

				tScope.focus();
				_elementStyleDefault(tInput);

				var tSlicklist = _.Slicklist.getSlicklistByChildElement(args.container);
				(tSlicklist && tSlicklist.onTextEditor) &&  tSlicklist.onTextEditor(args, tSlicklist)
			};

			this.applyValue = function(item, state){
				item[args.column.field] = ~~state[args.column.field]
			};

			this.blur = function(){
				args.commitChanges()
			};

			this.destroy = function(){
				args.container.innerHML = ''
			};

			this.focus = function(){
				tInput.focus()
			};

			this.handleKeyDown = function(e){
				_keyHandlerLeftRight(e, tInput)
			};
			
			this.isValueChanged = function(){
				return args.item[args.column.field] != tInput.value
			};
			
			this.loadValue = function(item){
				tInput.value = (item[args.column.field] || tInput.value);
				tInput.setSelectionRange(0, 0);
			};

			this.serializeValue = function(){
				return _serializeValueDefault(args, tInput)
			};

			this.validate = function(){
				return {valid: true, msg: null}
			};

			this.init()
		},

		/**************************************************************************************************
		* Bearbeitung als Text
		**************************************************************************************************/
		Text: function(args){
			var tInput = null,
				tScope = this;

			this.init = function(){
				tInput = args.container.appendChild(document.createElement('input'));
				tInput.className = 'slick-input-text';
				tInput.type = 'text';
				tInput.onkeydown = tScope.handleKeyDown;
				tInput.required = !!args.column.required;

				tScope.focus();
				_elementStyleDefault(tInput);

				var tSlicklist = _.Slicklist.getSlicklistByChildElement(args.container);
				(tSlicklist && tSlicklist.onTextEditor) &&  tSlicklist.onTextEditor(args, tSlicklist)
			};

			this.applyValue = function(item, state){
				item[args.column.field] = state[args.column.field]
			};

			this.blur = function(){
				args.commitChanges()
			};

			this.destroy = function(){
				args.container.innerHML = ''
			};

			this.focus = function(){
				tInput.focus()
			};

			this.handleKeyDown = function(e){
				_keyHandlerLeftRight(e, tInput)
			};
			
			this.isValueChanged = function(){
				return args.item[args.column.field] != tInput.value
			};
			
			this.loadValue = function(item){
				tInput.value = (item[args.column.field] || tInput.value);
				tInput.setSelectionRange(0, 0);
			};

			this.serializeValue = function(){
				return _serializeValueDefault(args, tInput)
			};

			this.validate = function(){
				var tValidation = {valid: true, msg: null};

				//REM: Obligatorische Felder brauchen einen Wert
				if(tInput.required && !tInput.value.trim()){
					tValidation.valid = false;
					tValidation.msg = 'Required'
				};

				return tValidation
			};

			this.init()
		},

		/**************************************************************************************************
		* Bearbeitung als Auswahl
		**************************************************************************************************/
		Select: function(args){
			this.init = function(){
				var tSelect = args.container.appendChild(document.createElement('select'));

				_elementStyleDefault(tSelect);

				var tSlicklist = _.Slicklist.getSlicklistByChildElement(args.container);
				(tSlicklist && tSlicklist.onSelectEditor) &&  tSlicklist.onSelectEditor(args, tSlicklist);

				//REM: Optionen, falls vorhanden
				if(args.column.referenceTablename){
					var tData = tSlicklist.data[args.column.referenceTablename];
					if(tData && tData.length){
						for(var tF=document.createDocumentFragment(), i=0, j=tData.length; i<j; i++){
							var tText = tData[i].Text,
								tValue = tData[i].Value,
								tColor = (args.column.colorfield && tData[i].Color) || '',
								tBackgroundColor = (args.column.backgroundcolorfield && tData[i].backgroundColor) || '';

							if(args.column.referenceSQL){
								tValue = tData[i][args.column.field];
								tText = tData[i][args.column.displayfield] || tValue;
								tColor = tData[i][args.column.colorfield] || '';
								tBackgroundColor = tData[i][args.column.backgroundcolorfield] || ''
							};

							var tO = tF.appendChild(document.createElement('option'));
							tO.text = tText;
							tO.value = tValue;
							tO.selected = (tO.value === args.item[args.column.field]);

							tO.setAttribute('data-color', tColor);
							tO.setAttribute('data-background', tBackgroundColor);

							if(tColor){
								tO.style.color = tColor
							};

							if(tBackgroundColor){
								tO.style.backgroundColor = tBackgroundColor
							}
						};

						//REM: Leere Auswahl, falls nicht zwingend erforderlich
						if(!args.column.required){
							var tО = tF.appendChild(document.createElement('option'));
							tО.text = tО.value = '';
							tF.insertBefore(tО, tF.firstChild)
						};

						tSelect.appendChild(tF)
					}
				}
			};

			this.applyValue = function(item){
				var tOption = this.getElement().querySelector('option:checked');

				if(tOption){
					item[args.column.field] = tOption.value;

					if(args.column.hasOwnProperty('displayfield')){
						item[args.column.displayfield] = tOption.text
					};

					if(args.column.hasOwnProperty('colorfield')){
						item[args.column.colorfield] = tOption.getAttribute('data-color')
					};

					if(args.column.hasOwnProperty('backgroundcolorfield')){
						item[args.column.backgroundcolorfield] = tOption.getAttribute('data-background')
					}
				}
			};

			this.blur = function(){
				args.commitChanges()
			};

			this.destroy = function(){
				args.container.innerHML = ''
			};

			this.focus = function (){
				this.getElement().focus()
			};

			this.getElement = function(){
				return args.container.querySelector('select')
			};

			this.handleKeyDown = function(e){
				var tKey = e.which ? e.which : e.keyCode;
				if(tKey === 38 || tKey === 40) e.stopImmediatePropagation(); //Up, Down
			};

			this.loadValue = function(item){
				this.getElement().value = (args.item[args.column.field] || this.getElement().value)
			};

			this.isValueChanged = function(){
				return args.item[args.column.field] != this.getElement().value
			};

			this.serializeValue = function(){
				return _serializeValueDefault(args, this.getElement())
			};

			this.validate = function(){
				return {valid: true, msg: null}
			};

			this.init()
		}
	}
}(window._ = window._ || {}));