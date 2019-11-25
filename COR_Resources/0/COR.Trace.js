/**************************************************************************************************
* Zum Loggen in der Konsole (nicht fertig)
**************************************************************************************************/
; (function (ns)
{
    'use strict';

    var _lastLog = null;

    function _Log(parameters)
    {
        try
        {
            var tLog = !!(ns.Host && ns.Host.isStandardProject() || parameters.ignoreStandard),
                tText = parameters.Text;

            if (tLog && tText)
            {
                var tNow = +new Date,
                    tColor = parameters.Color || 'blue';

                _lastLog = _lastLog || { Time: tNow, Text: '-' };

                if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor))
                {
                    console.log('%c' + tNow + ' - %c' + tText + '%c: %c' + (tNow - _lastLog.Time) + 'ms (Von "' + _lastLog.Text + '")', 'color:green', 'color:' + tColor, 'color:black', 'color:limegreen');
                }
                else if (navigator.userAgent.match(/iPad/i) != null)
                {
                    Portal.Debug._Trace.Log(tText + ': ' + (tNow - _lastLog.Time) + 'ms (Von "' + _lastLog.Text + '")');
                }
                else
                {
                    console.log(tNow + ' - ' + tText + ': ' + (tNow - _lastLog.Time) + 'ms (Von "' + _lastLog.Text + '")');
                }

                _lastLog = { Time: tNow, Text: tText };
            }
        }
        catch (err) { alert(err); }
    }

    var _That = ns.Trace = {
        Log: function (parameters)
        {
            _Log((typeof parameters === 'string') ? { Text: parameters } : parameters);
        }
    };
}(window._ = window._ || {}));
