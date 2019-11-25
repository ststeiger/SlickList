//todo: y
//_.Slicklist.Formatter
; (function (ns)
{
    'use strict';

    //REM: Eigentlich eher eine ES6 Prüfung
    function _supportsAsync()
    {
        var tReturn = true;

        try
        {
            eval('async () => {}');
        }
        catch (e)
        {
            tReturn = false;
        };

        return tReturn;
    }

    ns.Slicklist = ns.Slicklist || {};
    var _That = ns.Slicklist.Export = {
        Formatter: {
            Any: function (r, c, v, cd, dc, opt)
            {
                var tV = v || '';

                return tV
            },

			/**************************************************************************************************
			* Gibt den Wert als Boolean zurück
			**************************************************************************************************/
            Boolean: function (r, c, v, cd, dc, opt)
            {
                cd['ExportCssSelectors'] = { true: '._resCBChecked', false: '._resCBUnchecked' };

                if (v === true || v === 1) return true;
                return false;
            },

            Flag: function (r, c, v, cd, dc, opt)
            {
                cd['ExportCssSelectors'] = { true: '._resFlag' };

                if (v === true || v === 1) return true;
                return false;
            },

            Flagged: function (r, c, v, cd, dc, opt) { return _.Slicklist.Export.Formatter.Flag(r, c, v, cd, dc, opt); },

			/**************************************************************************************************
			* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (m) zurück
			**************************************************************************************************/
            Meters: function (r, c, v, cd, dc, opt)
            {
                return parseFloat((v || 0.00).toFixed(2));
            },

			/**************************************************************************************************
			* Gibt einfach den Wert - so wie er ist - zurück
			**************************************************************************************************/
            Plain: function (r, c, v, cd, dc, opt)
            {
                return v;
            },

			/**************************************************************************************************
			* Gibt einen Float auf Zwei-Nachkommastellen abgeschnitten mit dem Affix (m2) zurück
			**************************************************************************************************/
            Squaremeters: function (r, c, v, cd, dc, opt)
            {
                return parseFloat((v || 0.00).toFixed(2));
            },

            SVG: function (r, c, v, cd, dc, opt)
            { //REPLACE: async function(r, c, v, cd, dc, opt){
                try
                {
                    if (opt['Type'] === 'CSV') return undefined;
                    return undefined; //REPLACE: cd['ExportSVG'] = true; return await _.Slicklist.Export.svgToPng(v);
                }
                catch (err)
                {
                    return undefined;
                }
            }

        },

        CssBackgrounds: null,

        Classnames: {
            Logo_COR: '._resLogo_COR',
            //Boolean_True: '._resCBChecked',
            //Boolean_False: '._resCBUnchecked'
        },

        timeOut: 200,


        Title: 'Export',
        Label: function () { return (_That.Title + ' ' + _That.getDateString().replace(/:/g, '')); },
        getUserName: function ()
        {
            var e = $("[id$='laUsername']");
            if (e.length === 1) return e.html();
            return '';
        },
        getDateString: function ()
        {
            var d = new Date();
            return ($.datepicker.formatDate('dd.mm.yy', d) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2));
        },


        getAllCssBackgroundImages: function (options)
        {
            var tOptions = options || {};
            var tSelectors = [];
            var tStyleSheets = document.styleSheets;
            for (var i = 0; i < tStyleSheets.length; i++)
            {
                for (var tRules = document.styleSheets[i].cssRules, j = 0; j < tRules.length; j++)
                {
                    var tBackground = tRules[j].style && (tRules[j].style.backgroundImage || tRules[j].style.background);

                    var tHeight = parseInt((tRules[j].style ? tRules[j].style['height'] : '')); if (isNaN(tHeight)) tHeight = 25;
                    var tWidth = parseInt((tRules[j].style ? tRules[j].style['width'] : '')); if (isNaN(tWidth)) tWidth = 25;
                    var tURL = (/url\(['"]?([^")]+)/.exec(tBackground) || [])[1];

                    if (
                        tURL &&
                        (tOptions.base64Only ? tURL.indexOf('base64,') !== -1 : 1) &&
                        (tOptions.usedOnly ? document.querySelector(tRules[j].selectorText) : 1)
                    )
                    {

                        tSelectors.push({
                            'Selector': tRules[j].selectorText,
                            'URL': tURL,
                            'height': tHeight,
                            'width': tWidth
                        });
                    }
                }
            }

            return tSelectors;
        },

        Init: function (slickgrid, event)
        {
            if (typeof slickgrid.data.options[0].title != 'undefined') _That.Title = slickgrid.data.options[0].title
            if (_That.CssBackgrounds === null) _That.CssBackgrounds = _That.getAllCssBackgroundImages({ base64Only: true, usedOnly: false });

            var srcElement = event.srcElement;
            if (typeof srcElement === 'object' && (srcElement.innerHTML === 'PDF' || srcElement.innerHTML === 'CSV' || srcElement.innerHTML === 'XLSX') &&
                typeof slickgrid === 'object' && typeof slickgrid.dataView === 'object' && typeof slickgrid.dataView.getLength === 'function')
            {

                if (srcElement.innerHTML == 'PDF')
                    _That.PDF._toPDF(slickgrid);
                else
                {
                    if (srcElement.innerHTML == 'CSV')
                        setTimeout(function () { _That.Excel._toCSV(slickgrid) }, _That.timeOut);
                    else if (srcElement.innerHTML == 'XLSX')
                        setTimeout(function () { _That.Excel._toXLSX(slickgrid); }, _That.timeOut);
                }
            }
        },

        PDF: {

            maxPDFRows: 500, // IE
            maxPDFRows_Edge: 2000,
            maxPDFRows_Firefox: 2000,
            maxPDFRows_Chrome: 2500,

            _images: {},

            _toPDF: function (slickgrid)
            {

                // please note, 
                // that IE11 now returns undefined again for window.chrome
                // and new Opera 30 outputs true for window.chrome
                // but needs to check if window.opr is not undefined
                // and new IE Edge outputs to true now for window.chrome
                // and if not iOS Chrome check
                // so use the below updated condition
                var isChromium = window.chrome;
                var winNav = window.navigator;
                var vendorName = winNav.vendor;
                var isOpera = typeof window.opr !== "undefined";
                var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
                var isIOSChrome = winNav.userAgent.match("CriOS");


                var isChrome = isIOSChrome || (isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false && isIEedge === false);
                var isFirefox = typeof InstallTrigger !== 'undefined';
                var isEdge = typeof window.navigator.userAgent.indexOf("Edge") > -1;

                if (isFirefox) _That.PDF.maxPDFRows = _That.PDF.maxPDFRows_Firefox;
                if (isChrome) _That.PDF.maxPDFRows = _That.PDF.maxPDFRows_Chrome;
                if (isEdge) _That.PDF.maxPDFRows = _That.PDF.maxPDFRows_Edge;

                _That.PDF._images = {};
                _That.Data._ListToJob({ 'Slickgrid': slickgrid, 'Type': 'PDF', 'CallBack': function (param) { _That.PDF.toPDF(param); } });
            },

            toPDF: function (param)
            {
                var Job = { 'Slickgrid': param['Slickgrid'], 'Data': param['Data'], 'Columns': param['Columns'], 'Align': param['Align'], 'Type': param['Type'] };

                Job['Parameters'] = { 'File_Name': _That.Label(), 'File_Index': 0, 'File_Count': Math.ceil(Job.Data.length / _That.PDF.maxPDFRows) };

                if (Job.Data.length > _That.PDF.maxPDFRows)
                {
                    return _ && _.Dialogue.Init({
                        Header: 'Hinweis - Export wird auf mehrere Dateien aufgeteilt',
                        Body: 'Da die Liste mehr als ' + _That.PDF.maxPDFRows + ' Einträge enthält wird der Export auf ' + Job['Parameters']['File_Count'] + ' Dateien aufgeteilt. <br/>Wollen sie fortfahren?<br/><br/><i>Der Browser wird währen der Generierung eingefrohren.<br/>Dies kann, je nach Browser und Datenmenge, von einigen Sekunden bis zu mehreren Minuten dauern!<br/>Schlechte Peformance mit Internet Explorer.</i>',
                        Parent: document.body,
                        Functions: [
                            { Name: 'Abbrechen', className: 'Gray' },
                            { Name: 'Ok', Styles: { float: 'right' }, onclick: function (o) { Basic.Waiting.Start(); setTimeout(function () { _That.PDF.generatePDF(Job); }, _That.timeOut); _ && _.Dialogue.removeAll(); } } 
                        ]
                    });
                }
                else
                {
                    Basic.Waiting.Start();
                    setTimeout(function () { _That.PDF.generatePDF(Job) }, _That.timeOut);
                }
            },

            generatePDF: function (Job)
            {
                var PDF_Definition = _That.PDF.Definition();

                //start - set column width
                var widths = [], _tTotalWidth = 0, _MaxWidth = 0;
                for (var i = 0; i < Job.Columns.length; i++)
                {
                    var tWidth = ~~Job.Columns[i]['width'];
                    if (tWidth === undefined) tWidth = ~~Job.Columns[i]['minWidth'];

                    widths.push(tWidth);
                    _tTotalWidth += ~~tWidth;
                }

                var _widths = widths.slice();
                _widths.sort(function (a, b) { return b - a; });

                //set half of columns dynamic (pdfmake braucht mindestens eine mit *, sonst sind die Tabellen nicht genau 100% lang... mit der hälfte sieht es "natürlicher")
                var maxDynamicColumns = Math.floor(Job.Columns.length / 2);
                for (var i = 0; i < _widths.length; i++)
                {
                    if (maxDynamicColumns === 0) break;
                    for (var x = widths.length - 1; x >= 0; x--)
                    {
                        if (maxDynamicColumns === 0) break;
                        if (_widths[i] === widths[x])
                        {
                            widths[x] = '*';
                            maxDynamicColumns -= 1;
                        }
                    }
                }

                //min + max width for pdf
                if (_tTotalWidth < 1024) _tTotalWidth = 1024;
                if (_tTotalWidth > 1920) _tTotalWidth = 1920;

                var fontSize_Content = 8;
                if (Job.Columns.length > 9) _tTotalWidth = 1920;
                if (Job.Columns.length > 12) fontSize_Content = 7;

                //set width in percent 
                for (var i = 0; i < _widths.length; i++)
                {
                    if (widths[i] === '*')
                        continue;

                    var test = 100 / _tTotalWidth * widths[i];
                    widths[i] = test + '%';
                }

                if (_tTotalWidth > 1024 || Job.Columns.length > 3)
                {
                    //REM: Benutzerdefiniertes Papierformar anhand der Breite (Höhe entspricht 2/3 der Breite)
                    //https://pdfmake.github.io/docs/document-definition-object/page/
                    PDF_Definition.pageSize = { width: _tTotalWidth, height: _tTotalWidth / 3 * 2 };
                }

                //split list
                var tData = Job.Data;
                var tStart_Index = Job['Parameters']['File_Index'] * _That.PDF.maxPDFRows;
                var tEnd_Index = tStart_Index + Math.min((Job.Data.length - tStart_Index), _That.PDF.maxPDFRows);
                tData = tData.slice(tStart_Index, tEnd_Index);
                //header row on multiple files
                if (tStart_Index > 0) tData.unshift(Job.Data[0]);

                var table = {
                    //"fit": [1022,500],
                    "headerRows": 1,
                    "body": tData,
                    "widths": widths,
                };

                var content = [{
                    //"fit": [1022,500],
                    "headerRows": 1,
                    "fontSize": fontSize_Content,
                    "table": table,
                    //"margin": [0, 0, 2, 0],
                }];


                PDF_Definition['content'] = content;
                PDF_Definition['images'] = _That.PDF._images;

                try
                {
                    var suffix = '';
                    if (Job['Parameters']['File_Count'] > 1)
                        suffix = ' [' + (Job['Parameters']['File_Index'] + 1 + ']');

                    pdfMake.createPdf(PDF_Definition).download(Job['Parameters']['File_Name'] + suffix + '.pdf', function ()
                    {

                        Job['Parameters']['File_Index'] += 1;
                        if (Job['Parameters']['File_Index'] === Job['Parameters']['File_Count'])
                        {
                            _That.PDF._images = {};
                            Basic.Waiting.Stop();
                        }
                        else
                        {
                            _That.PDF.generatePDF(Job);
                        }
                    });

                } catch (e)
                {
                    console.log(e);
                }
            },

            Header: function ()
            {
                var _logoClass = _That.Classnames.Logo_COR;
                var _style = _That.PDF.addImageToDict(_logoClass);

                if (_style)
                {
                    var _column = {};
                    var _height = _style['height']; _column['height'] = _height;
                    var _width = _style['width']; _column['width'] = _width;



                    var _margin = [40, (40 - _height)];

                    _column['image'] = _logoClass; //image name 

                    return {
                        margin: _margin,
                        columns: [
                            {
                                margin: [0, 9, 0, 0],
                                text: _That.Title,
                                alignment: 'left',
                                fontSize: 16,
                                bold: true
                            },
                            {},
                            _column
                        ]
                    };
                }

                return {};
            },
            Footer: function (currentPage, pageCount)
            {
                return {
                    margin: [40, 10],
                    columns: [
                        {
                            //margin: [15, 4, 0, 0],
                            text: _That.getUserName(),
                            alignment: 'left',
                            fontSize: 9
                        },
                        {
                            text: currentPage.toString() + ' / ' + pageCount,
                            alignment: 'center',
                            fontSize: 9
                        },
                        {
                            margin: [0, 0, 2, 0],
                            text: _That.getDateString(),
                            alignment: 'right',
                            fontSize: 9 
                        }
                    ]
                };
            },
            Styles: {
                "header": {
                    "fontSize": 9,
                    "bold": true,
                    'fillColor': '#5b9bd5'
                },
                "group": {
                    "fontSize": 9,
                    "bold": true,
                    'fillColor': '#fabf8f'
                },
                "footer": {
                    "fontSize": 9,
                    "bold": true,
                    'fillColor': '#5b9bd5'
                }
            },

            Definition: function ()
            {
                return {
                    "pageOrientation": 'landscape',
                    "pageSize": 'A4',
                    "pageMargins": [40, 50, 40, 40],
                    "header": _That.PDF.Header,
                    "footer": _That.PDF.Footer,
                    "content": '',
                    "styles": _That.PDF.Styles
                };
            },

            addImageToDict: function (Selector)
            {
                if (_That.PDF._images[Selector] === undefined && typeof _That.CssBackgrounds === 'object')
                {
                    var _style = undefined;
                    for (var i = 0; i < _That.CssBackgrounds.length; i++)
                    {
                        if (_That.CssBackgrounds[i]['Selector'] === Selector)
                        {
                            _style = _That.CssBackgrounds[i];
                            break;
                        }
                    }

                    if (_style != undefined && typeof _style['URL'] === 'string' && _style['URL'].indexOf(';base64') > 0)
                    {
                        _That.PDF._images[Selector] = _style['URL']; //add image to dictionary    
                    }

                    return _style;
                }

                return undefined;
            } 
        },

        Excel: {
            Sheet_MaxWidth: 1100,

            _toCSV: function (slickgrid)
            {
                _That.Data._ListToJob({ 'Slickgrid': slickgrid, 'Type': 'CSV', 'CallBack': function (param) { _That.Excel.toCSV(param); } });
            },

            toCSV: function (param)
            {
                var Job = { 'Slickgrid': param['Slickgrid'], 'Data': param['Data'], 'Columns': param['Columns'], 'Align': param['Align'], 'Type': param['Type'] };

                var ws = _That.Excel.getSheetForXLSX(Job);
                var csv = XLSX.utils.sheet_to_csv(ws, { 'FS': ';' });
                csv = "\ufeff" + csv;  // utf8

                //download
                saveAs(new Blob([csv], { type: "text/csv" }), _That.Label() + '.csv');
            },

            _toXLSX: function (slickgrid)
            {
                _That.Data._ListToJob({ 'Slickgrid': slickgrid, 'Type': 'XLSX', 'CallBack': function (param) { _That.Excel.toXLSX(param); } });
            },

            toXLSX: function (param)
            {
                var Job = { 'Slickgrid': param['Slickgrid'], 'Data': param['Data'], 'Columns': param['Columns'], 'Align': param['Align'], 'Type': param['Type'], 'Merges': param['Merges'] };
                var wb = new _That.Excel.Workbook(), ws = _That.Excel.getSheetForXLSX(Job);

                //add worksheet to workbook
                wb.SheetNames.push('Sheet1');
                wb.Sheets['Sheet1'] = ws;

                //create file 
                var data = XLSX.write(wb, {
                    bookType: "xlsx",
                    bookSST: false,
                    type: "binary"
                });

                //download
                saveAs(new Blob([_That.Excel.s2ab(data)], { type: "application/octet-stream" }), _That.Label() + '.xlsx');
            },


            s2ab: function (s)
            {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            },
            Workbook: function ()
            {
                if (!(this instanceof _That.Excel.Workbook)) return new _That.Excel.Workbook();
                this.SheetNames = [];
                this.Sheets = {};
            },
            datenum: function (v, date1904)
            {
                if (date1904) v += 1462;
                var epoch = Date.parse(v);
                var offset = v.getTimezoneOffset() * 60 * 1000;
                return (epoch - offset - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
            },

            getSheetForXLSX: function (Job)
            {
                var ws = {};

                var range = { s: { c: 0, r: 0 }, e: { c: Job.Columns.length - 1, r: Job.Data.length - 1 } };
                ws['!ref'] = XLSX.utils.encode_range(range);

                ws['!autofilter'] = { ref: ws['!ref'] };
                ws['!cols'] = _That.Excel.getSheetColumnWidth(Job);
                ws['!rows'] = _That.Excel.getSheetRowHeight(Job);
                ws["!images"] = [];
                ws["!merges"] = Job['Merges'];


                var columnFormatter = _That.Excel.getColumnFormatter(Job);
                //var range = { s: { c: 0, r: 0 }, e: { c: Job.Columns.length - 1, r: Job.Data.length - 1 } };

                $.each(Job.Data, function (rowIndex, row)
                {
                    $.each(Job.Columns, function (colIndex, col)
                    {
                        // START - cell value / type / format / add image
                        var value = row[colIndex]; var format = undefined; var type = 's';
                        //value
                        if (typeof value == 'undefined') value = '';
                        //format
                        if (columnFormatter.length > 0 && columnFormatter[colIndex] != undefined) format = columnFormatter[colIndex];

                        if (typeof value === "number")
                        {
                            type = "n";
                            if (format === undefined) format = '#,##0';
                        }
                        else if (typeof value === "boolean") type = "b";
                        else if (value instanceof Date)
                        {
                            type = "n";
                            format = 'd.m.yy';
                            value = _That.Excel.datenum(value);
                        }
                        else if (typeof value === 'object')
                        {
                            if (value['Image'] === true)
                            {
                                //-----------------------------------------------
                                //replace not allowed characters in excel
                                //          "“‘/|?:*<>#&+%,{}[]~ "       
                                //-----------------------------------------------
                                var tMime = (typeof value['MIME'] != 'undefined' ? value['MIME'] : 'jpeg');
                                var fName = value['Name'].replace(/[“‘/|?:*<>#&+%,{}\[\]~ ]/g, '');

                                var vData = value['Data'];
                                if (vData.indexOf('base64,') > -1) vData = vData.substr(vData.indexOf('base64,') + 7)

                                var tImage = {
                                    name: fName,
                                    data: vData,
                                    opts: { base64: true, binary: true },
                                    type: tMime,
                                    position: {
                                        type: 'oneCellAnchor',
                                        attrs: { editAs: 'oneCell' },
                                        from: { col: colIndex, row: rowIndex },
                                        to: { col: colIndex + 1, row: rowIndex + 1 },
                                        size: { width: value['Width'], height: value['Height'] },
                                        parent: { col: ws['!cols'][colIndex], row: ws['!rows'][rowIndex] }
                                    }
                                };

                                ws["!images"].push(tImage);

                                value = '';
                            }

                        }
                        // END - set value / type / format / add image

                        // START - set cell
                        var cell_ref = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex });
                        var excelCell = {
                            z: format,
                            v: value,
                            t: type,
                            s: {
                                alignment: {
                                    wrapText: true
                                },
                                fill: {
                                    patternType: "none",
                                    fgColor: { rgb: "000000" },
                                    bgColor: { rgb: "FFFFFF" }
                                },
                                font: {
                                    name: 'Arial',
                                    sz: 9,
                                    color: { rgb: "#000000" },
                                    bold: false,
                                    italic: false,
                                    underline: false
                                },
                                border: {
                                    top: { style: "thin", color: { auto: 1 } },
                                    right: { style: "thin", color: { auto: 1 } },
                                    bottom: { style: "thin", color: { auto: 1 } },
                                    left: { style: "thin", color: { auto: 1 } }
                                }
                            }
                        };

                        // Header row style
                        if (rowIndex == 0 || row.indexOf("__footer") > 0)
                        {
                            excelCell.s.font.bold = true;
                            excelCell.s.font.color = { rgb: "FFFFFF" };
                            excelCell.s.fill.patternType = "solid";
                            excelCell.s.fill.fgColor = { rgb: "4F81BD" };
                        }
                        else if (row.indexOf("__group") > 0)
                        {
                            excelCell.s.font.bold = true;
                            excelCell.s.font.color = { rgb: "000000" };
                            excelCell.s.fill.patternType = "solid";
                            excelCell.s.fill.fgColor = { rgb: "FABF8F" };
                        }

                        ws[cell_ref] = excelCell;
                        // END - set cell
                    });
                });

                return ws;
            },

            getSheetColumnWidth: function (Job)
            {
                var wscols = [];
                if (Job.Columns)
                {
                    var sumColumnWidth = 0; var sheetWidth = _That.Excel.Sheet_MaxWidth;
                    for (var i = 0; i < Job.Columns.length; i++)
                    {
                        var tMinWidth = Job.Columns[i]['minWidth'];
                        var tWidth = Job.Columns[i]['width'];

                        if (tWidth != undefined || tMinWidth === tWidth)
                            sheetWidth -= tWidth; //fix widths
                        else
                            sumColumnWidth += tMinWidth; //variable widths         
                    }

                    for (var i = 0; i < Job.Columns.length; i++)
                    {
                        var tMinWidth = Job.Columns[i]['minWidth'];
                        var tWidth = Job.Columns[i]['width'];

                        //variable widths    
                        if (tWidth === undefined || tMinWidth === tWidth) tWidth = Math.floor((sheetWidth / 100 * (100 / sumColumnWidth * tMinWidth)));

                        wscols.push({ wpx: tWidth });
                    }
                }
                return wscols;
            },

            getSheetRowHeight: function (Job)
            {
                var wsrows = [,]; // skip first row (header)

                var height = Job.Slickgrid.grid.getOptions().rowHeight;
                for (var i = 1; i < Job.Data.length; i++)
                {
                    wsrows.push({ hpx: height });
                }

                return wsrows;
            },

            getColumnFormatter: function (Job)
            {
                var columnFormatter = [];
                for (var i = 0; i < Job.Columns.length; i++)
                {

                    var formatterName = (Job.Columns[i]._formatter ? Job.Columns[i]._formatter : '');
                    var aFormatterName = formatterName.split('.');
                    var tFormatterName = aFormatterName[aFormatterName.length - 1];

                    if (typeof Job.Columns[i].formatter === 'function' && _That.Data.columnFormatter[tFormatterName] != undefined)
                    {
                        columnFormatter.push(_That.Data.columnFormatter[tFormatterName]);
                    }
                    else
                    {
                        columnFormatter.push(undefined);
                    }
                }


                return columnFormatter;
            }

        },

        Data: {
            // remove column due to formatter
            //undesiredFormatter: ['Aperture', 'Edit', 'Remove', 'SVGLink'],
            undesiredFormatter_CSV: ['GF_Image'],
            // remove column due to id
            undesiredID: ['_checkbox_selector'],
            // dont call formatter
            //ignoredFormatter: ['GF.DEC', 'GF.DEC9', 'GF.MONEY', 'GF.MONEY2', 'GF_S', 'GF_X'],

            columnFormatter: { 'Meters': '#,##0.00', 'Squaremeters': '#,##0.00', 'Date': 'd.m.yy', 'DateTime': 'd.m.yy h:mm:ss' },
            //  Formatter List:
            //    0:  'General',
            //    1:  '0',
            //    2:  '0.00',
            //    3:  '#,##0',
            //    4:  '#,##0.00',
            //    9:  '0%',
            //    10: '0.00%',
            //    11: '0.00E+00',
            //    12: '# ?/?',
            //    13: '# ??/??',
            //    14: 'm/d/yy',
            //    15: 'd-mmm-yy',
            //    16: 'd-mmm',
            //    17: 'mmm-yy',
            //    18: 'h:mm AM/PM',
            //    19: 'h:mm:ss AM/PM',
            //    20: 'h:mm',
            //    21: 'h:mm:ss',
            //    22: 'm/d/yy h:mm',
            //    37: '#,##0 ;(#,##0)',
            //    38: '#,##0 ;[Red](#,##0)',
            //    39: '#,##0.00;(#,##0.00)',
            //    40: '#,##0.00;[Red](#,##0.00)',
            //    45: 'mm:ss',
            //    46: '[h]:mm:ss',
            //    47: 'mmss.0',
            //    48: '##0.0E+0',
            //    49: '@',
            //    65535: 'General'

            //_ListToJob: async function  (param) {
            _ListToJob: function (param)
            { //REPLACE: async function(param){
                var slickgrid = param['Slickgrid'];
                var type = param['Type'];
                var callBack = param['CallBack'];

                var tColumns = slickgrid.grid.getColumns().slice();
                var tDataArray = [];
                var tDataAlign = [];
                var tMerges = [];
                var tFooter = {};

                //START - add header
                if (tColumns)
                {
                    var header = [];

                    for (var i = tColumns.length - 1; i >= 0; i--)
                    {
                        var col = tColumns[i];

                        if (col['includeInExport'] === false || _That.Data.undesiredID.indexOf(col.id) > -1)
                        {
                            tColumns.splice(i, 1);
                            continue;
                        }

                        if (typeof col['footer'] === 'function') tFooter[col.id] = 0;

                        var formatterName = col._export;
                        if (formatterName === undefined) formatterName = (col._formatter ? col._formatter : '');

                        var aFormatterName = formatterName.split('.');
                        var tFormatterName = aFormatterName[aFormatterName.length - 1];

                        //set export formatter when and '_.Slicklist.Formatter.xxx' equivalent for export exists
                        if (typeof col.export != 'function' && typeof col.formatter === 'function')
                        {
                            var _checkFormatter = '_.Slicklist.Export.Formatter.' + tFormatterName;
                            if (typeof (window['_']['Slicklist']['Export']['Formatter'][tFormatterName]) === 'function')
                            {
                                col._export = _checkFormatter;

                                try
                                {
                                    col.export = _checkFormatter && (typeof eval(_checkFormatter) === 'function') && eval(_checkFormatter);
                                }
                                catch (err)
                                {
                                    console.log(err);
                                }
                            }
                        }

                        if (
                            typeof col.formatter === 'function' &&
                            type == 'CSV' && _That.Data.undesiredFormatter_CSV.indexOf(tFormatterName) > -1
                        )
                        {
                            tColumns.splice(i, 1);
                            continue;
                        }

                        if (type == 'PDF')
                        {
                            var cell = { text: tColumns[i]['name'], style: 'header' };

                            var cssClass = col['headerCssClass'];
                            if (cssClass == 'aC' || cssClass == 'aR')
                            {
                                cell['alignment'] = (cssClass == 'aC' ? 'center' : 'right');
                                tDataAlign[col['id']] = cell['alignment'];
                            }

                            header.unshift(cell);
                        }
                        else
                        {
                            header.unshift(tColumns[i]['name']);
                        }
                    }

                    tDataArray.push(header);
                }
                //END - add header


                //START - add rows
                if (tColumns && slickgrid.dataView)
                {
                    var _rowLength = slickgrid.dataView.getLength();
                    for (var x = 0; x < _rowLength; x++)
                    {
                        var row = [];
                        var dc = slickgrid.dataView.getItem(x);

                        if (dc['__group'] === true)
                        {
                            // special group row
                            if (type === 'CSV') continue;

                            var value = dc['value'];
                            if (typeof value === 'undefined') value = '';
                            value += ' (' + dc['rows'].length + ')';

                            if (type === 'PDF')
                            {
                                row.push({ text: value, colSpan: (tColumns.length), style: 'group' });
                                for (var i = 1; i < tColumns.length; i++) { row.push({}); }
                            }
                            else
                            {
                                tMerges.push({ s: { r: (x + 1), c: 0 }, e: { r: (x + 1), c: (tColumns.length - 1) } });
                                row.push(value);
                                row.push('__group');
                            }
                        }
                        else
                        {
                            for (var i = 0; i < tColumns.length; i++)
                            {
                                var col = tColumns[i];
                                var field = col['field'];
                                var value = dc[field];
                                var formatterName = (col._formatter ? col._formatter : '');
                                var aFormatterName = formatterName.split('.');
                                var tFormatterName = aFormatterName[aFormatterName.length - 1];

                                //test value
                                //if(col._export === '_.Slicklist.Export.Formatter.SVG') value = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0,0,1000.0016,1000" width="20"><g stroke-width=".39819491" transform="matrix(2.51134 0 0 2.51133 -239.06 -636.028)"><rect width="397" height="397" x="95.790001" y="253.86" fill="#ccc" stroke="#000" stroke-width="1.19458485" stroke-miterlimit="3" ry="0" rx="0"></rect><g fill="#fff"><path d="M277.14 523.8h35.72v77.13h-35.72zm-51.78-181.62h140V518.6h-140z"></path><path d="M252.68 307.18h83.2v45.18h-83.2zm102.86 96.25h29.64V511.3h-29.64z"></path><path d="M360.18 418.97h41.6v76.6h-41.6zm-159.3-21.07h32.7v112.68h-32.7z"></path><path d="M188.2 420.58h26.62v70.53h-26.6z"></path></g><path d="M383.55 390.22c.03-.76.04-1.5.04-2.25 0-24.5-13.37-47.1-34.47-59.08-6.07-24.95-28.7-43.1-54.85-43.1-26.16 0-48.8 18.15-54.87 43.1-21.1 11.94-34.44 34.54-34.44 59.06 0 .74 0 1.5.04 2.24-22.2 14.62-35.73 39.4-35.73 66.3 0 43.73 35.57 79.3 79.3 79.3h17.23v65.78c0 5.96 4.82 10.78 10.78 10.78h35.36c5.96 0 10.78-4.82 10.78-10.78V535.8h17.23c43.74 0 79.32-35.57 79.32-79.3 0-26.9-13.54-51.68-35.75-66.28zM301.18 590.8h-13.8v-55h13.8zm38.8-76.55H248.6c-31.85 0-57.76-25.9-57.76-57.75 0-21.36 11.72-40.9 30.58-50.98 3.98-2.14 6.22-6.53 5.6-11-.33-2.22-.48-4.42-.48-6.56 0-18.03 10.6-34.56 27-42.1 3.34-1.53 5.67-4.68 6.17-8.34 2.35-17.2 17.2-30.16 34.6-30.16 17.38 0 32.24 12.97 34.57 30.16.5 3.66 2.83 6.8 6.18 8.35 16.4 7.54 27 24.07 27 42.1 0 2.16-.16 4.35-.47 6.5-.65 4.5 1.58 8.9 5.58 11.05 18.86 10.1 30.58 29.62 30.58 50.98 0 31.84-25.9 57.75-57.76 57.75z"></path></g></svg>'

                                if (typeof col['displayfield'] != 'undefined')
                                {
                                    value = dc[col['displayfield']];
                                }
                                else if (typeof value != 'undefined')
                                {

                                    //formatter value
                                    var tFormatter = col.export;

                                    if (typeof tFormatter != 'function') tFormatter = col.formatter;
                                    if (typeof tFormatter != 'function') tFormatter = _.Slicklist.Export.Formatter.Any;

                                    if (col._export === '_.Slicklist.Export.Formatter.SVG')
                                    {
                                        try
                                        {
                                            value = undefined; //REPLACE: value = await tFormatter(x, i, value, col, dc, param);

                                        } catch (e) { }
                                    }
                                    else value = tFormatter(x, i, value, col, dc, param);
                                }

                                if (typeof value === 'undefined') value = '';



                                if (type === 'XLSX')
                                {
                                    if (col['ExportSVG'] === true && value != '')
                                    {
                                        value = { 'Image': true, 'MIME': 'png', 'Name': ('I_' + i + '_X_' + x + '.png'), 'Data': value, 'Width': 50, 'Height': 50 };
                                    }

                                    row.push(value);
                                }
                                else if (type === 'PDF')
                                {
                                    var cell = {};

                                    //add image base64
                                    if (col['ExportSVG'] === true)
                                    {
                                        cell['image'] = value;
                                        cell['alignment'] = 'center';
                                        cell['fit'] = [8, 8];
                                    }
                                    //add image from col['ExportCssSelectors'] (set in formatter)
                                    else if (typeof col['ExportCssSelectors'] === 'object')
                                    {
                                        var _test = col['ExportCssSelectors'][value];

                                        if (typeof _test === 'string')
                                        {
                                            cell['image'] = _test;
                                            cell['alignment'] = 'center';
                                            cell['fit'] = [8, 8];
                                        }
                                    }
                                    else
                                    {
                                        if (tDataAlign[col['id']] != undefined)
                                        {
                                            cell['alignment'] = tDataAlign[col['id']];
                                        }

                                        cell['text'] = value;
                                    }

                                    row.push(cell);
                                }
                                else
                                {
                                    row.push(value);
                                }

                                if (typeof col['footer'] === 'function')
                                {
                                    value = dc[field];
                                    if (!isNaN(parseFloat(value)) && isFinite(value))
                                        tFooter[col.id] += parseFloat(value);
                                }
                            }
                        }
                        tDataArray.push(row);
                    }
                    //END - add rows     

                    if (type != 'CSV' && Object.keys(tFooter).length > 0)
                    {
                        var row = [];

                        for (var i = 0; i < tColumns.length; i++)
                        {
                            var col = tColumns[i]; var value = '';

                            if (typeof col['footer'] === 'function') value = col['footer'](tFooter[col.id], _rowLength);
                            if (typeof value === 'undefined') value = '';

                            if (type === 'PDF')
                                row.push({ text: value, style: 'footer' });
                            else
                                row.push(value);
                        }

                        if (type === 'XLSX') row.push('__footer');

                        tDataArray.push(row);
                    }

                    //add images from column['ExportCssSelectors']
                    for (var i = 0; i < tColumns.length; i++)
                    {
                        var col = tColumns[i]; var cssSel = col['ExportCssSelectors'];
                        if (typeof cssSel === 'object')
                        {

                            var keys = Object.keys(cssSel);
                            for (var j = 0; j < keys.length; j++)
                            {
                                _That.PDF.addImageToDict(cssSel[keys[j]]);
                            }
                        }
                    }

                }

                param['Data'] = tDataArray;
                param['Columns'] = tColumns;
                param['Align'] = tDataAlign;
                param['Merges'] = tMerges;

                if (typeof callBack === 'function') callBack(param);
            }
        },



        svgToPng: function (svgText, margin, fill)
        {
            return new Promise(function (resolve, reject)
            {
                try
                {
                    var domUrl = window.URL || window.webkitURL || window;
                    if (!domUrl)
                    {
                        throw new Error('(browser doesnt support this)');
                    }

                    var match = svgText.match(/height=\"(\d+)/m);
                    var height = match && match[1] ? parseInt(match[1], 10) : 200;
                    var match = svgText.match(/width=\"(\d+)/m);
                    var width = match && match[1] ? parseInt(match[1], 10) : 200;
                    margin = margin || 0;

                    if (!svgText.match(/xmlns=\"/mi))
                    {
                        svgText = svgText.replace('<svg ', '<svg xmlns=\"http://www.w3.org/2000/svg\" ');
                    }

                    var canvas = document.createElement('canvas');
                    canvas.width = height + margin * 2;
                    canvas.height = width + margin * 2;
                    var ctx = canvas.getContext('2d');

                    var svg = new Blob([svgText], {
                        type: 'image/svg+xml;charset=utf-8'
                    });

                    var url = domUrl.createObjectURL(svg);

                    var img = new Image;
                    img.onload = function ()
                    {
                        ctx.drawImage(this, margin, margin);

                        if (fill)
                        {
                            var styled = document.createElement('canvas');
                            styled.width = canvas.width;
                            styled.height = canvas.height;
                            var styledCtx = styled.getContext('2d');
                            styledCtx.save();
                            styledCtx.fillStyle = fill;
                            styledCtx.fillRect(0, 0, canvas.width, canvas.height);
                            styledCtx.strokeRect(0, 0, canvas.width, canvas.height);
                            styledCtx.restore();
                            styledCtx.drawImage(canvas, 0, 0);
                            canvas = styled;
                        }

                        domUrl.revokeObjectURL(url);
                        resolve(canvas.toDataURL());
                    };

                    img.src = url;
                }
                catch (err)
                {
                    reject('failed to convert svg to png ' + err);
                }
            });
        }
    };


    function _setFunction(func)
    {
        for (var tLines = func.toString().split('\n'), tResult = [], i = 0, j = tLines.length; i < j; i++)
        {
            tResult.push(
                tLines[i].indexOf('//REPLACE: ') === -1 ? tLines[i] : tLines[i].split('//REPLACE: ').pop()
            );
        }

        return tResult.join('\n');
    };


    document.addEventListener && document.addEventListener('DOMContentLoaded', function (event)
    {
        if (_supportsAsync())
        {
            eval(';window._.Slicklist.Export.Formatter.SVG = ' + _setFunction(_.Slicklist.Export.Formatter.SVG));
            eval(';window._.Slicklist.Export.Data._ListToJob = ' + _setFunction(_.Slicklist.Export.Data._ListToJob));
        }
    });


}(window._ = window._ || {}));
