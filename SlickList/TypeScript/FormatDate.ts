/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

namespace Basic.Waiting
{
    
    interface IWaiting
    {
        Start:()=>void;
        Stop:()=>void;
        StartAndStop:()=>void;
    }


    interface IPortal
    {
        Waiting:IWaiting;
    }

    declare let Portal:IPortal;
    
    export function Start()
    {
        Portal.Waiting.Start();
    }

    export function Stop()
    {
        Portal.Waiting.Stop();
    }

    export function StartAndStop()
    {
        Portal.Waiting.StartAndStop();



        // var a = new Date(Date.UTC(2019, 11,21, 0,0,0,0));
        // var a = new Date(Date.UTC(2019, 11,21, 23,30,0,0));
        var a = new Date(2019, 11,15, 0,0,0,0);
        
        
        
        // Sunday is 0, Monday is 1, and so on.
        // var a = new Date(Date.UTC(2019, 11,15, 0,0,0,0)); 0 ==> // a.getUTCDay()
        // var a = new Date(Date.UTC(2019, 11,15, 0,0,0,0)); 0 ==> // a.getUTCDay()

        // var a = new Date(Date.UTC(2019, 0,1, 0,0,0,0)); a.getUTCMonth()

// new Date().getTimezoneOffset()
        
        let options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
        let value = a.toLocaleDateString("de-CH", options);
    }
    
    
}


namespace $.datepicker
{

    let x = 123444577;
    // http://blog.stevenlevithan.com/archives/date-time-format
    // http://stevenlevithan.com/assets/misc/date.format.js
    
    // let months:string[] = [];
    // let weekdays:string[] = [];
    // let days:string[] = [];


    // Internationalization strings
    let getLocale = (function(){
        let static_locales = {} ;


        function getMonthName(locale:string, month, short?:boolean)
        {
            month = Number(month);//0-6
            let day = new Date(2019, month,1, 0,0,0,0);

            if(short)
                return day.toLocaleDateString(locale, { month: 'short'});

            return day.toLocaleDateString(locale, { month: 'long'});
        }


        function getWeekDayName(locale:string, weekday, short?:boolean)
        {
            weekday = Number(weekday);//0-6
            let day = new Date(2019, 10,17+weekday, 0,0,0,0);

            if(short)
                return day.toLocaleDateString(locale, { weekday: 'short'});

            return day.toLocaleDateString(locale, { weekday: 'long'});
        }
        
        
        return function(loc){
            if(static_locales[loc])
                return static_locales[loc];

            let days = [];
            let months = [];
            
            for(let i =0; i < 7; ++i)
            {
                days.push(getWeekDayName(loc, i, true));
            }

            for(let i =0; i < 7; ++i)
            {
                days.push(getWeekDayName(loc, i));
            }
            
            for(let i =0; i < 12; ++i)
            {
                months.push(getMonthName(loc, i, true));
            }
            
            for(let i =0; i < 12; ++i)
            {
                months.push(getMonthName(loc, i));
            }
            
            static_locales[loc] = {
                dayNames:  days /*[
                    "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa",
                    "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"
                ]*/,
                monthNames: months/*[
                    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
                    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"
                ]*/,
                ordinal_suffix_of: function (i: number)
                { return ".";}
            };
            
            return static_locales[loc];
        }
    })() ;

    
    // Some common format strings
    let masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };


    function pad(val: any, len?: number)
    {
        val = String(val);
        len = len || 2;
        
        while (val.length < len)
            val = "0" + val;
        
        return val;
    }
    
    
    let token = /d{1,4}|M{1,4}|yy(?:yy)?|f{1,3}|([HhmsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g;
    
    
    // Regexes and supporting functions are cached through closure
    function dateFormat(date, mask, utc)
    {
        let i18n = getLocale("de");
        
        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date))
        {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;

        if (isNaN(date))
            throw SyntaxError("invalid date");

        mask = String(masks[mask] || mask || masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:")
        {
            mask = mask.slice(4);
            utc = true;
        }

        
        
        
        let _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            M = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            m = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: i18n.dayNames[D],
                dddd: i18n.dayNames[D + 7],
                M: M + 1,
                MM: pad(M + 1),
                MMM: i18n.monthNames[M],
                MMMM: i18n.monthNames[M + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                m: m,
                mm: pad(m),
                s: s,
                ss: pad(s),
                f: Math.floor(L / 100),
                ff: pad(Math.floor( L/10), 2),
                fff: pad( L, 3),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: i18n.ordinal_suffix_of(d) // ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };
        
        let result = mask.replace(token, function ($0)
        {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
        
        return result.split("\b").join("'");
    }
    
    
    export function formatDate(format, date)
    {
        return dateFormat(date, format, false);
    }
    
    
}


/*
// For convenience...
Date.prototype.format = function (mask, utc) 
{
    return dateFormat(this, mask, utc);
};
*/
