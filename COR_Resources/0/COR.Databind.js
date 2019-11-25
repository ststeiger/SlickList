/**************************************************************************************************
* Databind-Funktionen
**************************************************************************************************/
; (function (ns)
{
    'use strict';

	/**************************************************************************************************
	* Füllt die Daten in ein HTMLSelect-Element ein. Dazu gibt es folgende Optionen:
	* - addDataToOption: Fügt dem HTMLOption-Element die Daten im Attribut "data-serialised" an
	* - callChangeEventAfterFill: Löst nach dem Abfüllen und Zuweisen das onchange()-Ereignis aus
	* - clearBeforeFill: Entfernt vor dem Abüllen alle HTMLOption-Elemente
	* - defaultOption: Klont das HTMLOption-Element an die erste Stelle des HTMLSelect-Elements
	* - onChange: Das onchange()-Ereignis des HTMLSelect-Elements (bindet select & options)
	* - selectField: Der Daten-Schlüssel für den Auswahl-Wert des HTMLOption-Elements
	* - textField: Der Daten-Schlüssel für den Text des HTMLOption-Elements
	* - valueField: Der Daten-Schlüssel für den Wert des HTMLOption-Elements
	*
	* Gruppierungen (<optgroup />) werden aktuell mit dem Level gemacht
	**************************************************************************************************/
    function _handleSelect(select, options)
    {
        try
        {
            if (select)
            {
                var tOptions = options || {};

                //REM: Entfernt alle optionen aus der Auswahl
                if (tOptions.clearBeforeFill)
                {
                    while (select.firstChild)
                        select.removeChild(select.firstChild);
                }

                //REM: Fügt die Standard-Option (--- bitte auswählen ---) als erste Option ein
                if (tOptions.defaultOption && tOptions.defaultOption.tagName === 'OPTION')
                {
                    select.insertBefore(tOptions.defaultOption.cloneNode(true), select.firstChild);
                }

                //REM: Füllt die Optionen in die Liste
                if (tOptions.Data && tOptions.Data.length)
                {
                    var tValueField = tOptions.valueField || 'Value',
                        tTextField = tOptions.textField || 'Text',
                        tSelectedField = tOptions.selectedField || 'Selected';

                    for (var tFragment = document.createDocumentFragment(), tParent = tFragment, i = 0, j = tOptions.Data.length; i < j; i++)
                    {
                        var tText = tOptions.Data[i][tTextField] || '',
                            tValue = tOptions.Data[i][tValueField] || '';

                        //REM: Falls mit <optgroup /> gearbeitet wird
                        if (tOptions.Data[i].hasOwnProperty('Level') && tOptions.Data[i].Level === 0)
                        {
                            tParent = tFragment.appendChild(document.createElement('optgroup'));
                            tParent.setAttribute('label', tText);
                        }
                        else
                        {
                            var tOption = tParent.appendChild(document.createElement('option'));
                            tOption.text = tText;
                            tOption.value = tValue;
                            tOption.selected = (!!tOptions.Data[i][tSelectedField] || options.selectedValue === tValue);

                            //REM: Wird beim Zurücksetzen von Formularen benötigt
                            if (tOption.selected)
                            {
                                tOption.defaultSelected = true;
                            }

                            //REM: Fügt die Daten an die Option an
                            if (tOptions.addDataToOption)
                            {
                                tOption.setAttribute('data-serialised', JSON.stringify(tOptions.Data[i]));
                            }
                        }
                    }

                    select.appendChild(tFragment);
                }

                //REM: Bindet das übergebene onchange-Ereignis und gibt die Optionen mit
                if (tOptions.onChange)
                {
                    select.onchange = tOptions.onChange.bind(select, tOptions);
                }

                //REM: Ruft nach dem Abfüllen das onchange-Ereignis auf
                if (tOptions.callChangeEventAfterFill)
                {
                    select.onchange && select.onchange();
                }
            }
        }
        catch (err)
        {
            console.log('_handleSelect', err);
        }

        return select;
    }

    var _That = ns.Databind = {
        getDefaultEmptyOption: function ()
        {
            var tEmptyOption = document.createElement('option');
            tEmptyOption.text = '--- bitte auswählen ---';
            tEmptyOption.value = '';

            return tEmptyOption;
        },

        Select: function (element, options)
        {
            return _handleSelect(element, options);
        }
    };
}(window._ = window._ || {}));
