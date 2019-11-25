/**************************************************************************************************
* Kalender (_.Calendar)
**************************************************************************************************/
; (function (ns)
{
    'use strict';

    var _Language = 'DE';
    var _ListOfCalendars = [];

    var _Days = {
        DE: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        EN: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        FR: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        IT: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
        RU: ['Dumengia', 'Glindesdi', 'Mardi', 'Mesemna', 'Gievgia', 'Venderdi', 'Sonda']
    };

    var _Months = {
        DE: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        EN: ['January', 'February', 'March', 'April', 'May', 'June', 'Juli', 'August', 'September', 'October', 'November', 'December'],
        FR: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        IT: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        RU: ['Schaner', 'Favrer', 'Mars', 'Avrigl', 'Matg', 'Zercladur', 'Fanadur', 'Avust', 'Settember', 'October', 'November', 'December']
    };

    var _Week = {
        DE: 'Woche',
        EN: 'Week',
        FR: 'Semaine',
        IT: 'Settimana',
        RU: 'Emna'
    };

    var _Month = {
        DE: 'Monat',
        EN: 'Month',
        FR: 'Mois',
        IT: 'Mese',
        RU: 'Mais'
    };

    var _defaultFormat = {
        Day: {
            itemFormat: '@dd. @MM. @yy. @hh.:@cc.',
            titleFormat: ['@Sdd.. @SMM. @yy.'],
            valueFormat: '@hh.'
        },

        Week: {
            itemFormat: '@dd. @MM. @yy. @hh.:@cc.',
            //titleFormat: ['@dd. @MM. @yy.', '@dd. @MM. @yy. (Woche @ww.)'],
            titleFormat: ['Woche @ww. (@dd. @MM. @yy.', '@dd. @MM. @yy.)'],
            valueFormat: '@dd.'
        },

        Month: {
            itemFormat: '@dd. @MM. @yy. @hh.:@cc.',
            titleFormat: ['@SMM. @Syy.'],
            valueFormat: '@dd.'
        },

        Year: {
            itemFormat: '@dd. @MM. @yy. @hh.:@cc.',
            titleFormat: ['@Syy.'],
            valueFormat: '@MM.'
        }
    };

	/**************************************************************************************************
	* Die Verschiedenen Zeitspannen-Ansichten, welche im Kaldender zur Verfügung stehen.
	* Jede Zeitspanne hat folgende Funktionen zu besitzen:
	* - Init(): Initialisiert die Zeitspanne
	* - Render(): Gibt die initialisierte Zeitspanne als HTML aus
	**************************************************************************************************/
    var _Span = {
        Render: function (namespace, options)
        {
            var tFragment = document.createDocumentFragment(),
                tTimeline = options._Timeline;

            if (tTimeline && tTimeline.Items && tTimeline.Items.length)
            {
                var tNavigatePrevious = tFragment.appendChild(document.createElement('b'));
                tNavigatePrevious.className = 'calendar-navigate calendar-navigate-previous _Res _resNavigateLeft';
                tNavigatePrevious.textContent = '<';
                tNavigatePrevious.onclick = namespace.onPrevious.bind(namespace, options);

                var tNavigateNext = tFragment.appendChild(document.createElement('b'));
                tNavigateNext.className = 'calendar-navigate calendar-navigate-next _Res _resNavigateRight';
                tNavigateNext.textContent = '>';
                tNavigateNext.onclick = namespace.onNext.bind(namespace, options);

                var tTitle = tFragment.appendChild(document.createElement('h1'));
                tTitle.className = 'calendar-title';
                tTitle.appendChild(_formatSpan(tTimeline.Start, tTimeline.End, tTimeline.titleFormat));

                if (tTimeline.Span && typeof tTimeline.Span.getName === 'function')
                {
                    tTitle.className += ' ' + tTimeline.Span.getName()
                }

                var tViewport = tFragment.appendChild(document.createElement('div'));
                tViewport.className = 'calendar-viewport';

                var tHeader = tViewport.appendChild(document.createElement('ul'));
                tHeader.className = 'calendar-row calendar-header-row';
            }

            return tFragment;
        },

        //REM: Behandelt die Ansicht unterteilt in Tage > Stunden
        Day: {
            Init: function (options)
            {
                var tNow = new Date();

                options._Timeline = {
                    End: +(_toDate(options.End) || _getEndOfDay(tNow)),
                    Items: [],
                    Span: this,
                    Start: +(_toDate(options.Start) || _getStartOfDay(tNow)),
                    itemFormat: options.Format.Day.itemFormat,
                    titleFormat: options.Format.Day.titleFormat,
                    valueFormat: options.Format.Day.valueFormat
                };

                var tStart = new Date(options._Timeline.Start);
                while (tStart <= options._Timeline.End)
                {
                    options._Timeline.Items.push(+tStart);
                    tStart.setHours(tStart.getHours() + 1);
                };

                return options;
            },

            getName: function ()
            {
                return 'day';
            },

            Render: function (options)
            {
                var tFragment = _Span.Render(this, options),
                    tHeader = tFragment.querySelector('.calendar-header-row'),
                    tTitle = tFragment.querySelector('.calendar-title'),
                    tTimeline = options._Timeline;

                if (tTimeline)
                {
                    //REM: Zurück auf die Wochenansicht
                    if (tTitle && options.Format.Week.titleFormat)
                    {
                        var tNavigateUpper = tTitle.appendChild(document.createElement('b'));
                        tNavigateUpper.className = 'calendar-navigate calendar-navigate-upper _Res _resNavigateUp';
                        tNavigateUpper.textContent = '^';
                        tNavigateUpper.onclick = this.onUpper.bind(this, options);
                    };

                    //REM: Die Zeiten des Tages
                    if (tHeader)
                    {
                        for (var i = 0, j = tTimeline.Items.length; i < j; i++)
                        {
                            var tStart = new Date(tTimeline.Items[i]);

                            var tValue = tHeader.appendChild(document.createElement('li'));
                            tValue.appendChild(_Format(tStart, tTimeline.valueFormat));
                            tValue.setAttribute('data-timeline-hour', tStart.getHours());
                            tValue.style.width = (100 / j) + '%';

                            (typeof options.onCreateHeaderItem === 'function') && options.onCreateHeaderItem(options, tValue);

                        }
                    }
                };

                return tFragment;
            },

            onNext: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setDate(_toDate(options._Timeline.Start).getDate() + 1));
                options.End = _toDate(_toDate(options._Timeline.End).setDate(_toDate(options._Timeline.End).getDate() + 1));

                _Render(options);
            },

            onPrevious: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setDate(_toDate(options._Timeline.Start).getDate() - 1));
                options.End = _toDate(_toDate(options._Timeline.End).setDate(_toDate(options._Timeline.End).getDate() - 1));

                _Render(options);
            },

            onUpper: function (options)
            {
                _changeViewTo(
                    options,
                    'week',
                    _getStartOfWeek(options._Timeline.Start),
                    _getEndOfWeek(options._Timeline.Start)
                );
            }
        },

        //REM: Behandelt die Ansicht unterteilt in Wochen > Tage
        Week: {
            Init: function (options)
            {
                var tNow = new Date();

                options._Timeline = {
                    End: +(_toDate(options.End) || _getEndOfWeek(tNow)),
                    Items: [],
                    Span: this,
                    Start: +(_toDate(options.Start) || _getStartOfWeek(tNow)),
                    itemFormat: options.Format.Week.itemFormat,
                    titleFormat: options.Format.Week.titleFormat,
                    valueFormat: options.Format.Week.valueFormat
                };

                var tStart = new Date(options._Timeline.Start);
                while (tStart <= options._Timeline.End)
                {
                    options._Timeline.Items.push(+tStart);
                    tStart.setDate(tStart.getDate() + 1);
                }

                return options;
            },

            Render: function (options)
            {
                var tFragment = _Span.Render(this, options),
                    tHeader = tFragment.querySelector('.calendar-header-row'),
                    tTitle = tFragment.querySelector('.calendar-title'),
                    tTimeline = options._Timeline;

                if (tTimeline)
                {
                    //REM: Zurück auf die Wochenansicht
                    if (tTitle && options.Format.Month.titleFormat)
                    {
                        var tNavigateUpper = tTitle.appendChild(document.createElement('b'));
                        tNavigateUpper.className = 'calendar-navigate calendar-navigate-upper _Res _resNavigateUp';
                        tNavigateUpper.textContent = '^';
                        tNavigateUpper.onclick = this.onUpper.bind(this, options);
                    };

                    //REM: Die Tage der Woche
                    if (tHeader)
                    {
                        var tToday = new Date();
                        for (var i = 0, j = tTimeline.Items.length; i < j; i++)
                        {
                            var tStart = new Date(tTimeline.Items[i]);

                            var tEnd = new Date(tStart);
                            tEnd.setHours(23, 59, 59);

                            var tValue = tHeader.appendChild(document.createElement('li'));
                            tValue.appendChild(_Format(tStart, tTimeline.valueFormat));
                            tValue.onclick = _changeViewTo.bind(_That, options, 'day', tStart, tEnd);
                            tValue.setAttribute('data-timeline-weekday', tStart.getDay());
                            tValue.style.width = (100 / j) + '%';

                            //REM: Attribut für "Heute"
                            if (
                                tToday.getFullYear() === tStart.getFullYear() &&
                                tToday.getMonth() === tStart.getMonth() &&
                                tToday.getDate() === tStart.getDate()
                            )
                            {
                                tValue.setAttribute('data-timeline-today', tToday.getDate());
                            };

                            (typeof options.onCreateHeaderItem === 'function') && options.onCreateHeaderItem(options, tValue);
                        }
                    }
                };

                return tFragment
            },

            onNext: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setDate(_toDate(options._Timeline.Start).getDate() + 7));
                options.End = _getEndOfWeek(options.Start);

                _Render(options)
            },

            onPrevious: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setDate(_toDate(options._Timeline.Start).getDate() - 7));
                options.End = _getEndOfWeek(options.Start);

                _Render(options)
            },

            onUpper: function (options)
            {
                _changeViewTo(
                    options,
                    'month',
                    _getStartOfMonth(options._Timeline.Start),
                    _getEndOfMonth(options._Timeline.Start)
                )
            }
        },

        //REM: Behandelt die Ansicht unterteilt in Monate > Tage
        Month: {
            Init: function (options)
            {
                var tNow = new Date();

                options._Timeline = {
                    End: +(_toDate(options.End) || _getEndOfMonth(tNow)),
                    Items: [],
                    Span: this,
                    Start: +(_toDate(options.Start) || _getStartOfMonth(tNow)),
                    itemFormat: options.Format.Month.itemFormat,
                    titleFormat: options.Format.Month.titleFormat,
                    valueFormat: options.Format.Month.valueFormat
                };

                var tStart = new Date(options._Timeline.Start);
                while (tStart <= options._Timeline.End)
                {
                    options._Timeline.Items.push(+tStart);
                    tStart.setDate(tStart.getDate() + 1);
                };

                return options
            },

            Render: function (options)
            {
                var tFragment = _Span.Render(this, options),
                    tHeader = tFragment.querySelector('.calendar-header-row'),
                    tHeader2 = tHeader.parentNode.insertBefore(tHeader.cloneNode(true), tHeader),
                    tTitle = tFragment.querySelector('.calendar-title'),
                    tTimeline = options._Timeline;

                if (tTimeline)
                {
                    //REM: Zurück auf die Jahresansicht
                    if (tTitle && options.Format.Year.titleFormat)
                    {
                        var tNavigateUpper = tTitle.appendChild(document.createElement('b'));
                        tNavigateUpper.className = 'calendar-navigate calendar-navigate-upper _Res _resNavigateUp';
                        tNavigateUpper.textContent = '^';
                        tNavigateUpper.onclick = this.onUpper.bind(this, options);
                    };

                    //REM: Wochen
                    if (tHeader2)
                    {
                        for (var i = 0, j = tTimeline.Items.length; i < j; i++)
                        {
                            var tStart = new Date(tTimeline.Items[i]),
                                tWeek = _getWeekFromDate(tStart);

                            var tValue = tHeader2.querySelector('[data-timeline-week="' + tWeek + '"]');
                            if (tValue)
                            {
                                tValue.style.width = parseFloat(tValue.style.width) + (100 / j) + '%';
                            }
                            else
                            {
                                var tValue = tHeader2.appendChild(document.createElement('li'));
                                tValue.title = tValue.textContent = _Week[_Language] + ' ' + tWeek;
                                tValue.onclick = _changeViewTo.bind(_That, options, 'week', _getStartOfWeek(tStart), _getEndOfWeek(tStart));
                                tValue.setAttribute('data-timeline-week', tWeek);
                                tValue.style.width = (100 / j) + '%'
                            }
                        }
                    };

                    //REM: Tage
                    if (tHeader)
                    {
                        var tToday = new Date();
                        for (var i = 0, j = tTimeline.Items.length; i < j; i++)
                        {
                            var tStart = new Date(tTimeline.Items[i]);

                            var tEnd = new Date(tStart);
                            tEnd.setHours(23, 59, 59);

                            var tValue = tHeader.appendChild(document.createElement('li'));
                            tValue.appendChild(_Format(tStart, tTimeline.valueFormat));
                            tValue.onclick = _changeViewTo.bind(_That, options, 'day', tStart, tEnd);
                            tValue.setAttribute('data-timeline-weekday', tStart.getDay());
                            tValue.style.width = (100 / j) + '%';

                            //REM: Attribut für "Heute"
                            if (
                                tToday.getFullYear() === tStart.getFullYear() &&
                                tToday.getMonth() === tStart.getMonth() &&
                                tToday.getDate() === tStart.getDate()
                            )
                            {
                                tValue.setAttribute('data-timeline-today', tToday.getDate())
                            }
                        }
                    }
                }

                return tFragment;
            },

            onNext: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setMonth(_toDate(options._Timeline.Start).getMonth() + 1));
                options.End = _getEndOfMonth(options.Start);

                _Render(options);
            },

            onPrevious: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setMonth(_toDate(options._Timeline.Start).getMonth() - 1));
                options.End = _getEndOfMonth(options.Start);

                _Render(options);
            },

            onUpper: function (options)
            {
                _changeViewTo(
                    options,
                    'year',
                    _getStartOfYear(options._Timeline.Start),
                    _getEndOfYear(options._Timeline.Start)
                );
            }
        },

        //REM: Behandelt die Ansicht unterteilt in Jahre > Monate
        Year: {
            Init: function (options)
            {
                var tNow = new Date();

                options._Timeline = {
                    End: +(_toDate(options.End) || _getEndOfYear(tNow)),
                    Items: [],
                    Span: this,
                    Start: +(_toDate(options.Start) || _getStartOfYear(tNow)),
                    itemFormat: options.Format.Year.itemFormat,
                    titleFormat: options.Format.Year.titleFormat,
                    valueFormat: options.Format.Year.valueFormat
                };

                var tStart = new Date(options._Timeline.Start);
                while (tStart <= options._Timeline.End)
                {
                    options._Timeline.Items.push(+tStart);
                    tStart.setMonth(tStart.getMonth() + 1);
                }

                return options;
            },

            Render: function (options)
            {
                var tFragment = _Span.Render(this, options),
                    tHeader = tFragment.querySelector('.calendar-header-row'),
                    tHeader2 = tHeader.parentNode.insertBefore(tHeader.cloneNode(true), tHeader),
                    tTitle = tFragment.querySelector('.calendar-title'),
                    tTimeline = options._Timeline;

                if (tTimeline)
                {
                    //REM: Monate
                    if (tHeader2)
                    {
                        for (var i = 0, j = tTimeline.Items.length; i < j; i++)
                        {
                            var tStart = new Date(tTimeline.Items[i]);

                            var tValue = tHeader2.appendChild(document.createElement('li'));
                            tValue.appendChild(_Format(tStart, tTimeline.valueFormat));
                            tValue.onclick = _changeViewTo.bind(_That, options, 'month', tStart, _getEndOfMonth(tStart));
                            tValue.setAttribute('data-timeline-month', tStart);
                            tValue.style.width = (100 / j) + '%';
                        }
                    };

                    //REM: Wochen
                    if (tHeader)
                    {
                        var tStart = new Date(options._Timeline.Start),
                            tCounter = 0;

                        while (tStart <= options._Timeline.End)
                        {
                            var tWeek = _getWeekFromDate(tStart);

                            var tValue = tHeader.querySelector('[data-timeline-week="' + tWeek + '"]');
                            if (tValue)
                            {
                                tValue.style.width = parseFloat(tValue.style.width) + (100 / j) + '%'
                            }
                            else
                            {
                                var tValue = tHeader.appendChild(document.createElement('li'));
                                tValue.title = tValue.textContent = tWeek;
                                tValue.onclick = _changeViewTo.bind(_That, options, 'week', _getStartOfWeek(tStart), _getEndOfWeek(tStart));
                                tValue.setAttribute('data-timeline-week', tWeek)
                            };

                            tStart.setDate(tStart.getDate() + 7);
                            tCounter += 1;
                        };

                        for (var tL = tHeader.querySelectorAll('[data-timeline-week]'), i = 0, j = tL.length; i < j; i++)
                        {
                            tL[i].style.width = (100 / j) + '%';
                        }
                    }
                };

                return tFragment
            },

            onNext: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setYear(_toDate(options._Timeline.Start).getFullYear() + 1));
                options.End = _getEndOfYear(options.Start);

                _Render(options)
            },

            onPrevious: function (options)
            {
                options.Start = _toDate(_toDate(options._Timeline.Start).setYear(_toDate(options._Timeline.Start).getFullYear() - 1));
                options.End = _getEndOfYear(options.Start);

                _Render(options);
            },

            onUpper: function (options)
            {
                _changeViewTo(
                    options,
                    'year',
                    _getStartOfYear(options._Timeline.Start),
                    _getEndOfYear(options._Timeline.Start)
                );
            }
        }
    };

	/**************************************************************************************************
	* Fügt Einträge in die entsprechende Zeitlinie ein
	**************************************************************************************************/
    function _addData(options, data, timeline)
    {
        try
        {
            if (options && options._Timeline && data && data.length)
            {
                var tContainer = timeline || options.Container.querySelector('.calendar-item-row[data-timeline-key="' + data.Key + '"]');
                if (tContainer)
                {
                    var tTimeline = options._Timeline,
                        tSpan = Math.abs(tTimeline.End - tTimeline.Start);

                    //REM: Einträge mit grosser Dauer werden zuerst angefügt, da ansonsten diese mit kleiner Dauer überdeckt werden
                    data = data.sort(function (a, b)
                    {
                        return (b.End - b.Start) - (a.End - a.Start);
                    });

                    for (var tFragment = document.createDocumentFragment(), i = 0, j = data.length; i < j; i++)
                    {
                        data[i].Start = +_toDate(data[i].Start);
                        data[i].End = +_toDate(data[i].End);

                        if (
                            //REM: Nur Einträge mit Dauer und Dauer innerhalb der Zeitspanne anzeigen
                            data[i].Start && data[i].End && data[i].Start < data[i].End &&
                            (
                                data[i].Start >= tTimeline.Start && data[i].Start <= tTimeline.End ||
                                data[i].End >= tTimeline.Start && data[i].End <= tTimeline.End
                            )
                        )
                        {
                            var tItem = tFragment.appendChild(document.createElement('ins')),
                                tSpan2 = Math.abs(data[i].End - data[i].Start),
                                tWidth = (tContainer.offsetWidth / tSpan * tSpan2),
                                tHeight = (tContainer.offsetHeight / tSpan * tSpan2);

                            tItem.title = _formatSpan(data[i].Start, data[i].End, tTimeline.itemFormat).textContent;
                            tItem.setAttribute('data-calendar-number', i + 1);
                            tItem.setAttribute('data-calendar-value', tItem.title);

                            if (options.Mode !== 'v')
                            {
                                //REM: Prozente gehen auf Grund von Rundungen in dämlichen Browsern nicht.
                                //https://cruft.io/posts/percentage-calculations-in-ie/
                                //tItem.style.left = (100 / tSpan * (data[i].Start - tStart)) + '%';
                                //tItem.style.width = (100 / tSpan * tSpan2) + '%';

                                tItem.style.left = (tContainer.offsetWidth / tSpan * (data[i].Start - tTimeline.Start)) + 'px';
                                tItem.style.width = tWidth + 'px';
                            }
                            else
                            {
                                tItem.style.top = (tContainer.offsetHeight / tSpan * (data[i].Start - tTimeline.Start)) + 'px';
                                tItem.style.lineHeight = tItem.style.height = tHeight + 'px';
                            };

                            //REM: Lösch-Funktionalität
                            if (
                                data[i].Removable &&
                                tWidth >= 30
                            )
                            {
                                var tRemove = tItem.appendChild(document.createElement('span'));
                                tRemove.className = 'calednar-item-function calednar-item-remove';
                            };

                            for (var tKey in data[i])
                            {
                                if (
                                    data[i][tKey] &&
                                    (
                                        tItem.style.hasOwnProperty(tKey) ||
                                        tItem.style[tKey] !== null
                                    ))
                                {
                                    tItem.style[tKey] = data[i][tKey];
                                }
                            };

                            _handleEventsItem(options, data[i], tItem, tContainer);
                            (typeof options.onItemAdded === 'function') && options.onItemAdded(tItem, data[i]);
                        }
                    };

                    tContainer.appendChild(tFragment);
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_addData' });
        }
    }

	/**************************************************************************************************
	* Fügt die Bezeichnungen der Zeitlinien ein
	**************************************************************************************************/
    function _addLabel(options, label, timeline, data)
    {
        try
        {
            if (label && timeline)
            {
                var tLabels = options.Container.querySelector('.calendar-labels');
                if (!tLabels)
                {
                    tLabels = options.Container.appendChild(document.createElement('ul'));
                    tLabels.className = 'calendar-row calendar-labels';

                    //REM: Leerzeilen erstellen (Platzhalter von '.calendar-header-row')
                    for (var tHeight = 0, tL = options.Container.querySelectorAll('.calendar-header-row'), i = 0, j = tL.length; i < j; i++)
                    {
                        var tLi = tLabels.appendChild(document.createElement('li'));
                        tLi.className = 'calendar-emptylabel';
                        tLi.innerHTML = '&nbsp;'; //REM: Ansonsten zählt die line-height nicht :s
                    }
                }

                var tItem = tLabels.appendChild(document.createElement('li'));
                tItem.textContent = label;

                (typeof options.onLabelAdded === 'function') && options.onLabelAdded(tItem, label, data);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_addLabel' });
        }
    }

	/**************************************************************************************************
	* Wechselt die Ansicht und Erstellt das passende Layout dazu
	**************************************************************************************************/
    function _changeViewTo(options, type, start, end, event)
    {
        try
        {
            var tType = (type || '').toLowerCase();
            if (options && tType)
            {
                options.Start = _toDate(start);
                options.End = _toDate(end);

                if (
                    options.Start !== options._Timeline.Start ||
                    options.End !== options._Timeline.End
                )
                {
                    options.Span = _Span[tType.charAt(0).toUpperCase() + tType.slice(1)];

                    //switch(tType){
                    //	case 'day':
                    //		options.Span = _Span.Day;
                    //		break
                    //	case 'week':
                    //		options.Span = _Span.Week
                    //};

                    _Render(options);
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_changeViewTo' });
        }
    }

	/**************************************************************************************************
	* Kopiert die Zeitspanne für alle Daten-Gruppen
	**************************************************************************************************/
    function _createTimelines(options, data)
    {
        try
        {
            if (options)
            {
                var tHeaders = options.Container.querySelectorAll('.calendar-header-row'),
                    tHeader = tHeaders[tHeaders.length - 1];

                var tTemplate = tHeader.cloneNode(true);
                tTemplate.className = 'calendar-row calendar-item-row';

                for (var tL = tTemplate.querySelectorAll('li'), i = 0, j = tL.length; i < j; i++)
                {
                    tL[i].innerHTML = '&nbsp;' //REM: Ansonsten zählt die line-height nicht :s
                }

                //REM: Normale (horizontale) Ansicht
                if (
                    options.Mode !== 'v' &&
                    data
                )
                {
                    for (var tKey in data)
                    {
                        var tTimeline = tHeader.parentNode.appendChild(tTemplate.cloneNode(true))
                        tTimeline.setAttribute('data-timeline-key', tKey);

                        _addLabel(options, tKey, tTimeline, data[tKey]);
                        _addData(options, data[tKey], tTimeline);
                        _handleEventsTimeline(options, tTimeline)
                    }
                }
                //REM: Bei der vertikalen Ansicht wird die Zeitlinie auch ohne Daten gelanden, da diese nicht Gruppen-Abhängig ist
                else if (options.Mode === 'v')
                {
                    var tTimeline = tHeader.parentNode.appendChild(tTemplate.cloneNode(true));
                    _addData(options, data, tTimeline);
                    _handleEventsTimeline(options, tTimeline);
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_createTimelines' });
        }
    };

	/**************************************************************************************************
	* Formatiert die übergebene Zeit (datetime) in das übergeben Format (format)
	**************************************************************************************************/
    function _Format(datetime, format)
    {
        var tFragment = document.createDocumentFragment();
        var tValue = _toDate(datetime);

        try
        {
            var tFormat = format.toString().replace(/@/gi, '##@');
            if (datetime)
            {
                for (var tSplit = tFormat.split('##'), i = 0, j = tSplit.length; i < j; i++)
                {
                    tFragment.appendChild(document.createTextNode(
                        tSplit[i].toString()
                            //REM: Minute
                            .replace(/@cc\./g, ('00' + tValue.getMinutes()).substr(-2, 2))
                            .replace(/@c\./g, tValue.getMinutes())

                            //REM: Stunde
                            .replace(/@hh\./g, ('00' + tValue.getHours()).substr(-2, 2))
                            .replace(/@h\./g, tValue.getHours())

                            //REM: Tag
                            .replace(/@dd\./g, ('00' + tValue.getDate()).substr(-2, 2))
                            .replace(/@d\./g, tValue.getDate())
                            .replace(/@DD\./g, _Days[_Language][tValue.getDay()])
                            .replace(/@D\./g, _Days[_Language][tValue.getDay()].substr(0, 3).toUpperCase())

                            //REM: Woche
                            .replace(/@ww\./g, ('00' + _getWeekFromDate(tValue)).substr(-2, 2))
                            .replace(/@w\./g, _getWeekFromDate(tValue))

                            //REM: Monat
                            .replace(/@mm\./g, ('00' + (tValue.getMonth() + 1)).substr(-2, 2))
                            .replace(/@m\./g, tValue.getMonth() + 1)
                            .replace(/@MM\./g, _Months[_Language][tValue.getMonth()])
                            .replace(/@M\./g, _Months[_Language][tValue.getMonth()].substr(0, 3).toUpperCase())

                            //REM: Jahr
                            .replace(/@yy\./g, tValue.getFullYear())
                            .replace(/@y\./g, tValue.getFullYear().toString().substr(2, 4))
                    ))
                };

                //REM: Auswahllisten
                for (var tL = tFragment.childNodes, i = 0, j = tL.length; i < j; i++)
                {
                    if (tL[i].nodeType === 3)
                    {
                        var tText = tL[i].textContent;

                        if (tText.indexOf('@SMM.') !== -1)
                        {
                            var tElement = _getFilterMonths('@MM.', tValue.getMonth());
                            tFragment.insertBefore(tElement, tL[i].nextSibling);
                            tFragment.insertBefore(document.createTextNode(tText.replace('@SMM.', '')), tElement.nextSibling);
                            tFragment.removeChild(tL[i]);
                        }
                        else if (tText.indexOf('@Syy.') !== -1)
                        {
                            var tElement = _getFilterYears('@yy.', tValue.getFullYear());
                            tFragment.insertBefore(tElement, tL[i].nextSibling);
                            tFragment.insertBefore(document.createTextNode(tText.replace('@Syy.', '')), tElement.nextSibling);
                            tFragment.removeChild(tL[i]);
                        }
                        else if (tText.indexOf('@Sdd.') !== -1)
                        {
                            var tElement = _getFilterDays('@dd.', tValue);
                            tFragment.insertBefore(tElement, tL[i].nextSibling);
                            tFragment.insertBefore(document.createTextNode(tText.replace('@Sdd.', '')), tElement.nextSibling);
                            tFragment.removeChild(tL[i]);
                        }

                        j = tL.length;
                    }
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_Format' });
        }

        return tFragment;
    }

	/**************************************************************************************************
	* Formatiert die übergebene Zeitspane (start bis end) in das übergeben Format (format)
	**************************************************************************************************/
    function _formatSpan(start, end, format)
    {
        var tFragment = document.createDocumentFragment();

        try
        {
            if (typeof format === 'string')
            {
                tFragment.appendChild(_Format(start, format));
                tFragment.appendChild(document.createTextNode(' - '));
                tFragment.appendChild(_Format(end, format));
            }
            else if (format.join)
            {
                tFragment.appendChild(_Format(start, format[0]));

                if (format[1])
                {
                    tFragment.appendChild(document.createTextNode(' - '));
                    tFragment.appendChild(_Format(end, format[1]));
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_formatSpan' });
        }

        return tFragment;
    }

	/**************************************************************************************************
	* Gibt das Ende des Tages der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getEndOfDay(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), tDatetime.getMonth(), tDatetime.getDate() + 1, 0, 0, -1);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getEndOfMonth' });
        }
    }

	/**************************************************************************************************
	* Gibt das Ende des Monats der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getEndOfMonth(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), tDatetime.getMonth() + 1, 1, 0, 0, -1);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getEndOfMonth' });
        }
    }

	/**************************************************************************************************
	* Gibt das Ende des Jahres der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getEndOfYear(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear() + 1, 0, 1, 0, 0, -1);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getEndOfYear' });
        }
    }

	/**************************************************************************************************
	* Gibt den Beginn der Woche der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getEndOfWeek(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), tDatetime.getMonth(), tDatetime.getDate() - (tDatetime.getDay() || 7) + 8, 0, 0, -1, 0);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getEndOfWeek' });
        }
    }

	/**************************************************************************************************
	* Erstellt eine Auswahl (<select />) mit Tagen
	**************************************************************************************************/
    function _getFilterDays(format, selectedValue)
    {
        var tSelect = document.createElement('select');
        tSelect.onchange = _onDateSelectChange.bind(this, 'day');

        var tStart = _getStartOfMonth(selectedValue),
            tEnd = _getEndOfMonth(selectedValue);

        for (var i = tStart.getDate(), j = tEnd.getDate(); i <= j; i++)
        {
            var tOption = tSelect.appendChild(document.createElement('option')),
                tText = _Months[_Language][i];

            tOption.text = format
                .replace(/@dd\./g, ('00' + i).substr(-2, 2))
                .replace(/@d\./g, i);

            tOption.value = i;

            if (selectedValue !== null)
            {
                tOption.selected = (i === selectedValue.getDate());
            }
        }

        return tSelect;
    }

	/**************************************************************************************************
	* Erstellt eine Auswahl (<select />) mit Monaten
	**************************************************************************************************/
    function _getFilterMonths(format, selectedValue)
    {
        var tSelect = document.createElement('select');
        tSelect.onchange = _onDateSelectChange.bind(this, 'month');

        for (var i = 0, j = _Months[_Language].length; i < j; i++)
        {
            var tOption = tSelect.appendChild(document.createElement('option')),
                tText = _Months[_Language][i];

            tOption.text = format
                .replace(/@mm\./g, ('00' + (i + 1)).substr(-2, 2))
                .replace(/@m\./g, i + 1)
                .replace(/@MM\./g, tText)
                .replace(/@M\./g, tText.substr(0, 3).toUpperCase());

            tOption.value = i;

            if (selectedValue !== null)
            {
                tOption.selected = (i === selectedValue);
            }
        }

        return tSelect;
    }

	/**************************************************************************************************
	* Erstellt eine Auswahl (<select />) mit Jahren
	**************************************************************************************************/
    function _getFilterYears(format, selectedValue)
    {
        var tSelect = document.createElement('select'),
            tValue = selectedValue || new Date().getFullYear();

        tSelect.onchange = _onDateSelectChange.bind(this, 'year');

        for (var i = tValue - 5, j = tValue + 5; i <= j; i++)
        {
            var tOption = tSelect.appendChild(document.createElement('option'));

            tOption.text = format
                .replace(/@yy\./g, i)
                .replace(/@y\./g, i.toString().substr(2, 4));

            tOption.value = i;

            if (selectedValue !== null)
            {
                tOption.selected = (i === selectedValue);
            }
        }

        return tSelect;
    }

	/**************************************************************************************************
	* Gibt den Beginn des Tages der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getStartOfDay(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), tDatetime.getMonth(), tDatetime.getDate(), 0, 0, 0, 0);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getStartOfDay' });
        }
    }

	/**************************************************************************************************
	* Gibt den Beginn des Monats der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getStartOfMonth(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), tDatetime.getMonth(), 1);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getStartOfMonth' });
        }
    }

	/**************************************************************************************************
	* Gibt den Beginn der Woche der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getStartOfWeek(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), tDatetime.getMonth(), tDatetime.getDate() - (tDatetime.getDay() || 7) + 1, 0, 0, 0, 0);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getStartOfWeek' });
        }
    }

	/**************************************************************************************************
	* Gibt den Beginn des Jahres der übergebenen Zeit zurück
	**************************************************************************************************/
    function _getStartOfYear(datetime)
    {
        try
        {
            if (datetime)
            {
                var tDatetime = _toDate(datetime);
                return new Date(tDatetime.getFullYear(), 0, 1);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getStartOfYear' });
        }
    }

	/**************************************************************************************************
	* Gibt die Woche eines Datums zurück
	* - https://stackoverflow.com/a/6117889/4728913
	**************************************************************************************************/
    function _getWeekFromDate(datetime)
    {
        var tValue = 0;

        try
        {
            if (datetime)
            {
                var tDate = new Date(Date.UTC(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()));

                //Set to nearest Thursday: current date + 4 - current day number
                //Make Sunday's day number 7
                tDate.setUTCDate(tDate.getUTCDate() + 4 - (tDate.getUTCDay() || 7));

                //Get first day of year
                var tYearStart = new Date(Date.UTC(tDate.getUTCFullYear(), 0, 1));

                //Calculate full weeks to nearest Thursday
                tValue = Math.ceil((((tDate - tYearStart) / 86400000) + 1) / 7);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getStartOfMonth' });
        }

        return tValue;
    }

	/**************************************************************************************************
	* Behandelt die diversen Ereignisse eines Eintrages
	**************************************************************************************************/
    function _handleEventsItem(options, data, element, timeline)
    {
        try
        {
            if (element && timeline)
            {
                //REM: Handlungen ausgehend von einem Element (Verschieben, Bearbeiten, ..)
                element.onmousedown = element.ontouchstart = function (options, data, viewport, event)
                {
                    //REM: Ereignis-Zeugs
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    viewport.onmouseup = viewport.onmousemove = viewport.onmouseleave = null;
                    this.ontouchend = this.ontouchmove = this.ontouchcancel = null;

                    var tTarget = event.target || event.srcElement;

                    //REM: Handlung beim Klick auf die Löschfunktion
                    if (tTarget.className.indexOf('calednar-item-remove') !== -1)
                    {
                        var tContinue = true;
                        if (typeof options.onItemRemove === 'function')
                        {
                            tContinue = options.onItemRemove(this, data);
                        }

                        if (tContinue && element)
                        {
                            element.onmouseup = function ()
                            {
                                this && this.parentNode && this.parentNode.removeChild(this);
                            }
                        }
                    }
                    //REM: Handlungen beim Klick auf den Rest des Elements
                    else
                    {
                        var tEventData = {
                            Item: this,
                            startLeft: parseFloat(this.style.left),
                            startTop: parseFloat(this.style.top),
                            startX: ((event.touches && event.touches.length) ? event.touches[0] : event).clientX,
                            startY: ((event.touches && event.touches.length) ? event.touches[0] : event).clientY
                        };

                        if (data.Movable)
                        {
                            viewport.onmousemove = this.ontouchmove = function (options, data, eventData, event)
                            {
                                //REM: Ereignis-Zeugs
                                event.preventDefault ? event.preventDefault() : event.returnValue = false;

                                //REM: Das IPad liefert auf ontouchend keine Koordinaten mit, daher werden diese beim ontouchmove im Objekt mitgeliefert
                                eventData.endX = ((event.touches && event.touches.length) ? event.touches[0] : event).clientX;
                                eventData.endY = ((event.touches && event.touches.length) ? event.touches[0] : event).clientY;

                                if (options.Mode !== 'v')
                                {
                                    eventData.Item.style.left = (eventData.startLeft + eventData.endX - eventData.startX) + 'px';

                                    //REM: Auf andere Zeitlinie verschieben
                                    //REM: IPad gibt im event.target stets das Anfangs-Element zurück
                                    if (data.Reassignable)
                                    {
                                        var tElement = document.elementFromPoint(eventData.endX, eventData.endY),
                                            tTimeline = function fP(e) { return ['UL', 'DIV'].indexOf(e.tagName) !== -1 ? e : fP(e.parentNode) }(tElement); //calendar-item-row

                                        if (tTimeline.className.indexOf('calendar-item-row') !== -1)
                                        {
                                            tTimeline.appendChild(eventData.Item);
                                        }
                                    }
                                }
                                else
                                {
                                    eventData.Item.style.top = (eventData.startTop + eventData.endY - eventData.startY) + 'px';
                                }
                            }.bind(viewport, options, data, tEventData);
                        }

                        viewport.onmouseup = element.ontouchend = function (options, data, eventData, event)
                        {
                            //REM: Ereignis-Zeugs
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                            this.onmouseup = this.onmousemove = this.onmouseleave = null;
                            eventData.Item.ontouchend = eventData.Item.ontouchmove = eventData.Item.ontouchcancel = null;

                            //REM: Verschieben
                            if (
                                (eventData.endX && eventData.startX !== eventData.endX) ||
                                (eventData.endY && eventData.startY !== eventData.endY)
                            )
                            {
                                if (data.Movable)
                                {
                                    var tSpan = _getTimespanOfItem(options, eventData.Item);

                                    //REM: Titel anpassen, falls Formatter übergeben wurde
                                    if (options._Timeline.itemFormat)
                                    {
                                        eventData.Item.title = _formatSpan(tSpan.Start, tSpan.End, options._Timeline.itemFormat).textContent;
                                    };

                                    (typeof options.onItemMoved === 'function') && options.onItemMoved(eventData.Item, data, tSpan.Start, tSpan.End);
                                }
                            }
                            //REM: Klicken
                            else
                            {
                                (typeof options.onItemClick === 'function') && options.onItemClick(eventData.Item, data);
                            }
                        }.bind(viewport, options, data, tEventData);

                        viewport.onmouseleave = function (eventData)
                        {
                            //REM: Ereignis-Zeugs
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                            this.onmouseup = this.onmousemove = this.onmouseleave = null;
                            eventData.Item.ontouchend = eventData.Item.ontouchmove = eventData.Item.ontouchcancel = null;

                            eventData.Item.style.left = eventData.startLeft + 'px';
                        }.bind(viewport, tEventData);

                        event.stopPropagation();
                    }
                }.bind(element, options, data, timeline.parentNode);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_handleEventsItem' });
        }
    }

	/**************************************************************************************************
	* Behandelt die diversen Ereignisse einer Zeitlinie
	**************************************************************************************************/
    function _handleEventsTimeline(options, timeline)
    {
        try
        {
            if (timeline)
            {
                //REM: Handlungen ausgehen von der Zeitlinie (Erstellen)
                timeline.onmousedown = timeline.ontouchstart = function (options, event)
                {
                    //REM: Ereignis-Zeugs
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    this.onmouseup = this.onmousemove = this.onmouseleave = null;
                    this.ontouchend = this.ontouchmove = this.ontouchcancel = null;

                    var tContinue = true;
                    if (typeof options.onItemCreate === 'function')
                    {
                        tContinue = options.onItemCreate(this, this.getAttribute('data-timeline-key'));
                    }

                    if (tContinue)
                    {
                        var tEventData = {
                            Item: timeline.appendChild(document.createElement('ins')),
                            offsetX: timeline.getBoundingClientRect().left,
                            offsetY: timeline.getBoundingClientRect().top,
                            startX: ((event.touches && event.touches.length) ? event.touches[0] : event).clientX,
                            startY: ((event.touches && event.touches.length) ? event.touches[0] : event).clientY
                        };

                        tEventData.Item.className = 'calendar-item calendar-item-new';

                        if (options.Mode !== 'v')
                        {
                            tEventData.Item.style.left = (tEventData.startX - tEventData.offsetX) + 'px';
                        }
                        else
                        {
                            tEventData.Item.style.top = (tEventData.startY - tEventData.offsetY) + 'px';
                        }

                        //REM: Verziehen des neuen Eintrages
                        this.onmousemove = this.ontouchmove = function (options, eventData, event)
                        {
                            //REM: Ereignis-Zeugs
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;

                            eventData.endX = ((event.touches && event.touches.length) ? event.touches[0] : event).clientX;
                            eventData.endY = ((event.touches && event.touches.length) ? event.touches[0] : event).clientY;

                            if (options.Mode !== 'v')
                            {
                                eventData.Item.style.left = (Math.min(eventData.startX, eventData.endX) - eventData.offsetX) + 'px';
                                eventData.Item.style.width = Math.abs(eventData.endX - eventData.startX) + 'px';
                            }
                            else
                            {
                                eventData.Item.style.top = (Math.min(eventData.startY, eventData.endY) - eventData.offsetY) + 'px';
                                eventData.Item.style.height = Math.abs(eventData.endY - eventData.startY) + 'px';
                            }
                        }.bind(this, options, tEventData);

                        //REM: Abschliessen des neuen Eintrages
                        this.onmouseup = this.ontouchend = function (options, eventData)
                        {
                            //REM: Ereignis-Zeugs
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                            this.onmousemove = this.onmouseup = this.onmouseleave = null;
                            this.ontouchmove = this.ontouchend = this.ontouchcancel = null;

                            var tSpan = _getTimespanOfItem(options, eventData.Item);

                            //REM: Titel anpassen, falls Formatter übergeben wurde
                            if (options._Timeline.itemFormat)
                            {
                                eventData.Item.title = _formatSpan(tSpan.Start, tSpan.End, options._Timeline.itemFormat).textContent;
                            }

                            (typeof options.onItemCreated === 'function') && options.onItemCreated(eventData.Item, this.getAttribute('data-timeline-key'), tSpan.Start, tSpan.End);
                        }.bind(this, options, tEventData);

                        //REM: Beim Verlassen der Zeitlinie wird kein neuer Eintrag erstellt
                        this.onmouseleave = function (eventData)
                        {
                            //REM: Ereignis-Zeugs
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                            this.onmousemove = this.onmouseup = this.onmouseleave = null;
                            this.ontouchmove = this.ontouchend = this.ontouchcancel = null;

                            eventData.Item.parentNode.removeChild(eventData.Item);
                        }.bind(this, tEventData);
                    }
                }.bind(timeline, options);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_handleEventsTimeline' });
        }
    }

	/**************************************************************************************************
	* Errechnet die Zeitspanne eines Eintrages in der Zeitlinie
	**************************************************************************************************/
    function _getTimespanOfItem(options, item)
    {
        var tSpan = {};

        try
        {
            if (options && options._Timeline && item)
            {
                var tStart = +_toDate(options._Timeline.Start),
                    tEnd = +_toDate(options._Timeline.End),
                    tDuration = tEnd - tStart;

                if (options.Mode !== 'v')
                {
                    var tTimePerPixel = tDuration / item.parentNode.offsetWidth;
                    tSpan.Start = new Date(tStart + item.offsetLeft * tTimePerPixel);
                    tSpan.End = new Date(+tSpan.Start + item.offsetWidth * tTimePerPixel);
                }
                else
                {
                    var tTimePerPixel = tDuration / item.parentNode.offsetHeight;
                    tSpan.Start = new Date(tStart + item.offsetTop * tTimePerPixel);
                    tSpan.End = new Date(+tSpan.Start + item.offsetHeight * tTimePerPixel);
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_getTimespanOfItem' });
        }

        return tSpan;
    }

	/**************************************************************************************************
	* Wird beim Ändern der Fesnter-Dimension ausgeführt. Wird benötigt, da einige Browser Rundungs-
	* Probleme mit Dezimalen-Prozenten haben (siehe oben bei _addData())
	**************************************************************************************************/
    function _onResize()
    {
        try
        {
            if (_ListOfCalendars && _ListOfCalendars.length)
            {
                for (var i = 0, j = _ListOfCalendars.length; i < j; i++)
                {
                    _Render(_ListOfCalendars[i]);
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_onResize' });
        }
    }

    function _onDateSelectChange(type, event)
    {
        try
        {
            var tTarget = event.target || event.srcElement,
                tType = (type || '').toLowerCase();

            if (tType && tTarget)
            {
                var tContainer = function fP(e) { return ((e && e.className === 'calendar') || !e) ? e : fP(e.parentNode) }(tTarget),
                    tValue = tTarget.value;

                for (var i = 0, j = _ListOfCalendars.length; i < j; i++)
                {
                    if (tContainer === _ListOfCalendars[i].Container)
                    {
                        var tOptions = _ListOfCalendars[i],
                            tSpan = tOptions._Timeline.Span;

                        switch (tType)
                        {
                            case 'day':
                                tOptions.Start = _toDate(_toDate(tOptions._Timeline.Start).setDate(tValue));
                                tOptions.End = _getEndOfDay(tOptions.Start);
                                break;
                            case 'month':
                                tOptions.Start = _toDate(_toDate(tOptions._Timeline.Start).setMonth(tValue));

                                if (tSpan === _Span.Month)
                                {
                                    tOptions.End = _getEndOfMonth(tOptions.Start);
                                }
                                else if (tSpan === _Span.Day)
                                {
                                    tOptions.End = _getEndOfDay(tOptions.Start);
                                }

                                break;
                            case 'year':
                                tOptions.Start = _toDate(_toDate(tOptions._Timeline.Start).setYear(tValue));

                                if (tSpan === _Span.Year)
                                {
                                    tOptions.End = _getEndOfYear(tOptions.Start);
                                }
                                else if (tSpan === _Span.Month)
                                {
                                    tOptions.End = _getEndOfMonth(tOptions.Start);
                                }
                                else if (tSpan === _Span.Day)
                                {
                                    tOptions.End = _getEndOfDay(tOptions.Start);
                                }
                        }

                        _Render(tOptions);
                        break;
                    }
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_onDateSelectChange' });
        }
    }

	/**************************************************************************************************
	* Gibt den Kalender und die Daten im HTML aus
	**************************************************************************************************/
    function _Render(options)
    {
        try
        {
            if (options && options.Container)
            {
                var tContainer = options.Container;
                while (tContainer.firstChild) tContainer.removeChild(tContainer.firstChild);

                tContainer.appendChild(
                    options.Span.Render(
                        options.Span.Init(options)
                    )
                );

                _createTimelines(options, options.Data);

                (typeof options.onRendered === 'function') && options.onRendered(options);
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_Render' });
        }
    }

    function _removeExistingTimelines(options)
    {
        try
        {
            if (options && options.Container)
            {
                for (var tL = options.Container.querySelectorAll('.calendar-item-row, .calendar-labels'), i = tL.length - 1; i >= 0; i--)
                {
                    tL[i].parentNode.removeChild(tL[i]);
                }
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_removeExistingTimelines' });
        }
    }

	/**************************************************************************************************
	* Wandelt das Objekt oder die Nummer in ein Datumsobjekt um
	**************************************************************************************************/
    function _toDate(datetime)
    {
        var tDatetime = datetime;

        try
        {
            if (typeof tDatetime === 'number')
            {
                tDatetime = new Date(tDatetime);
            }

            if (typeof tDatetime === 'string' && tDatetime.indexOf('/Date') !== -1)
            {
                tDatetime = new Date(parseInt(tDatetime.substr(6)));
            }
        }
        catch (err)
        {
            _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: '_toDate' });
        }

        return tDatetime;
    }

	/**************************************************************************************************
	* Wandelt das Objekt oder die Nummer in ein Datums-String um
	**************************************************************************************************/
    function _toDatetimeString(datetime)
    {
        var tDatetime = _toDate(datetime);
        return _Format(_toDate(datetime), '@dd..@mm..@yy. @hh.:@cc.').textContent;
    }

    var _That = ns.Calendar = {
        Init: function (options)
        {
            try
            {
                if (options && options.Container)
                {
                    options.Span = (options.Span && _Span[options.Span]) || _Span.Month;
                    options.Mode = options.Mode || 'h';
                    options.Container = options.Container.appendChild(document.createElement('div'));
                    options.Container.className = 'calendar';
                    options.Container.setAttribute('calendar-mode', options.Mode.toLowerCase());

                    if (options.Language)
                    {
                        _Language = options.Language;
                    }

                    //REM: Formate zusammenfügen
                    var tFormat = JSON.parse(JSON.stringify(_defaultFormat));
                    if (options.Format)
                    {
                        //REM: Day, Month, ..
                        for (var tKey in options.Format)
                        {
                            if (tFormat.hasOwnProperty(tKey))
                            {
                                //REM: itemFormat, titleFormat, valueFormat
                                for (var tKey2 in options.Format[tKey])
                                {
                                    if (tFormat[tKey].hasOwnProperty(tKey2))
                                    {
                                        tFormat[tKey][tKey2] = options.Format[tKey][tKey2];
                                    }
                                }
                            }
                        }
                    }

                    options.Format = tFormat;

                    _ListOfCalendars.push(options);
                    _Render(options);
                }
            }
            catch (err)
            {
                _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: 'Init' });
            }

            return options;
        },

        addData: function (options, data, removeExistingData)
        {
            try
            {
                if (options && options.Container)
                {
                    options.Data = data;

                    removeExistingData && _removeExistingTimelines(options);
                    _createTimelines(options, options.Data);
                }
            }
            catch (err)
            {
                _.Error.onTryCatch(err, { namespace: 'ns.Calendar', function: 'addData' });
            }
        }
    };

    if (window.addEventListener)
    {
        window.addEventListener('resize', _onResize, false);
    }
    else if (window.attachEvent)
    {
        window.attachEvent('onresize', _onResize);
    }
}(window._ = window._ || {}));
