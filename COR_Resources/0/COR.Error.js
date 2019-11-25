/**************************************************************************************************
* Fehler-Handling (alpha)
**************************************************************************************************/
; (function (ns)
{
    'use strict';

    var _Options = {
        resume: true //REM: Macht bei einem Fehler im Code weiter und wirft den Fehler nicht
    };

    function _mergeOptions(options)
    {
        var tOptions = _Options;

        if (options)
        {
            for (var tKey in options)
            {
                tOptions[tKey] = options[tKey];
            }
        }

        return tOptions;
    }

	/*********************************************************************************************************
	* Fängt genrell unbehandelte Fehler ab
	*********************************************************************************************************/
    function _onWindowError(message, source, lineno, colno, error)
    {
        _Process(error);
    }

	/*********************************************************************************************************
	* Verarbeitet den Fehler
	*********************************************************************************************************/
    function _Process(error, options)
    {
        try
        {
            if (window.location.hostname !== 'localhost')
            {
                var tText = (typeof error === 'string') ? error : (error.stack || error.message),
                    tOptions = JSON.stringify(options || {});

                var tParameters = "&Error=@Error.&Options=@Options."
                    .replace('@Error.', encodeURIComponent(tText))
                    .replace('@Options.', encodeURIComponent(tOptions));

                //REM: Basic-Version, bis es ein COR.AJAX gibt..
                if (typeof Basic === 'object' && Basic.AJAX)
                {
                    Basic.AJAX.Post(mGlobalRootPath + '/Modules/Handlers/onJSError.ashx', tParameters);
                }

                //window.top.Portal.AJAX.Post(window.top.Settings.rootLink + 'Resources/Handler/onJSError.ashx', tParameters)
            }
            else
            {
                try { console.log(error); } catch (err) { }
            }
        }
        catch (err)
        {
            //REM: Nix
        }
    }

    var _That = ns.Error = {
        Init: function (options)
        {
            window.onerror = _onWindowError;
        },

		/*********************************************************************************************************
		* Speziell behandelte Fehler
		*********************************************************************************************************/
        onTryCatch: function (error, options)
        {
            var tOptions = _mergeOptions(options);

            _Process(error, tOptions);

            //REM: Wirft den Fehler nach dem Behandeln wieder aus.
            if (tOptions.resume !== true)
            {
                throw (error);
            }
        },

		/*********************************************************************************************************
		* Behandelt Fehler als Rückgabe von Requests (XHR)
		*********************************************************************************************************/
        onXHRCallback: function (xhr, options)
        {
            var tOptions = _mergeOptions(options),
                tResult = true;

            if (xhr)
            {
                var tText = (typeof xhr === 'string') ? xhr : xhr.responseText;
                tText = (tText || '').toString();

                if (tText.indexOf('@@Error: ') !== -1)
                {
                    if (typeof xhr === 'object')
                    {
                        for (var tKey in xhr)
                        {
                            if (typeof xhr[tKey] === 'string' && !tOptions.hasOwnProperty(tKey))
                            {
                                tOptions[tKey] = xhr[tKey];
                            }
                        }
                    }

                    _Process(tText.substring(9).trim(), tOptions);
                    tResult = false;
                }
            }

            return tResult;
        }
    };

    (document.addEventListener) && document.addEventListener('DOMContentLoaded', function (event)
    {
        _That.Init();
    });
}(window._ = window._ || {}));
