//REM: Das Weitergeben von Ereignissen wäre auch über postmessage möglich! (todo)

//_.Slicklist
;(function(ns){
	'use strict';

	var _Lists = [], //REM: Instanzen von Slicklist
		_isInitialised = false; //REM: Setzt den Wert auf true, sobald initialisiert wurde

	/**************************************************************************************************
	* Fügt dem TopPanel des SlickGrids eine Handlungsbox an und gibt diese zurück
	**************************************************************************************************/
	function _addPanelActionBox(slicklist, event){
		var tPanel = slicklist.grid.getTopPanel(),
			tBox = tPanel.querySelector('.slick-event-box'),
			tNode = null;

		if(tPanel && event){
			if(!tBox){
				tBox = tPanel.appendChild(document.createElement('div'));
				tBox.className = 'slick-event-box'
			};

			var tNode = tBox.appendChild(document.createElement('span'));
			tNode.className = 'slick-event';
			tNode.onclick = event.bind(tNode, slicklist)
		};

		return tNode
	};

	/**************************************************************************************************
	* Fügt eine Änderung hinzu
	**************************************************************************************************/
	function _addChange(slicklist, column, item){
		try{
			if(slicklist){
				var tChanges = slicklist.listOfChanges || [],
					tID = item.id,
					tO = null;

				for(var i=0, j=tChanges.length; i<j; i++){
					if(tChanges[i].id === tID){
						tO = tChanges[i];
						tO[column.field] = item[column.field];
						break
					}
				};

				if(!tO){
					tO = {id: tID};
					tO[column.field] = item[column.field];
					tChanges.push(tO)
				};

				slicklist.listOfChanges = tChanges;

				if(slicklist.listOfChanges && slicklist.listOfChanges.length && typeof slicklist.onHasChanges === 'function'){
					slicklist.onHasChanges(slicklist.listOfChanges)
				}
			}
		}
		catch(err){_Log('_addChange', err)}
	};

	/**************************************************************************************************
	* Fügt einem Verweis die aktuellen QueryString-Parameter an
	**************************************************************************************************/
	function _addValuesToLink(link){
		var tQueryString =_.QueryString.readAll();

		//REM: Link-Werte ersetzen
		for(var tKey in tQueryString){
			if(link.indexOf(tKey + '=') === -1){
				link += '&' + tKey + '=' + encodeURIComponent(tQueryString[tKey])
			}
		};

		//REM: Cache setzen
		if(link.indexOf('Cache=') === -1){
			link += '&Cache=' + +new Date
		};

		return link
	};

	/**************************************************************************************************
	* Setzt das Ereignis beim Vergrössern/Verkleinern des Fensters
	**************************************************************************************************/
	function _addResizeListener(window){
		try{
			if(window && !window.slicklistResize){
				if(window.addEventListener){
					//window.addEventListener('resize', function(){_.Slicklist.onResize()}, true)
					window.addEventListener('resize', _.Slicklist.onResize, true)
				}
				else if(window.attachEvent){
					//window.attachEvent('onresize', function(){_.Slicklist.onResize()})
					window.attachEvent('onresize', _.Slicklist.onResize)
				};

				window.slicklistResize = true
			}
		}
		catch(err){_Log('_addResizeListener', err)}
	};

	/**************************************************************************************************
	* Gibt die Änderungen automatisch an das Änderungsskript (falls definiert)
	**************************************************************************************************/
	function _automaticallySaveChanges(slicklist){
		try{
			if(
				slicklist &&
				slicklist.grid.getOptions().sqlchanges &&
				typeof slicklist.globalPath === 'string' &&
				slicklist._isValid
				//_validateGrid(slicklist)
			){
				var tXML = _That.getChangesAsXML(slicklist);
				if(tXML){
					var tL = slicklist.globalPath + '/ajax/Data.ashx?SQL=@SQL.'
						.replace('@SQL.', slicklist.grid.getOptions().sqlchanges);

					_That.AJAX().Post(_addValuesToLink(tL), '&Changes=' + tXML, function(r, slicklist){
						if(r){
							r = JSON.parse(r.responseText);

							if(r.toString().indexOf('@@Error: ') === -1){
								var tGrid = slicklist.grid,
									tR = r.Table || r;

								//REM: Neue [id] setzen
								if(tR && tR.length){
									for(var m=0, n=tGrid.getDataLength(); m<n; m++){
										for(var i=0, j=tR.length; i<j; i++){
											var tItem = tGrid.getDataItem(m);

											if(tR[i].oldid && tR[i].oldid === tItem.id){
												//REM: Die Slick.Data.DataView verwaltet die id in einer privaten Variabel "idxById".
												//REM: Diese kann scheinbar nicht manuell aktualisiert werden. Daher delete & add
												if(slicklist.dataView){
													slicklist.dataView.deleteItem(tItem.id)
												};

												tItem.id = tR[i].newid;

												if(slicklist.dataView){
													slicklist.dataView.addItem(tItem)
												};

												delete tItem._isNew;
												break
											}
										}
									}
								};

								slicklist.listOfChanges = null;

								//REM: Liste neu Laden
								if(r.Table1 && r.Table1.length && r.Table1[0].Reload){
									if(tGrid.getEditorLock().isActive()){
										tGrid.getEditorLock().cancelCurrentEdit()
									};

									_.Slicklist.Reload(slicklist)
								}
							}
							else{
								_onError(slicklist, r.toString().substr(9))
							}
						}
					}, slicklist)
				}
			}
		}
		catch(err){_Log('_automaticallySaveChanges', err)}
	};

	/**************************************************************************************************
	* Erstellt ein Update-XML aus den übergebenen Spalten
	**************************************************************************************************/
	function _columnsToSettingArray(columns, visibility){
		var tA = [];

		if(columns && columns.length){
			for(var i=0, j=columns.length; i<j; i++){
				columns[i].id && tA.push(
					'<column uid="@uid." sort="@sort." visible="@visible."/>'
						.replace('@uid.', columns[i].id)
						.replace('@sort.', i*10)
						.replace('@visible.', visibility !== null ? visibility : !!columns[i].show)
				)
			}
		};

		return tA.join('')
	};

	/**************************************************************************************************
	* Erstellt den HTML-Behälter für das Slickgrid
	**************************************************************************************************/
	function _createContainer(slicklist){
		var tR = null;

		try{
			if(slicklist && slicklist.container){
				//REM: Leert den Inhalt des Behälters
				if(slicklist.clearContainer === true){
					while(slicklist.container.firstChild) slicklist.container.removeChild(slicklist.container.firstChild)
				};

				//REM: Erstellt den Behälter für das Slickgrid
				tR = slicklist.container.querySelector('#' + slicklist.id + '_Slicklist')
				if(!tR){
					tR = slicklist.container.appendChild(document.createElement('div'));
					tR.id = slicklist.id + '_Slicklist';
					tR.className = 'Result Slicklist';
					tR.innerHTML = '#' + tR.id;

					slicklist.HTMLElement = tR
				}
			}
		}
		catch(err){_Log('_createContainer', err)};

		return tR
	};

	/**************************************************************************************************
	* Erstellt das SlickGrid-Objekt mit den abhängigen Plugins und Einstellungen
	**************************************************************************************************/
	function _createSlickgrid(slicklist, cache){
		try{
			var tOptions = slicklist.data.options[0],
				tColumns = JSON.parse(JSON.stringify(slicklist.data.columns)),
				tData = slicklist.data.data;

			//REM: Versteckte Spalten entfernen
			if(tColumns && tColumns.length){
				for(var i=tColumns.length-1; i>=0; i--){
					if(!tColumns[i].show){
						tColumns.splice(i, 1)
					}
				}
			};

			//REM: Gibt nur eine Zeile von Parametern
			if(slicklist.data){
				slicklist.data.parameters = slicklist.data.parameters ? slicklist.data.parameters[0] : {}
			};

			if(tOptions){
				//REM: Funktionen evaluieren
				_evaluateColumnFunctions(tColumns);
				_evaluateColumnFunctions(slicklist.data.columns);

				//REM: Parameter anfügen (für Formatters und Sorters)
				tOptions.Parameters = slicklist.data.parameters;

				//REM: Registriert das Plugin "Slick.CheckboxSelectColumn"
				if(tOptions.hasCheckbox && typeof Slick.CheckboxSelectColumn !== 'undefined'){
					slicklist.checkboxSelector = new Slick.CheckboxSelectColumn({
						cssClass: 'slick-cell-checkboxsel',
						refreshOnSelect: tOptions.editable,
						Formatter: slicklist.checkboxFormatter,
						toolTip: tOptions.checkboxtooltip || ''
					});

					tColumns.unshift(slicklist.checkboxSelector.getColumnDefinition())
				};

				//REM: Slick.Data.DataView
				if(typeof Slick.Data !== 'undefined'){
					//REM: Slick.Data.GroupItemMetadataProvider
					//REM: http://6pac.github.io/SlickGrid/examples/example-draggable-grouping.html
					if(typeof Slick.Data.GroupItemMetadataProvider !== 'undefined'){
						slicklist.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
						slicklist.dataView = new Slick.Data.DataView({
							groupItemMetadataProvider: slicklist.groupItemMetadataProvider,
							inlineFilters: false
						})
					}
					else{
						slicklist.dataView = new Slick.Data.DataView()
					};

					slicklist.grid = new Slick.Grid(slicklist.HTMLElement, slicklist.dataView, tColumns, tOptions);

					if(slicklist.groupItemMetadataProvider){
						slicklist.grid.registerPlugin(slicklist.groupItemMetadataProvider);

						//REM: Standard-Gruppierung
						if(tOptions.groupingKey){
							//REM: Falls es andere/weitere Gruppierungen braucht, soll ein "COR.Slicklist.Grouping.js" begonnen werden
							slicklist.dataView.setGrouping({
								getter: tOptions.groupingKey,

								formatter: function(g){
									return (g.value || '') + "  <span style='color:lime'>(" + g.count + ")</span>";
								}.bind(slicklist),

								collapsed: false,
								lazyTotalsCalculation: true
							})
						}
					}
				}
				else{
					slicklist.grid = new Slick.Grid(slicklist.HTMLElement, tData, tColumns, tOptions)
				};

				//REM: Registriert das Plugin "Slick.Controls.ColumnPicker"
				if(tOptions.enableColumnReorder && typeof Slick.Controls !== 'undefined' && Slick.Controls.ColumnPicker !== 'undefined'){
					slicklist.columnpicker = new Slick.Controls.ColumnPicker(slicklist.data.columns, slicklist.grid, tOptions);

					//REM: Registriert das API-Ereignis "onColumnVisibilityChanged"
					slicklist.columnpicker.onColumnVisibilityChanged.subscribe(function(e, args){
						var tSlicklist = this;

						if(typeof tSlicklist.globalPath === 'string'){
							var tXML = _columnsToSettingArray(args.visibleColumns, 1) + _columnsToSettingArray(args.invisibleColumns, 0);
							if(tXML){
								var tL = tSlicklist.globalPath + '/ajax/Data.ashx?SQL=SL_setColumns&Assembly=COR_Resources';
								_That.AJAX().Post(tL, '&Columns=' + tXML)
							}
						}
					}.bind(slicklist))
				};

				//REM: Registriert das Plugin "Slick.AutoTooltips"
				if(typeof Slick.AutoTooltips !== 'undefined'){
					slicklist.grid.registerPlugin(new Slick.AutoTooltips())
				};

				//REM: Registriert das Plugin "Slick.RowSelectionModel"
				//if(tOptions.hasCheckbox && typeof Slick.RowSelectionModel !== 'undefined'){
				if(typeof Slick.RowSelectionModel !== 'undefined'){
					slicklist.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
					slicklist.checkboxSelector && slicklist.grid.registerPlugin(slicklist.checkboxSelector);

					//REM: Registriert das API-Ereignis "onSelectedRowsChanged"
					slicklist.grid.onSelectedRowsChanged.subscribe(function(e, args){
						var tCanvas = args.grid.getCanvasNode(),
							tClassName = tCanvas.className;

						tClassName = tClassName.replace(/grid-has-selected-cells/g).trim();

						if(args.rows && args.rows.length){
							tClassName += ' grid-has-selected-cells'
						};

						tCanvas.className = tClassName
					})
				};

				//REM: Spezielle Ereignisse mit dem Plugin "Slick.Data.DataView"
				if(slicklist.dataView){
					slicklist.dataView.onRowCountChanged.subscribe(function(e, args){
						var tGrid = this.grid;

						tGrid.updateRowCount();
						tGrid.render();
						_displayRowCount(tGrid, ~~tGrid.getCanvasNode().parentNode.scrollTop, this.options)
					}.bind({grid: slicklist.grid, options: tOptions}));

					slicklist.dataView.onRowsChanged.subscribe(function(e, args){
						var tGrid = this;
						tGrid.setSelectedRows([]);
						tGrid.invalidateRows(args.rows);
						tGrid.render()
					}.bind(slicklist.grid))
				};

				//REM: Export-Funktionen
				if(tOptions.showTopPanel){
					_addPanelActionBox(slicklist, function(slicklist, event){_.Slicklist.Export.Init(slicklist, event)}).appendChild(document.createTextNode('CSV'));
					_addPanelActionBox(slicklist, function(slicklist, event){_.Slicklist.Export.Init(slicklist, event)}).appendChild(document.createTextNode('XLSX'));
					_addPanelActionBox(slicklist, function(slicklist, event){_.Slicklist.Export.Init(slicklist, event)}).appendChild(document.createTextNode('PDF'));

					//REM: API-Ereignis "onCreatingExportFunctions"
					(typeof slicklist.onCreatingExportFunctions === 'function') && slicklist.onCreatingExportFunctions(slicklist.grid.getTopPanel())
				};

				//REM: Registriert das API-Ereignis "onColumnsReordered"
				if(tOptions.enableColumnReorder){
					slicklist.grid.onColumnsReordered.subscribe(function(e, args){
						var tSlicklist = this;

						if(typeof tSlicklist.globalPath === 'string'){
							var tColumns = args.grid.getColumns(),
								tXML = _columnsToSettingArray(tColumns, 1);

							if(tXML){
								var tL = tSlicklist.globalPath + '/ajax/Data.ashx?SQL=SL_setColumns&Assembly=COR_Resources';
								_That.AJAX().Post(tL, '&Columns=' + tXML)
							}
						}
					}.bind(slicklist))
				};

				//REM: Registriert das API-Ereignis "onHeaderRowCellRendered"
				if(tOptions.showHeaderRow){
					//REM: Bei Auswahllisten wird die Suche nach Änderungen ausgeführt.
					$(slicklist.grid.getHeaderRow()).delegate('select', 'change', function(e){
						_onChangeHeaderSelect(this, slicklist)
					});

					//REM: Bei Textfeldern wird die Suche nach "Enter" oder Verlassen des Feldes aufgerufen
					$(slicklist.grid.getHeaderRow()).delegate('input[type=text]', 'keydown', function(e){
						if(e.keyCode == 13 || e.which == 13){
							var tColumn = this.getAttribute('data-column-id');
							if(tColumn){
								slicklist.columnFilters[tColumn] = {Value: this.value.trim()};
								slicklist.dataView && slicklist.dataView.refresh()
							};

							return false
						}
					});

					//REM: Bei Textfeldern wird die Suche nach "Enter" oder Verlassen des Feldes aufgerufen
					$(slicklist.grid.getHeaderRow()).delegate('input[type=text]', 'blur', function(e){
						var tColumn = this.getAttribute('data-column-id');
						if(tColumn){
							slicklist.columnFilters[tColumn] = {Value: this.value.trim()};
							slicklist.dataView && slicklist.dataView.refresh()
						}
					});

					slicklist.grid.onHeaderRowCellRendered.subscribe(function(e, args){
						var tSlicklist = this;
						while(args.node.firstChild) args.node.removeChild(args.node.firstChild);

						if(args.column.showInHeaderRow){
							//REM: Vordefinierter Ausgangswert
							var tFilterValue = _getFilterForColumn(tSlicklist, args.column.id).Value;

							//REM: Bei vorhandener Referenz-Tabelle kann diese als <select /> dargestellt werden
							if(args.column.referenceTablename && tSlicklist.data.hasOwnProperty(args.column.referenceTablename)){
								var tData = tSlicklist.data[args.column.referenceTablename],
									tSelect = args.node.appendChild(document.createElement('select')),
									tSelected = false,
									tMultiple = !!args.column.multiple;

								//REM: Bei Mehrfach-Filter ist das Standard-Konzept des Browsers mit der Steuerungstaste etwas umständlich.
								//REM: Daher wird es hier auf Klick umgeschrieben. Die normale Shift-Bedienung der Tastatur bleibt erhalten.
								if(tMultiple){
									tSelect.setAttribute('multiple', 'multiple');
									tSelect.setAttribute('size', Math.min(tData.length, 10));

									//REM: Im IE wird bei gedrücktem MouseMove die Optionen schwarz (aber nicht selektiert), weiss nicht, was das Feature soll.
									tSelect.onmousemove = function(event){event.preventDefault()};

									//REM: Aktiviert/Deaktiviert die Option
									tSelect.onmousedown = function(event){
										event.preventDefault();

										//REM: Beim ersten MouseDown wird die Auswahlliste vergrössert/angezeigt, daher soll dies die Option noch nicht aktivieren/deaktivieren.
										var tIsFocused = (this === document.activeElement);

										if(tIsFocused){
											var tTarget = event.target;

											//REM: Die Zieloption ausrechnen, da es im IE11 nicht die Option als Ziel zurückgegeben wird:
											//REM: https://stackoverflow.com/questions/24543862/selecting-multiple-from-an-html-select-element-without-using-ctrl-key/27056015
											if(!tTarget || tTarget.tagName !== 'OPTION'){
												var tY = event.clientY - this.getBoundingClientRect().top + this.scrollTop,
													tOptions = this.querySelectorAll('option');

												tTarget = tOptions[Math.floor(tY / (this.scrollHeight / tOptions.length))];
											};

											if(tTarget){
												//REM: Beim Rechtsklick wird die Option fokusiert (immer auf true);
												if(event.which === 3){
													for(var tL=this.querySelectorAll('option:checked'), i=tL.length-1; i>=0; i--){
														tL[i].selected = false
													};

													tTarget.selected = true
												}
												//REM: Ansonsten wir die Auswahl der Option umgekehrt.
												else{
													tTarget.selected = !tTarget.selected
												}
											};

											_onChangeHeaderSelect(this, slicklist);
											setTimeout(function(top){this.scrollTop = top}.bind(this, this.scrollTop), 0)
										}
										else{
											this.focus()
										};

										return false
									}
								}
								//REM: Falls es kein Mehrfach-Filter ist, wird eine 'alle' Option eingefügt
								else{
									var tDefault = tSelect.appendChild(document.createElement('option'));
									tDefault.value = tDefault.text = ''
								};

								for(var tF=document.createDocumentFragment(), i=0, j=tData.length; i<j; i++){
									var tText = tData[i].Text,
										tValue = tData[i].Value,
										tColor = (args.column.colorfield && tData[i].Color) || '',
										tBackgroundColor = (args.column.backgroundcolorfield && tData[i].backgroundColor) || '';

									if(args.column.referenceSQL){
										tValue = tData[i][args.column.field];// || tValue;
										tText = tData[i][args.column.displayfield];// || tText || tValue;
										tColor = tData[i][args.column.colorfield] || '';
										tBackgroundColor = tData[i][args.column.backgroundcolorfield] || ''
									};

									var tO = tF.appendChild(document.createElement('option'));
									tO.text = tText;
									tO.value = tValue;

									//REM: Falls ein Vorfilter-Wert in den Optionen übergeben wurde
									if(tFilterValue){
										if(typeof tFilterValue === 'string'){
											tO.selected = (tO.value === tFilterValue)
										};

										if(typeof tFilterValue === 'object'){
											tO.selected = (tFilterValue.indexOf(tO.value) !== -1)
										}
									}
									//REM: Falls nicht, wird der Vorfilter-Wert aus dem Referenzkatalog beachtet
									else if(tData[i].Selected){
										tO.selected = tSelected = true
									};

									if((tColor || '#FFFFFF') !== (tBackgroundColor || '#FFFFFF')){
										if(tColor){
											tO.style.color = tColor
										};

										if(tBackgroundColor){
											tO.style.backgroundColor = tBackgroundColor
										}
									}
								};

								tSelect.appendChild(tF);
								tSelect.setAttribute('data-column-id', args.column.id);

								//REM: Vorauswahl und Anzeige der Texte bei Mehrfachauswahl
								if(tSelected || tMultiple){
									_onChangeHeaderSelect(tSelect, tSlicklist)
								}
							}
							else{
								var tInput = args.node.appendChild(document.createElement('input'));
								tInput.type = 'text';
								tInput.value = tFilterValue;
								tInput.setAttribute('data-column-id', args.column.id)
							}
						}
					}.bind(slicklist))
				};

				//REM: Registriert das API-Ereignis "onCellChange"
				if(tOptions.editable){
					slicklist.grid.onCellChange.subscribe(function(e, args){
						var tSlicklist = this,
							tRows = args.grid.getSelectedRows();

						_addChange(tSlicklist, args.column, args.item);

						//REM: Mehrfachauswahl
						if(tRows && tRows.length && tRows.indexOf(args.row) !== -1){
							for(var i=0, j=tRows.length; i<j; i++){
								var tData = args.grid.getDataItem(tRows[i]);
								tData[args.column.field] = args.item[args.column.field];

								if(args.column.hasOwnProperty('displayfield')){
									tData[args.column.displayfield] = args.item[args.column.displayfield]
								};

								if(args.column.hasOwnProperty('colorfield')){
									tData[args.column.colorfield] = args.item[args.column.colorfield]
								};

								if(args.column.hasOwnProperty('backgroundcolorfield')){
									tData[args.column.backgroundcolorfield] = args.item[args.column.backgroundcolorfield]
								};

								_addChange(tSlicklist, args.column, tData)
							}
						};

						_revalidate(tSlicklist);
						_automaticallySaveChanges(tSlicklist)
					}.bind(slicklist))
				};

				//REM: Automatisches hinzufügen einer neuen Zeile (im Bearbeitungsmodus)
				if(tOptions.editable && tOptions.enableAddRow){
					slicklist.grid.onAddNewRow.subscribe(function(e, args){
						var tSlicklist = this,
							tData = args.item;

						tData.id = 'new' + +new Date;
						tData._isNew = 1;

						if(slicklist.dataView){
							args.grid.getData().addItem(tData)
						}
						else{
							args.grid.getData().push(tData)
						};

						for(var tKey in tData){
							_addChange(slicklist, {field: tKey}, tData)
						};

						_revalidate(tSlicklist);
						_automaticallySaveChanges(tSlicklist)
					}.bind(slicklist))
				};

				//REM: Sorterungsfunktionen
				slicklist.grid.onSort.subscribe(function(e, args){
					var cols = [];

					if(args.sortCols) cols = args.sortCols;
					if(args.sortCol) cols.push(args);

					var tFooterRow = null
						tData = args.grid.getData();

					//REM: Ausgewählte Zeilen zurücksetzen (indexe ändern sich)
					args.grid.setSelectedRows([]);

					tData.sort(function(dataRow1, dataRow2){
						for(var i=0, l=cols.length; i < l; i++){
							var field = cols[i].sortCol.field,
								sign = cols[i].sortAsc ? 1 : -1;

							//REM: Eigene-Sortierung
							if(typeof cols[i].sortCol.sorter === 'function'){
								return cols[i].sortCol.sorter(dataRow1[field], dataRow2[field], sign, dataRow1, dataRow2)
							}
							//REM: Standard-Sortierung
							else{
								var field = cols[i].sortCol.displayfield || cols[i].sortCol.field,
									value1 = (dataRow1[field] || '').toString().toLowerCase().trim(),
									value2 = (dataRow2[field] || '').toString().toLowerCase().trim(),
									result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;

								if(result != 0){
									return result
								}
							}
						};

						return 0
					});

					args.grid.invalidate()
				});

				//REM: Registriert das API-Ereignis "onBeforeEditCell"
				if(typeof slicklist.onBeforeEditCell === 'function'){
					slicklist.grid.onBeforeEditCell.subscribe(function(e, args){
						var tSlicklist = this;
						if(tSlicklist && typeof tSlicklist.onBeforeEditCell === 'function'){
							return tSlicklist.onBeforeEditCell(e, args, tSlicklist)
						}
					}.bind(slicklist))
				};

				//REM: Registriert das API-Ereignis "onScroll"
				if(tOptions.showTopPanel){
					slicklist.grid.onScroll.subscribe(function(e, args){
						_displayRowCount(args.grid, args.scrollTop, this)
					}.bind(tOptions))
				};

				if(tOptions.explicitInitialization){
					slicklist.grid.init()
				};

				if(slicklist.dataView){
					slicklist.dataView.beginUpdate();
					slicklist.dataView.setItems(tData);
					slicklist.dataView.setFilter(function(item){return _Filter(this, item)}.bind(slicklist));
					slicklist.dataView.endUpdate()
				};

				//REM: Registriert das API-Ereignis "onRenderCompleted"
				if(cache){
					var tOnRenderCompleted = function(e, args){
						var tCache = this;

						if(tCache){
							args.grid.getCanvasNode().parentNode.scrollTop = ~~tCache.scrollTop
						};

						args.grid.onRenderCompleted.unsubscribe(tOnRenderCompleted)
					}.bind(cache);

					slicklist.grid.onRenderCompleted.subscribe(tOnRenderCompleted)
				};

                if(typeof slicklist.onRendered === 'function'){
					slicklist.grid.onRenderCompleted.subscribe(slicklist.onRendered)              
                }
			}
			else{
				_onError(slicklist, 'No options defined')
			}
		}
		catch(err){_Log('_createSlickgrid', err)};
	};

	/**************************************************************************************************
	* Stellt die aktuellen Zeilen-Bereich und die totale Anzahl Zeilen an
	**************************************************************************************************/
	function _displayRowCount(grid, scrollTop, options){
		window.clearTimeout(grid.rowCountTimer);
		grid.rowCountTimer = window.setTimeout(function(grid, scrollTop, options){
			var tPanel = grid.getTopPanel();
			if(tPanel){
				var tViewport = grid.getViewport(scrollTop),
					tLength = grid.getDataLength(),
					tRow = tPanel.querySelector('.slick-top-panel-row');

				if(!tRow){
					tRow = tPanel.appendChild(document.createElement('div'));
					tRow.className = 'slick-top-panel-row'
				};

				//REM: Die Gruppen bei Gruppierungen werden auch in den Viewport miteingerechnet sowie in die Liste der Elemente aufgenommen.
				//REM: Daher müssen diese der Länge wieder angezogen werden.
				for(var i=0, j=grid.getDataLength(); i<j; i++){
					if(grid.getDataItem(i).__group){
						tLength--
					}
				};

				var tGroups = grid.getCanvasNode().querySelectorAll('.slick-group').length;
				tViewport.bottom -= tGroups;

				tRow.innerHTML = (options._Text1 || 'Datensätze @Top. bis @Bottom. von <b>@Length.</b>')
					.replace('@Top.', Math.min(tLength, tViewport.top + 1))
					.replace('@Bottom.', Math.min(tLength, tViewport.bottom))
					.replace('@Length.', tLength);

				grid.rowCountTimer = null
			}
		}.bind(this, grid, scrollTop, options || {}), 100)
	};

	/**************************************************************************************************
	* Wandelt die String-Serlialisierung in eine gültige Funktion um (falls vorhanden)
	**************************************************************************************************/
	function _evaluateColumnFunctions(columns){
		if(columns && columns.length){
			for(var i=0, j=columns.length; i<j; i++){
				columns[i]._export = columns[i].export;
				columns[i]._formatter = columns[i].formatter;

				columns[i].editor = _stringToFunction(columns[i].editor);
				columns[i].export = _stringToFunction(columns[i].export);
				columns[i].footer = _stringToFunction(columns[i].footer);
				columns[i].formatter = _stringToFunction(columns[i].formatter);
				columns[i].sorter = _stringToFunction(columns[i].sorter)
			}
		}
	};

	function _Filter(slicklist, item){
		if(slicklist.columnFilters){
			for(var tID in slicklist.columnFilters){
				if(tID){
					var tColumn = slicklist.grid.getColumns()[slicklist.grid.getColumnIndex(tID)];
					if(tColumn){
						var tObjectToString = function(value){
							return (!isNaN(value) ? value : (value || '')).toString().toLowerCase()
						};

						var tValueIs = tObjectToString(tColumn.hasOwnProperty('displayfield') ? item[tColumn.displayfield] : item[tColumn.field]),
							tValueIs2 = tObjectToString(item[tColumn.field]);

						var tFilterColumn = _getFilterForColumn(slicklist, tID),
							tMustMatch = tFilterColumn.mustMatch;

						if(
							//REM: Falls der Wert exakt übereinstimmen soll und ein 'string' ist..
							(
								tMustMatch &&
								typeof tFilterColumn.Value === 'string' &&
								tFilterColumn.Value &&
								tValueIs.split(',').indexOf(tFilterColumn.Value.toLowerCase()) === -1 &&
								tValueIs2.split(',').indexOf(tFilterColumn.Value.toLowerCase()) === -1
								//tValueIs !== tFilterColumn.Value &&
								//tValueIs2 !== tFilterColumn.Value
							) ||

							//REM: Falls der Wert exakt übereinstimmen soll und ein 'array' ist..
							(
								tMustMatch &&
								typeof tFilterColumn.Value === 'object' &&
								tFilterColumn.Value.length &&
								!tFilterColumn.Value.some(function(v){return tValueIs.split(',').indexOf(v) !== -1}) &&
								!tFilterColumn.Value.some(function(v){return tValueIs2.split(',').indexOf(v) !== -1})
								//tFilterColumn.Value.indexOf(tValueIs) === -1 &&
								//tFilterColumn.Value.indexOf(tValueIs2) === -1
							) ||

							//(tMustMatch && tValueShall && tValueIs !== tValueShall && tValueIs2 !== tValueShall) ||
							(
								!tMustMatch &&
								typeof tFilterColumn.Value === 'string' &&
								tFilterColumn.Value &&
								tValueIs.indexOf(tFilterColumn.Value.toLowerCase()) === -1 &&
								tValueIs2.indexOf(tFilterColumn.Value.toLowerCase()) === -1)
						){
							return false
						}
					}
				}
			}
		};

		return true
	};

	/**************************************************************************************************
	* Holt die Daten über den Link (Slicklist.link) und füllt diese ab
	**************************************************************************************************/
	function _getAndFillContentData(slicklist, cache){
		if(slicklist && slicklist.link && slicklist.link.trim() !== ''){
			if(typeof _That.AJAX() === 'object'){
				(typeof slicklist.onContentLoadingBegin === 'function') && slicklist.onContentLoadingBegin(slicklist);

				_That.AJAX().Post(slicklist.link, slicklist.postValues, function(xhr, slicklist){
					if(xhr.responseText.toString().indexOf('@@Error: ') === -1){
						slicklist.data = JSON.parse(xhr.responseText);
						_createSlickgrid(slicklist, cache);
						_onResize(slicklist)
					}
					else{
						_onError(slicklist, xhr.responseText.toString().substr(9))
					};

					(typeof slicklist.onContentLoadingEnd === 'function') && slicklist.onContentLoadingEnd(slicklist)
				}, slicklist)
			}
			else _onError(slicklist, 'No AJAX-API provided')
		}
		else _onError('No container provided')
	};

	/**************************************************************************************************
	* Gibt den aktuellen Filter für die Spalte (key) zurück
	**************************************************************************************************/
	function _getFilterForColumn(slicklist, key){
		return (slicklist && slicklist.columnFilters[key]) ? slicklist.columnFilters[key] : {Value: '', mustMatch: false}
	};

	/**************************************************************************************************
	* Gibt Metadaten für das Item zurück
	**************************************************************************************************/
	function _getMetadata(item){
		if(item){
			item._metadata = item._metadata || {}
		};

		return item._metadata
	};

	/**************************************************************************************************
	* Gibt alle Texte ausgewählter Elemente einer Auswahl (<select/>) zurück
	**************************************************************************************************/
	function _getSelectedTextAsArray(select){
		var tReturn = [];

		if(select){
			tReturn = Array.prototype.slice.call(select.querySelectorAll('option:checked'), 0).map(function(v, i, a){ 
				return v.textContent
			}).filter(function(v){
				return (v !== '') && v
			})
		};

		return tReturn
	};

	/**************************************************************************************************
	* Gibt alle Werte ausgewählter Elemente einer Auswahl (<select/>) zurück
	**************************************************************************************************/
	function _getSelectedValuesAsArray(select){
		var tReturn = [];

		if(select){
			tReturn = Array.prototype.slice.call(select.querySelectorAll('option:checked'), 0).map(function(v, i, a){ 
				return v.value.toLowerCase().trim()
			}).filter(function(v){
				return (v !== '') && v
			})
		};

		return tReturn
	};

	/**************************************************************************************************
	* Findet das Slicklist-Objekt anhand eines unterliegenden HTML-Elements
	**************************************************************************************************/
	function _getSlicklistByChildElement(e){
		var tS = null;

		try{
			if(e){
				var tContainer = function fP(e){return e && e.className.indexOf('Slicklist') !== -1 ? e : fP(e.parentNode)}(e);
				if(tContainer && _Lists && _Lists.length){
					for(var i=0, j=_Lists.length; i<j; i++){
						if(tContainer === _Lists[i].HTMLElement){
							tS = _Lists[i];
							break
						}
					}
				}
			}
		}
		catch(err){_Log('_getSlicklistByChildElement', err)};

		return tS
	};

	/**************************************************************************************************
	* Gibt an, ob für alle obligatorischen Spalten ein Wert angegeben wurde
	**************************************************************************************************/
	function _hasValuesForAllRequiredColumns(item, columns){
		var tUpdate = true;

		for(var i=0, j=columns.length; i<j; i++){
			if(columns[i].required && !item[columns[i].field]){
				tUpdate = false;
				break
			}
		};

		return tUpdate
	};

	function _Log(functionname, err){
		console.log('Slicklist.' + (functionname || '') + ': ', err)
	};

	/**************************************************************************************************
	* Wird bei Fehlern aufgerufen
	**************************************************************************************************/
	function _onError(slicklist, message){
		if(typeof slicklist.onError === 'function'){
			slicklist.onError(slicklist, message)
		}
		else{
			slicklist.HTMLElement.textContent = message
		}
	};

	/**************************************************************************************************
	* Behandelt die Anzeige der Texte ausgewählter Optionen bei Mehrfach-Auswahlen (<select multiple/>)
	**************************************************************************************************/
	function _onChangeHeaderSelect(select, slicklist){
		if(select){
			var tColumn = select.getAttribute('data-column-id');

			//REM: Anzeige der gewählten Filter
			if(select.getAttribute('multiple')){
				var tSpan = select.parentNode.querySelector('span');

				if(!tSpan){
					tSpan = select.parentNode.appendChild(document.createElement('span'));
					tSpan.className = 'slick-select-text';
					tSpan.style.lineHeight = Math.max(tSpan.offsetHeight, 20) + 'px'
				};

				tSpan.textContent = tSpan.title = _getSelectedTextAsArray(select).join(', ');
				select.title = tSpan.title
			};

			//REM: Effektiver Filter
			if(slicklist && tColumn){
				slicklist.columnFilters[tColumn] = {Value: _getSelectedValuesAsArray(select), mustMatch: true};
				slicklist.dataView && slicklist.dataView.refresh()
			}
		}
	};

	/**************************************************************************************************
	* Beim Verändern der Dimensionen
	* Die Slicklist soll stets so gross wie deren Behälter sein - die korrekte Grösse dessen ist
	* nicht Aufgabe der Slicklist!
	**************************************************************************************************/
	function _onResize(slicklist){
		try{
			if(slicklist){
				var tContinue = true;

				if(typeof slicklist.onResize === 'function'){
					tContinue = slicklist.onResize(slicklist)
				};

				if(tContinue){
					var tContainer = slicklist.container,
						tElement = slicklist.HTMLElement;

					tElement.style.height = tElement.style.maxHeight = tContainer.offsetHeight + 'px';
					tElement.style.width = tElement.style.maxWidth = tContainer.offsetWidth + 'px';

					(slicklist.grid) && slicklist.grid.resizeCanvas()
				}
			}
		}
		catch(err){_Log('_onResize', err)}
	};

	/**************************************************************************************************
	* Entfernt eine Zeile im SlickGrid und speichert diese als Änderung in der Slicklist ab
	**************************************************************************************************/
	function _removeRow(slicklist, row){
		try{
			if(slicklist && slicklist.grid){
				var tGrid = slicklist.grid,
					tRows = [row],
					tData = [],
					tContinue = true;

				//REM: Mehrfachauswahl
				var tSelectedRows = slicklist.grid.getSelectedRows();
				if(tSelectedRows && tSelectedRows.length && tSelectedRows.indexOf(row) !== -1){
					tRows = tSelectedRows
				};

				for(var i=0, j=tRows.length; i<j; i++){
					tData.push(tGrid.getDataItem(tRows[i]))
				};
			
				if(typeof slicklist.onRowRemove === 'function'){
					tContinue = slicklist.onRowRemove(tData, tRows)
				};

				if(tContinue){
					if(slicklist.dataView){
						slicklist.dataView.beginUpdate();
						for(var i=0, j=tData.length; i<j; i++){
							tGrid.getData().deleteItem(tData[i].id)
						};
						slicklist.dataView.endUpdate()
					}
					else{
						for(var i=tRows.length-1; i>=0; i--){
							tGrid.getData().splice(~~tRows[i], 1);
						};

						tGrid.setSelectedRows([]);
						//tGrid.invalidate()
					};

					for(var i=0, j=tData.length; i<j; i++){
						tData[i]._isRemoved = 1;
						_addChange(slicklist, {field: '_isRemoved'}, tData[i])
					};

					_revalidate(slicklist);
					_automaticallySaveChanges(slicklist)
				}
			}
		}
		catch(err){_Log('_removeRow', err)}
	};

	function _revalidate(slicklist){
		if(slicklist){
			slicklist._isValid = _validateGrid(slicklist);
			slicklist.grid.invalidate()
		}
	};

	function _stringToFunction(string){
		var tFunction = (typeof string === 'function') ? string : null;

		if(!tFunction){
			try{
				tFunction = string && (typeof eval(string) === 'function') && eval(string)
			}
			catch(err){}
		}

		return tFunction
	};

	/**************************************************************************************************
	* Wird beim onchange() von File-Uploads (<input [file] />) ausgeführt
	**************************************************************************************************/
	function _uploadRow(slicklist, row, field, element){
		try{
			if(slicklist && slicklist.grid){
				var tGrid = slicklist.grid,
					tRows = [row],
					tData = [];

				//REM: Mehrfachauswahl
				var tSelectedRows = slicklist.grid.getSelectedRows();
				if(tSelectedRows && tSelectedRows.length && tSelectedRows.indexOf(row) !== -1){
					tRows = tSelectedRows
				};

				for(var i=0, j=tRows.length; i<j; i++){
					tData.push(tGrid.getDataItem(tRows[i]))
				};

				if(element.files[0]){
					var tReader = new FileReader();

					tReader.onload = function(slicklist, data, field, event){
						var tResult = this.result,
							tContinue = true;

						if(typeof slicklist.onRowUpload === 'function'){
							tResult = slicklist.onRowUpload(data, tResult)
						};

						if(tResult){
							for(var i=0, j=tData.length; i<j; i++){
								tData[i][field] = tResult;
								_addChange(slicklist, {field: field}, tData[i])
							};

							_revalidate(slicklist);
							_automaticallySaveChanges(slicklist)
						}
					}.bind(tReader, slicklist, tData, field);

					tReader.readAsText(element.files[0])
				}
			}
		}
		catch(err){_Log('_uploadRow', err)}
	};

	function _validateGrid(slicklist){
		var tValid = true,
			tColumns = slicklist.grid.getColumns();

		for(var i=0, j=slicklist.grid.getDataLength(); i<j; i++){
			var tItem = slicklist.grid.getDataItem(i);

			if(!_hasValuesForAllRequiredColumns(tItem, tColumns)){
				tValid = false;
				_getMetadata(tItem).cssClasses = 'required'
			}
			else{
				_getMetadata(tItem).cssClasses = ''
			}
		};

		return tValid
	};

	var _That = ns.Slicklist = {
		/**************************************************************************************************
		* Initialisiert das Objekt
		**************************************************************************************************/
		Init: function(){
			_addResizeListener(window);
			(window.top !== window.self) && _addResizeListener(window.top);
			_isInitialised = true
		},

		/**************************************************************************************************
		* Erstellt eine neue Instanz
		**************************************************************************************************/
		Add: function(o){
			var tF = {
				checkboxFormatter: null, //REM: Legt einen eigenen checkboxFormatter fest
				clearContainer: true, //REM: Leert das Behälter-Element beim Erstellen
				columnFilters: {},
				container: document.body, //REM: Das Behälter-Element
				globalPath: null,
				id: '_' + _Lists.length.toString(),
				link: null, //REM: Link für die AJAX-Werte
				postValues: null, //REM: Werte können nun geposted werden, da der QueryString öffentlich, limitiert und fraglich ist
				onCreatingExportFunctions: null, //REM: Ereginis beim Erstellen von Export-Funktionen
				onBeforeEditCell: null, //REM: Ereignis bevor die Zelle in den Bearbeitungsmodus wechselt
				onHasChanges: null, //REM: Ereignis bei bestehenden Änderungen
				onHeaderSelectFocus: null, //REM: Ereignis beim fokusieren eines Spalten-Auswahl-Filters
				onContentLoadingBegin: null, //REM: Ereignis vor dem Beginn des Ladens
				onContentLoadingEnd: null, //REM: Ereignis nach dem Laden der Daten
				onError: null, //REM: Ereignis bei Fehler
				onRendered: null, //REM: Ereignis nach dem Rendern
				onResize: null, //REM: Ereignis beim Ändern der Dimensionen
				onRowAperture: null, //REM: Ereignis beim Klick auf eine Aperture-Zelle
				onRowDocument: null, //REM: Ereignis beim Klick auf eine Dokumenten-Zelle
				onRowDownload: null,  //REM: Ereignis beim Herunterladen von Datein
				onRowEdit: null, //REM: Ereignis beim Klick auf eine Bearbeitungs-Zelle
				onRowRemove: null, //REM: Ereignis beim Entfernen einer Zeile
				onRowSVGLink: null, //REM: Ereignis beim Klick auf eine SVG-Zelle
				onRowUpload: null,  //REM: Ereignis beim Ändern von Fileuploads
				onSelectEditor: null, //REM: Ereignis beim Erstellen eines Auswahl-Feldes
				onTextEditor: null //REM: Ereignis beim Erstellen eines Text-Feldes
			};

			try{
				!_isInitialised && this.Init();

				//REM: Vereint die Optionen
				for(var tK in o){
					if(tF.hasOwnProperty(tK)){
						tF[tK] = o[tK]
					}
				};

				//REM: Fügt das Objekt der Liste an
				_Lists.push(tF);

				//REM: Erstellt den HTML-Behälter für das Slickgrid
				tF.container && _createContainer(tF);

				//REM: Holt die Daten von der Datenbank
				tF.link && _getAndFillContentData(tF)

			}
			catch(err){_Log('_onResize', err)};

			return tF
		},
		
		addChange: function(slicklist, column, item){
			_addChange(slicklist, column, item)
		},

		/**************************************************************************************************
		* Gibt den aktuellen AJAX-Handler zurück (wäre im Portal Portal.AJAX)
		**************************************************************************************************/
		AJAX: function(){
			return (typeof Basic !== 'undefined') ? Basic.AJAX : null
		},

		/**************************************************************************************************
		* Behandelt das Forgehen, bzw. die Weitergabe von Formatter.Edit-Handlugnen
		**************************************************************************************************/
		Edit: function(element, row, type){
			var tFunction = null,
				tSlicklist = _getSlicklistByChildElement(element);

			if(tSlicklist){
				switch((type || '').toLowerCase()){
					case 'aperture':
						tFunction = tSlicklist.onRowAperture;
						break;
					case 'document':
						tFunction = tSlicklist.onRowDocument;
						break;
					case 'download':
						tFunction = tSlicklist.onRowDownload;
						break;
					case 'svglink':
						tFunction = tSlicklist.onRowSVGLink;
						break;
					default:
						tFunction = tSlicklist.onRowEdit
				};

				(typeof tFunction === 'function') && tFunction(
					tSlicklist.grid.getDataItem(row),
					tSlicklist.data.options[0].Parameters,
					tSlicklist
				)
			}

			return false
		},

		/**************************************************************************************************
		* Sucht das Slicklist-Objekt anhand eines HTML-Elements und gibt dieses zurück
		**************************************************************************************************/
		getSlicklistByChildElement: function(element){
			return _getSlicklistByChildElement(element)
		},

		/**************************************************************************************************
		* Gibt die Datenänderungen einer Slicklist oder von Slicklist.listOfChanges als XML zurück
		**************************************************************************************************/
		getChangesAsXML: function(changes){
			var tXML = [],
				tChanges = changes.listOfChanges ? changes.listOfChanges : changes;

			if(tChanges && tChanges.length){
				for(var i=0, j=tChanges.length; i<j; i++){
					var tAttributes = '';

					for(var tKey in tChanges[i]){
						var tValue = ((tChanges[i][tKey] === null || tChanges[i][tKey] === undefined) ? '' : tChanges[i][tKey]).toString()
							.replace('&', '&amp;')
							.replace('"', '&quot;')
							.replace('<', '&lt;')
							.replace('>', '&gt;');

						tAttributes += ' @Key.="@Value."'
							.replace('@Key.', tKey)
							.replace('@Value.', encodeURIComponent(tValue))
					};

					tXML.push('<row ' + tAttributes.trim() + ' />')
				}
			};

			return tXML.join('')
		},

		onResize: function(ms){
			this.resizeTimer && clearTimeout(this.resizeTimer);

			this.resizeTimer = setTimeout(function(l){
				for(var i=0, j=l.length; i<j; i++) _onResize(l[i])
			}.bind(undefined, _Lists), (ms || 1000))
		},

		Reload: function(slicklist, link){
			if(slicklist){
				var tO = null,
					tLink = link || slicklist.link;

				if(_.QueryString.Read('SL_UID', tLink) === _.QueryString.Read('SL_UID', slicklist.link)){
					if(slicklist.grid){
						tO = {scrollTop: ~~slicklist.grid.getCanvasNode().parentNode.scrollTop}
					}
				};

				slicklist.link = tLink;
				if(slicklist.link && slicklist.HTMLElement){
					if(!slicklist.HTMLElement.parentNode && slicklist.container){
						slicklist.container.appendChild(slicklist.HTMLElement)
					};

					_getAndFillContentData(slicklist, tO)
				}
			}
		},
		
		/**************************************************************************************************
		* Lädt die Daten der Slicklist neu
		**************************************************************************************************/
		Refresh: function(slicklist){
			if(slicklist && slicklist.grid){
				slicklist.grid.invalidate()
			}
		},

		/**************************************************************************************************
		* Entfernt die Slicklist aus dem DOM und der Sammlung
		**************************************************************************************************/
		Remove: function(slicklist){
			if(slicklist){
				for(var i=_Lists.length-1; i>=0; i--){
					if(_Lists[i] === slicklist){
						//REM: Behälter im DOM entfernen
						if(slicklist.HTMLElement && slicklist.HTMLElement.parentNode){
							slicklist.HTMLElement.parentNode.removeChild(slicklist.HTMLElement)
						};

						//REM: Slicklist entfernen
						_Lists.splice(i, 1);

						//REM: Leider können die Referenzen dazu nicht gelöscht werden. Daher wird ein Flag (=Removed) gesetzt..
						slicklist.Removed = true;
						slicklist = null
					}
				}
			}
		},

		removeRow: function(element, row){
			var tSlicklist = this.getSlicklistByChildElement(element);
			if(tSlicklist){
				return _removeRow(tSlicklist, row)
			}
		},

		uploadRow: function(element, row, field){
			var tSlicklist = this.getSlicklistByChildElement(element);
			if(tSlicklist){
				return _uploadRow(tSlicklist, row, field, element)
			}
		}
	};

	//REM: Erstellen von Slicklisten auf Grund von Attributen (data-sl-uid)
	document.addEventListener && document.addEventListener('DOMContentLoaded', function(event){
		for(var tL=document.querySelectorAll('[data-sl-uid][data-sl-link]'), i=0, j=tL.length; i<j; i++){
			var tLink = tL[i].getAttribute('data-sl-link')
				.replace(/@SL_UID./g, tL[i].getAttribute('data-sl-uid'));

			//REM: Link-Werte ersetzen
			var tQueryString = _.QueryString.readAll();
			for(var tKey in tQueryString){
				tLink = tLink.replace('@' + tKey + '.', tQueryString[tKey])
			};

			if(tLink.indexOf('Cache=') === -1){
				tLink += '&Cache=' + +new Date
			};

			var tOptions = {
				container: tL[i],
				globalPath: mGlobalRootPath,
				link: tLink,

				onContentLoadingBegin: function(slicklist){Basic.Waiting.Start(slicklist.container)},
				onContentLoadingEnd: function(slicklist){Basic.Waiting.Stop(slicklist.container)}
			};

			//REM: Optionale Funktion vor dem Laden
			var tFunktion = tL[i].getAttribute('data-sl-onbeforeload');
			if(tFunktion && typeof window[tFunktion] === 'function'){
				tOptions = window[tFunktion](tOptions)
			};

			_.Slicklist.Add(tOptions)
		}
	})
}(window._ = window._ || {}));