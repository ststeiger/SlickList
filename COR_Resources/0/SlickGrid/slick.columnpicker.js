//https://raw.githubusercontent.com/mleibman/SlickGrid/master/controls/slick.columnpicker.js
;(function ($) {
	$.extend(true, window, {Slick: {Controls: {ColumnPicker: SlickColumnPicker}}})

	function SlickColumnPicker(columns, grid, options){
		var $menu,
			columnCheckboxes,
			checkboxselectorID = '_checkbox_selector',
			onColumnVisibilityChanged = new Slick.Event(),
			defaults = {
				fadeSpeed: 250
			};

		function init(){
			grid.onHeaderContextMenu.subscribe(handleHeaderContextMenu);
			grid.onColumnsReordered.subscribe(updateColumnOrder);
			options = $.extend({}, defaults, options);

			//REM: Jedes Slickgrid kann ein eigenes Kontextmen� haben
			var tContainer = document.body;
			if(grid.getCanvasNode()){
				tContainer = grid.getCanvasNode().parentNode.parentNode
			};

			$menu = $("<span class='slick-columnpicker' style='display:none;position:absolute;z-index:20;' />").appendTo(tContainer);

			$menu.bind("mouseleave", function(e){
				$(this).fadeOut(options.fadeSpeed)
			});

			$menu.bind("click", updateColumn)
		};

		function destroy(){
			grid.onHeaderContextMenu.unsubscribe(handleHeaderContextMenu);
			grid.onColumnsReordered.unsubscribe(updateColumnOrder);
			$menu.remove()
		};

		function handleHeaderContextMenu(e, args){
			e.preventDefault();
			$menu.empty();
			updateColumnOrder();
			columnCheckboxes = [];

			var $li, $input;
			for (var i=0; i<columns.length; i++){
				if(columns[i].id !== checkboxselectorID){
					$li = $("<li />").appendTo($menu);
					$input = $("<input type='checkbox' />").data("column-id", columns[i].id);

					if(grid.getColumnIndex(columns[i].id) !== undefined){
						$input.attr("checked", "checked")
					};

					$("<label />")
						.text(columns[i].name)
						.prepend($input)
						.appendTo($li);

					columnCheckboxes.push($input)
				}
			};

			//REM: Um das Men� im IPad wieder schliessen zu k�nnen
			var tMenu = $menu.get(0);
			var tClose = tMenu.appendChild(document.createElement('b'));
			tClose.textContent = 'X';
			tClose.className = 'slick-columnpicker-close';
			tClose.onclick = function(){
				$(this).fadeOut(options.fadeSpeed)
			}.bind(tMenu);

			//REM: H�he soll gleich wie die Spaltenh�he sein
			if(args.grid.getTopPanel()){
				args.py = grid.getTopPanel().offsetHeight + 10
			};

			//REM: Maximale H�he soll die H�he der Liste nicht �berschreiten
			if(args.grid.getCanvasNode()){
				$menu.css("max-height", args.grid.getCanvasNode().offsetHeight)
			};

			$menu
				.css("top", (args.py || e.pageY) - 10)
				.css("left", (args.px || e.pageX) - 10)
				.fadeIn(options.fadeSpeed)
		};

		//REM: Korrigiert (m�ssen nicht zwinged alle columns in grid.getColumns() vorkommen)
		function updateColumnOrder(){
			// Because columns can be reordered, we have to update the `columns`
			// to reflect the new order, however we can't just take `grid.getColumns()`,
			// as it does not include columns currently hidden by the picker.
			// We create a new `columns` structure by leaving currently-hidden
			// columns in their original ordinal position and interleaving the results
			// of the current column sort.
			var tCurrent = grid.getColumns(),
				tOrdered = [tCurrent.length];

			//REM: Vorhandene hinzuf�gen
			for(var i=0, j=tCurrent.length; i<j; i++){
				tOrdered[grid.getColumnIndex(tCurrent[i].id)] = tCurrent[i]
			};

			//REM: Fehlende anf�gen
			for(var i=columns.length-1; i>=0; i--){
				if(grid.getColumnIndex(columns[i].id) === undefined){
					tOrdered.push(columns[i])
				}
			};

			columns = tOrdered
		};

		//REM: Korrigiert (geht nicht mehr �ber den index sondern die column-id)
		function updateColumn(e){
			if($(e.target).data("option") == "autoresize"){
				if(e.target.checked){
					grid.setOptions({forceFitColumns:true});
					grid.autosizeColumns()
				}
				else{
					grid.setOptions({forceFitColumns:false})
				};

				return
			};

			if($(e.target).data("option") == "syncresize"){
				if(e.target.checked) {
					grid.setOptions({syncColumnCellResize:true})
				}
				else{
					grid.setOptions({syncColumnCellResize:false})
				};

				return
			};

			if($(e.target).is(":checkbox")){
				var visibleColumns = [],
					invisibleColumns = [];

				var tColumn = getColumnById(checkboxselectorID);
				tColumn && visibleColumns.push(tColumn)

				$.each(columnCheckboxes, function (i, e){
					var tColumn = getColumnById($(this).data("column-id"));

					if($(this).is(":checked")){
						tColumn && visibleColumns.push(tColumn)
					}
					else{
						tColumn && invisibleColumns.push(tColumn)
					}
				});

				if(!visibleColumns.length){
					$(e.target).attr("checked", "checked");
					return
				};

				grid.setColumns(visibleColumns);
				onColumnVisibilityChanged.notify({visibleColumns: visibleColumns, invisibleColumns: invisibleColumns}, null, self)
			}
		};

		//REM: F�r eine korrekte updateColumn()
		function getColumnById(id){
			var tColumn = null;

			if(id && columns && columns.length){
				for(var i=0, j=columns.length; i<j; i++){
					if(columns[i].id === id){
						tColumn = columns[i];
						break
					}
				}
			};

			return tColumn
		};

		function getAllColumns(){
			return columns;
		};

		$.extend(this, {
		  "onColumnVisibilityChanged": onColumnVisibilityChanged
		});

		init()
	}
})(jQuery);