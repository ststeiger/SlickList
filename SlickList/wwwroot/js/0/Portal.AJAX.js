; (function (ns)
{
    'use strict';

    (typeof window.XMLHttpRequest.DONE === 'undefined') && (window.XMLHttpRequest.DONE = 4);

    function _getRootLink()
    {
        var tLink = '';

        if (window.top.Settings && window.top.Settings.rootLink)
        {
            tLink = window.top.Settings.rootLink;
        }
        else if (typeof mGlobalRootPath !== 'undefined')
        {
            tLink = mGlobalRootPath;
        }

        return tLink;
    }

    function _getBE()
    {
        var tB = null;

        if (_.QueryString && typeof _.QueryString.Read === 'function')
        {
            tB = _.QueryString.Read('BE_ID') || _.QueryString.Read('BE_Hash');
        }

        if (window.top.Portal && window.top.Portal.Session)
        {
            tB = window.top.Portal.Session.ID();
        }

        return tB;
    };

    ns.AJAX = {
        _Log: function (o, f)
        {
            (typeof Portal.Debug === 'object') ? Portal.Debug.Throw('AJAX', f + ': ' + o) : (typeof console === 'object' && typeof console.log !== 'undefined') && console.log('AJAX', f + ': ' + o);
        },

        //s:='sql', p:={params} or 'param'
        _getLink: function (s, p)
        {
            var tP = typeof p === 'string' ? p : function fP(p)
            {
                var tA = [];

                if (p)
                {
                    for (var k in p)
                    {
                        tA.push(k + '=' + encodeURIComponent((typeof p[k] === 'undefined' || p[k] === null) ? '' : p[k]));
                        //tA.push(k + '=' + encodeURIComponent(p[k] || ''));
                    }
                }

                return tA.join('&');
            }(p);

            var tL = _getRootLink() + 'ajax/Data.ashx?Time=@Time.&SQL=@SQL.&BE_Hash=@BE_Hash.'
                .replace('@SQL.', s)
                .replace('@Time.', new Date().getTime())
                .replace('@BE_Hash.', _getBE());

            tL += !!tP ? '&' + tP : '';

            return tL;
        },

        //s:='sql', p:={params} or 'param'
        _postLink: function (s, p)
        {
            var tP = typeof p === 'string' ? p : function fP(p)
            {
                var tA = [];
                for (var k in p)
                {
                    tA.push(k + '=' + encodeURIComponent((typeof p[k] === 'undefined' || p[k] === null) ? '' : p[k]));
                    //tA.push(k + '=' + encodeURIComponent(p[k] || ''));
                }

                return tA.join('&');
            }(p);

            var tL = _getRootLink() + 'ajax/Data.ashx?Time=@Time.&SQL=@SQL.&BE_Hash=@BE_Hash.'
                .replace('@SQL.', s)
                .replace('@Time.', new Date().getTime())
                .replace('@BE_Hash.', _getBE());

            return { link: tL, parameters: tP };
        },

        getXmlDoc: function () { return ((window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')); },

        //u:=url, f:=callback, c:=any param to pass to callback
        Get: function (u, f, c)
        {
            var tDoc = this.getXmlDoc();

            tDoc.open('GET', u, true);
            tDoc.onreadystatechange = function ()
            {
                (tDoc.readyState === XMLHttpRequest.DONE && tDoc.status === 200) && f(tDoc, c);
            };

            tDoc.send();
        },

        //s:='sql', p:={params} or 'param', f:=callback(), c:=any param to pass to callback
        getData: function (s, p, f, c)
        {
            this.getEval(this._getLink(s, p), f, c);
        },

        //u:=url, f:=callback, c:=any param to pass to callback
        getEval: function (u, f, c)
        {
            this.Get(u, function (r, c)
            {
                try
                {
                    (typeof f === 'function') && f(JSON.parse(r.response || r.responseText), c);
                }
                catch (err)
                {
                    (typeof console !== 'undefined') && console.log('Portal.AJAX.getEval(r)', r);
                    Portal.AJAX._Log(err, 'getEval');
                }
            }, c);
        },

        //u:=url, d:=posted data, f:=callback, c:=any param to pass to callback, ct:=content-type, rt:=response-type
        Post: function (u, d, f, c, ct, rt)
        {
            var tDoc = this.getXmlDoc();
            var tD = (typeof d === 'object') ? JSON.stringify(d) : d;

            tDoc.open('POST', u, true);
            tDoc.setRequestHeader('Content-type', ct || 'application/x-www-form-urlencoded');
            tDoc.responseType = rt || '';

            tDoc.onreadystatechange = function ()
            {
                (tDoc.readyState === XMLHttpRequest.DONE && tDoc.status === 200) && f(tDoc, c);
            };

            tDoc.send(tD);
        },

        //s:='sql', p:={params} or 'param', f:=callback(), c:=any param to pass to callback
        postData: function (s, p, f, c)
        {
            var tL = this._postLink(s, p);
            this.postEval(tL.link, tL.parameters, f, c);
        },

        //u:=url, d:=posted data, f:=callback, c:=any param to pass to callback, t:=content-type
        postEval: function (u, d, f, c, t)
        {
            this.Post(u, d, function (r, c)
            {
                try
                {
                    (typeof f === 'function') && f(JSON.parse(r.response || r.responseText), c);
                }
                catch (err)
                {
                    (typeof console !== 'undefined') && console.log('Portal.AJAX.postEval(r)', r);
                    Portal.AJAX._Log(err, 'postEval');
                }
            }, c, t);
        }
    };
}(window.Portal = window.Portal || {}));
