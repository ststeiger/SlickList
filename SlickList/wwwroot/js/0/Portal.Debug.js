; (function (ns)
{
    'use strict';

    ns.Debug = {
        _Trace: {
            _getCache: function ()
            {
                var tD = { Minimized: true };

                try
                {
                    var tO = window.localStorage.getItem('Portal.Debug._Trace')
                    return !!tO ? JSON.parse(tO) : tD;
                }
                catch (err)
                {
                    return tD
                }
            },

            _getContainer: function ()
            {
                var tE = window.top.document.querySelector('#Portal_Debug_Trace');
                if (!tE)
                {
                    var tO = this._getCache();

                    tE = window.top.document.body.appendChild(window.top.document.createElement('div'));
                    tE.id = 'Portal_Debug_Trace';
                    tE.onclick = function ()
                    {
                        if (this.className.indexOf('Minimized') !== -1)
                        {
                            Portal.Debug._Trace._Normalize(Portal.Debug._Trace._getContainer());
                            Portal.Debug._Trace.Show();
                        }
                    };

                    tO.Minimized && (tE.className = 'Minimized');

                    var tN = tE.appendChild(window.top.document.createElement('div'));
                    tN.id = 'Portal_Debug_Trace_Menu';

                    var tM1 = tN.appendChild(window.top.document.createElement('div'));
                    tM1.className = 'Icon Clear';
                    tM1.title = 'Clear trace';
                    tM1.onclick = function (e)
                    {
                        e.stopPropagation();

                        var tE = Portal.Debug._Trace._getContainer().querySelector('ins');
                        while (tE.firstChild) tE.removeChild(tE.firstChild);
                    };

                    var tM2 = tN.appendChild(window.top.document.createElement('div'));
                    tM2.className = 'Icon Close';
                    tM2.title = 'Close trace';
                    tM2.onclick = function (e)
                    {
                        e.stopPropagation();
                        Portal.Debug._Trace._Minimize(Portal.Debug._Trace._getContainer());
                    };

                    tE.appendChild(window.top.document.createElement('ins'));
                };

                return tE;
            },

            _getNow: function ()
            {
                var tD = new Date();
                return [tD.getDate(), tD.getMonth() + 1, tD.getFullYear()].join('.') + ' ' + [tD.getHours(), tD.getMinutes(), tD.getSeconds(), tD.getMilliseconds()].join(':');
            },

            //m:=message, t:=topic
            _Log: function (m, t)
            {
                var tF = document.createDocumentFragment();
                var tW = tF.appendChild(document.createElement('div'));

                var tError = tW.appendChild(document.createElement('span'));
                tError.setAttribute('data-type', t || '');
                tError.innerHTML = m;

                var tC = this._getContainer();
                var tI = tC.querySelector('ins');
                tI.appendChild(tF);
            },

            _Minimize: function (e)
            {
                e.className = e.className.replace(/Minimized/g, '').trim() + ' Minimized';
                this._setCache({ Minimized: true });
            },

            _Normalize: function (e)
            {
                e.className = e.className.replace(/Minimized/g, '').trim();
                this._setCache({ Minimized: false });
            },

            //o:={}
            _setCache: function (o)
            {
                try
                {
                    window.localStorage.setItem('Portal.Debug._Trace', JSON.stringify(o || {}));
                }
                catch (err)
                {
                    //
                }
            },

            //err:=error message
            Error: function (err)
            {
                var tF = document.createDocumentFragment();
                var tW = tF.appendChild(document.createElement('div'));

                var tError = tW.appendChild(document.createElement('span'));
                tError.setAttribute('data-type', 'Error');
                tError.innerHTML = err;

                var tC = this._getContainer();
                var tI = tC.querySelector('ins');
                tI.appendChild(tF);
            },

            //m:=message, a:=arguments
            Log: function (m, a)
            {
                try
                {
                    var tF = document.createDocumentFragment();
                    var tW = tF.appendChild(document.createElement('div'));

                    var tTime = tW.appendChild(document.createElement('span'));
                    tTime.setAttribute('data-type', 'Time');
                    tTime.innerHTML = this._getNow(); //new Date().toLocaleString();

                    var tS = Portal.Session || window.top.Portal.Session;
                    if (tS)
                    {
                        var tUser = tW.appendChild(document.createElement('span'));
                        tUser.setAttribute('data-type', 'User');
                        tUser.innerHTML = '(' + tS.Name() + ')';
                    };

                    var tLabel = tW.appendChild(document.createElement('span'));
                    tLabel.setAttribute('data-type', 'Label');
                    tLabel.innerHTML = m;

                    if (a)
                    {
                        var tArguments = tW.appendChild(document.createElement('span'));
                        tArguments.setAttribute('data-type', 'Arguments');
                        tArguments.innerHTML = '(';

                        if (a.length)
                        {
                            var tSeen = [];
                            for (var i = 0, j = a.length; i < j; i++)
                            {
                                tArguments.innerHTML += 'Parameter[' + i + ']: ';
                                //tArguments.innerHTML += (typeof a[i] === 'object') ? '{..}' : JSON.stringify(a[i])

                                tArguments.innerHTML += JSON.stringify(a[i], function (tK, tV)
                                {
                                    if (tV !== null && typeof tV === 'object')
                                    {
                                        if (tSeen.indexOf(tV) !== 0 || tSeen.length > 20)
                                        {
                                            return;
                                        }
                                        tSeen.push(tV);
                                    }
                                    return tV;
                                });
                            }
                        }
                        else
                            tArguments.innerHTML += JSON.stringify(a);

                        tArguments.innerHTML += ')';
                    };

                    var tC = this._getContainer();
                    var tI = tC.querySelector('ins');
                    tI.appendChild(tF);
                }
                catch (err)
                {
                    this.Error(err);
                }

                this.Show();
            },

            Show: function ()
            {
                var tE = this._getContainer();
                var tI = tE.querySelector('ins');
                var tN = tE.querySelector('#Portal_Debug_Trace_Menu');

                tE.style.display = 'block';
                tI.style.maxHeight = '';
                tI.style.maxHeight = (tE.offsetHeight - tN.offsetHeight) + 'px';

                tI.scrollTop = tI.scrollHeight;
            }
        },

        Feedback: {
            //h:=header, m:=message
            Send: function (h, m)
            {
                if (typeof window.top.Confirm != 'undefined' && typeof window.top.Confirm.Feedback == 'function')
                {
                    window.top.Confirm.Feedback(h, m);
                }
                else
                    alert(m);
            }
        },

        _isActive: function ()
        {
            this._Debug = (this._Debug || typeof window.top.Settings !== 'undefined' && typeof window.top.Settings.Debug !== 'undefined') ? window.top.Settings.Debug : false;

            return this._Debug;
        },

        //r:=response, c:=call feedback, w:=container element for Waiting.js (in progress)
        hasError: function (r, c, w)
        {
            if (r != null && typeof r == 'string' && r.indexOf('@@Error: ') == 0)
            {
                if (c || this._isActive())
                    Portal.Debug.Feedback.Send('Fehler', r.substring(9, r.length));

                return true;
            }

            return false;
        },

        //n:=namespace, o:=object to log
        Log: function (n, o)
        {
            if (typeof console === 'object' && typeof console.log !== 'undefined')
            {
                console.log(n, o);
                this.Feedback.Send(n, o);
            }
            else alert(o);
        },

        //n:=namespace, o:=object to log
        Throw: function (n, o)
        {
            this._isActive() && this.Log(n, o);
        },

        //m:=message, a:=arguments
        Trace: function (m, a)
        {
            this._isActive() && this._Trace.Log(m, a);
        }
    };
}(window.Portal = window.Portal || {}));
