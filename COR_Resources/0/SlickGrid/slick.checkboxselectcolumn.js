//R.L. (31.08.2016): refreshOnSelect
//R.L. (01.04.2016): formatter: _options.Formatter || checkboxSelectionFormatter

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "CheckboxSelectColumn": CheckboxSelectColumn
    }
  });


  function CheckboxSelectColumn(options) {
    var _grid;
    var _self = this;
    var _handler = new Slick.EventHandler();
    var _selectedRowsLookup = {};
    var _defaults = {
      columnId: "_checkbox_selector",
      cssClass: null,
      toolTip: "Select/Deselect All",
      width: 30,
      refreshOnSelect: true
    };

    var _options = $.extend(true, {}, _defaults, options);

    function init(grid) {
      _grid = grid;
      _handler
        .subscribe(_grid.onSelectedRowsChanged, handleSelectedRowsChanged)
        .subscribe(_grid.onClick, handleClick)
        .subscribe(_grid.onHeaderClick, handleHeaderClick)
        .subscribe(_grid.onKeyDown, handleKeyDown);
    }

    function destroy() {
      _handler.unsubscribeAll();
    }

    function handleSelectedRowsChanged(e, args){
        var tSelectedRows = args.grid.getSelectedRows(),
			tLookup = {},
			row,
			i;

        for (i = 0; i < tSelectedRows.length; i++){
            row = tSelectedRows[i];
            tLookup[row] = true;
            if (tLookup[row] !== _selectedRowsLookup[row]) delete _selectedRowsLookup[row]
        }

        _selectedRowsLookup = tLookup;

		args.grid.invalidate();
        args.grid.render();

        var length = tSelectedRows.length;
		var dataLength = args.grid.getDataLength();

        if (length == dataLength){
            args.grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked'>", _options.toolTip);
        }
        else{
            args.grid.updateColumnHeader(_options.columnId, "<input type='checkbox'>", _options.toolTip);
        }
    }

    function handleKeyDown(e, args) {
      if (e.which == 32) {
        if (_grid.getColumns()[args.cell].id === _options.columnId) {
          // if editing, try to commit
          if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
            toggleRowSelection(args.row);
          }
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    }

    function handleClick(e, args) {
      // clicking on a row select checkbox
      if (_grid.getColumns()[args.cell].id === _options.columnId && $(e.target).is(":checkbox")) {
        // if editing, try to commit
        if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        toggleRowSelection(args.row);
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }

    function toggleRowSelection(row) {
      if (_selectedRowsLookup[row]) {
        _grid.setSelectedRows($.grep(_grid.getSelectedRows(), function (n) {
          return n != row
        }));
      } else {
        _grid.setSelectedRows(_grid.getSelectedRows().concat(row));
      }
    }

    function handleHeaderClick(e, args) {
      if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {
        // if editing, try to commit
        if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }

        var tF = null;
        try{
            var tL = Basic.Slicklist._getList(e.target).sl_list;
            tF = tL.onHeaderClick
        }
        catch(err){}

        var rows = [];
        if ($(e.target).is(":checked")) {
          for (var i = 0; i < _grid.getDataLength(); i++) {
            var column = _grid.getDataItem(i);
              rows.push(i);
          }
          _grid.setSelectedRows(rows);
        } else {
          _grid.setSelectedRows([]);
        }

        tF && tF(rows)

        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }

    function getColumnDefinition() {
      return {
        id: _options.columnId,
        name: "<input type='checkbox'>",
        toolTip: _options.toolTip,
        field: "sel",
        width: _options.width,
        resizable: false,
        sortable: false,
        cssClass: _options.cssClass,
        formatter: _options.Formatter || checkboxSelectionFormatter
      };
    }

    function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext){
        if (dataContext){
            if(dataContext['TotalsRow'] === true) return null

            if (_options.refreshOnSelect){
                return _selectedRowsLookup[row]
                    ? "<input type='checkbox' checked='checked'>"
                    : "<input type='checkbox'>"
            }
            else{
                return (_selectedRowsLookup[row]
                    ? "<input type='checkbox' checked='checked' data-row = '@r.'>"
                    : "<input type='checkbox' data-row = '@r.'>").replace(/@r./g, row.toString())
            }
        }

        return null
    }

    $.extend(this, {
      "init": init,
      "destroy": destroy,
      "getColumnDefinition": getColumnDefinition
    });
  }
})(jQuery);