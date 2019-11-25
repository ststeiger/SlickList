/**************************************************************************************************
* Session
* - Gibt aktuell nur eine Basic V4-Version für die neuen Übersichten & Formulare
* - Sobald alles auf das Cookie/JWT umgestellt ist, braucht es nur noch eine Methode
**************************************************************************************************/
; (function (ns)
{
    'use strict';

	/**************************************************************************************************
	* Prüft das Vorhandensein eines Benutzers über mBE_ID, welches in Script.ashx ausgegeben wird.
	**************************************************************************************************/
    function _isLoggedInByJavaScriptVariable()
    {
        return !!((typeof mBE_ID !== 'undefined') && mBE_ID);
    }

    var _That = ns.Session = {
        checkLoggedStatusWithFeedback: function ()
        {
            //REM: Falls kein Benutzer angemeldet ist..
            if (!this.isLoggedIn())
            {
                console.log('_.Session.DOMContentLoaded: Es ist kein angemeldeter Benutzer vorhanden.');

                if (typeof ns.Dialogue !== 'undefined')
                {
                    ns.Dialogue.Init({
                        Header: 'Not logged in!',
                        Body: 'Currently there is no user logged in. Therefore the site will reload itself.',
                        Functions: [
                            {
                                Name: 'Okay', Styles: { float: 'right' }, onclick: function (o)
                                {
                                    window.top.location.reload(true);
                                }
                            }
                        ]
                    });
                }
            }
        },

        isLoggedIn: function ()
        {
            return _isLoggedInByJavaScriptVariable();
        }
    };

    (document.addEventListener) && document.addEventListener('DOMContentLoaded', function (event)
    {
        _That.checkLoggedStatusWithFeedback();
    });
}(window._ = window._ || {}));
