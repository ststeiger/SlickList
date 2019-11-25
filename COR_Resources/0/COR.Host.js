/**************************************************************************************************
* Host-, URL- und CORS-Funktione
**************************************************************************************************/
; (function (ns)
{
    'use strict';

    //url:=url
    function _getHost(url)
    {
        var tA = document.createElement('a');
        tA.href = url;

        return tA.host;
    }

    ns.Host = {
        getCurrentHost: function ()
        {
            return document.location.origin + '/';
        },

        //url1=url1, url2=url2
        isCORS: function (url1, url2)
        {
            var tU = url2 || document.location.href;
            return (_getHost(url1) !== _getHost(tU));
        },

        //REM: Es git Funktionalitäte wo nur sölled uf em Standard-Projekt (V4-Entwicklig) vefüegbar sii, da det de Standard definiert wird
        //REM: Ausnahme für Mobimo - ist die Stärke unserer Software..
        isStandardProject: function ()
        {
            var tV = document.location.href || '';
            return ['FM_COR_Demo_V4', 'COR_Basic_Demo_V4', 'localhost'].filter(function (e) { return tV.indexOf(e) !== -1; }).length > 0;
        }
    };

    var _That = ns.Host;
}(window._ = window._ || {}));