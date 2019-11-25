/**************************************************************************************************
* Combobox-Funktionen
**************************************************************************************************/
; (function (ns)
{
    'use strict';

    var _List = [];

	/**************************************************************************************************
	* Gibt das Objekt für das passende Referenz-Element (element) zurück, falls gefunden
	**************************************************************************************************/
    function _getItem(element)
    {
        var tReturn = null;

        try
        {
            if (element)
            {
                for (var i = 0, j = _List.length; i < j; i++)
                {
                    if (
                        _List[i].Element === element ||
                        _List[i].Wrapper === element
                    )
                    {
                        tReturn = _List[i];
                        break;
                    }
                }
            }
        }
        catch (err)
        {
            console.log('_getItem', err);
        }

        return tReturn;
    }

	/**************************************************************************************************
	* Handlung, welche beim Ereignis "oninput" ausgeführt wird
	**************************************************************************************************/
    function _oninput(event)
    {
        try
        {
            var tInput = this;
            if (tInput)
            {
                window.clearTimeout(_That.Timeout);
                _That.Timeout = window.setTimeout(function (input)
                {
                    window.clearTimeout(this.Timeout);

                    var tItem = _getItem(input.parentNode);
                    if (tItem)
                    {
                        //REM: Alle Optionen entfernen
                        for (var tL = tItem.Element.querySelectorAll('optgroup, option'), i = tL.length - 1; i >= 0; i--)
                        {
                            if (
                                //REM: Leere-Optionen werden nicht entfernt (=bitte auswählen)
                                tL[i].value !== '' &&
                                tL[i].value !== '00000000-0000-0000-0000-000000000000'
                            )
                            {
                                tL[i].parentNode.removeChild(tL[i]);
                            }
                        }

                        //REM: Optionen, welchen den Suchbegriff beinhalten, einfügen
                        var tValue = input.value.trim().toLowerCase();
                        for (var i = 0, j = tItem.Clone.options.length; i < j; i++)
                        {
                            if (
                                (
                                    //REM: Leere-Optionen werden nicht angefügt (=bitte auswählen)
                                    tItem.Clone.options[i].value !== '' &&
                                    tItem.Clone.options[i].value !== '00000000-0000-0000-0000-000000000000'
                                ) &&
                                (
                                    tValue === '' ||
                                    tItem.Clone.options[i].text.toLowerCase().indexOf(tValue) !== -1
                                )
                            )
                            {
                                var tParent = tItem.Element;

                                //REM: Gruppe (<optgroup/>) einfügen, falls noch nicht existiert
                                if (tItem.Clone.options[i].parentNode.tagName === 'OPTGROUP')
                                {
                                    var tLabel = tItem.Clone.options[i].parentNode.getAttribute('label');
                                    var tOptGroup = tParent.querySelector('optgroup[label="' + tLabel + '"]');

                                    if (!tOptGroup)
                                    {
                                        tOptGroup = tParent.appendChild(document.createElement('optgroup'));
                                        tOptGroup.setAttribute('label', tLabel);
                                    }

                                    tParent = tOptGroup;
                                }

                                tParent.appendChild(tItem.Clone.options[i].cloneNode(true));
                            }
                        }

                        //REM: Ereignis "onchange" auslösen
                        tItem.Element.onchange && tItem.Element.onchange();
                    }
                }.bind(_That, tInput), 500);
            }
        }
        catch (err)
        {
            console.log('_oninput', err);
        }
    }

    var _That = ns.Combobox = {
        Init: function ()
        {
            for (var tL = document.querySelectorAll('select.Combobox:not([disabled])'), i = 0, j = tL.length; i < j; i++)
            {
                this.Add(tL[i]);
            }
        },

        Add: function (element, options)
        {
            try
            {
                if (element && !_getItem(element))
                {
                    //REM: Wrapper, damit die zwei Elemente korrekt übereinander gelegt werden können
                    var tWrapper = document.createElement('div');
                    tWrapper.className = 'combobox-wrapper';

                    //REM: Breite "style" von Auswahlfeld übernehmen, falls gesetzt
                    //REM: Leider werden aus Prozenten dabei Pixel..
                    var tWidth = window.getComputedStyle(element).getPropertyValue('width');
                    if (tWidth)
                    {
                        tWrapper.style.width = tWidth;
                    }

                    //REM: Höhe setzen (auf Grund von "float: left" Inhalten)
                    var tHeight = element.getBoundingClientRect().height;
                    if (tHeight)
                    {
                        tWrapper.style.height = tHeight + 'px';
                    }

                    //REM: Suchfeld
                    var tInput = tWrapper.appendChild(document.createElement('input'));
                    tInput.type = 'text';
                    tInput.oninput = _oninput;

                    //REM: Wrapper an Position des Ursprungselements (=element) einfügen
                    element.parentNode.insertBefore(tWrapper, element);
                    tWrapper.appendChild(element);

                    _List.push({
                        Element: element,
                        Wrapper: tWrapper,
                        Clone: element.cloneNode(true)
                    });
                }
            }
            catch (err)
            {
                console.log('Add', err);
            }
        },

        synchroniseOptions: function (element)
        {
            try
            {
                if (element)
                {
                    var tItem = _getItem(element);
                    if (tItem)
                    {
                        tItem.Clone = element.cloneNode(true);
                    }
                }
            }
            catch (err) { console.log('synchroniseOptions', err); }
        }
    };

    (document.addEventListener) && document.addEventListener('DOMContentLoaded', function (event)
    {
        _That.Init();
    });
}(window._ = window._ || {}));
