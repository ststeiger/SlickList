; (function (ns)
{
    'use strict';

    ns.Element = {
        _NS: 'http://www.w3.org/2000/svg',

        //e:=<element>, k:=key
        addClass: function (e, k)
        {
            if (e && k)
            {
                var tK = k.trim();
                for (var tC = !1, tL = e.className.split(' '), i = 0, j = tL.length; i < j; i++)
                {
                    if (tL[i].trim() === tK)
                    {
                        tC = !0;
                        break;
                    }
                }

                if (!tC) e.className = (e.className + ' ' + k.trim()).trim();
            }

            return e;
        },

        //e:=<element>, s:={styles}, p:preserve
        addStyles: function (e, s, p)
        {
            if (e && s)
            {
                if (!p) e.style.cssText = '';
                for (var k in s) e.style[k] = s[k];
            }

            return e;
        },

        //e:=<element>
        Clear: function (e)
        {
            if (e)
            {
                while (e.firstChild)
                    e.removeChild(e.firstChild);
            }

            return e;
        },

        //t:=tagname, a:=attributes, c:=container, d:=document
        Create: function (t, a, c, d)
        {
            var tE = this.Sets((d || document).createElement(t), a);
            return c ? c.appendChild(tE) : tE;
        },

        //n:=namespace, t:=tagname, a:=attributes, c:=container, d:=document
        createNS: function (n, t, a, c, d)
        {
            var tE = (d || document).createElementNS(n || this._NS, t);
            for (var k in (a || {})) this.Set(tE, k, a[k], n);

            return c ? c.appendChild(tE) : tE;
        },

        //e:=<element>
        Empty: function (e)
        {
            if (e)
            {
                e.innerHTML = '';
            }

            return e;
        },

        //e:=<element>, k:=key, n:=namespace
        Get: function (e, k, n)
        {
            return (e && k) ? ((typeof e[k] !== 'undefined') ? e[k] : e.getAttributeNS(n || '', k)) : null;
        },

        //e:=<element>
        Hide: function (e)
        {
            if (e && e.style.display !== 'none')
            {
                e.style.display = 'none';
            }

            return e;
        },

        //e:=<element>
        Remove: function (e)
        {
            try
            {
                return (e && e.parentNode) ? e.parentNode.removeChild(e) : e;
            }
            catch (err) { return e; }
        },

        //e:=<element>, k:=key
        removeClass: function (e, k)
        {
            if (e && k)
            {
                var tK = k.trim();
                for (var tA = [], tL = e.className.split(' '), i = 0, j = tL.length; i < j; i++)
                {
                    if (tL[i].trim() !== tK)
                    {
                        tA.push(tL[i].trim());
                    }
                }

                e.className = tA.join(' ');
            }

            return e;
        },

        //e:=<element>, k:=key, v:=value, n:=namespace
        Set: function (e, k, v, n)
        {
            if (e && k)
            {
                var tV = (v === null || v === undefined) ? '' : v;
                (typeof e[k] !== 'undefined' && typeof e[k] !== 'object') ? e[k] = tV : e.setAttributeNS(n || '', k, tV);
            }

            return e;
        },

        //e:=<element>, a:=attributes
        Sets: function (e, a)
        {
            if (e && a)
            {
                for (var k in (a || {})) this.Set(e, k, a[k]);
            }

            return e;
        },

        //e:=<element>, s:=style || block
        Show: function (e, s)
        {
            var tS = s || 'block';
            if (e && e.style.display !== tS)
            {
                e.style.display = tS;
            }

            return e;
        }
    };
}(window._ = window._ || {}));