
namespace SlickList.Code.WorkArounds
{
   
    
    public sealed class HttpServerUtility
    {


        private static class Legacy
        {
            public static string UrlTokenEncode(byte[] input)
            {
                if (input == null)
                    throw new System.ArgumentNullException("input");

                if (input.Length < 1)
                    return string.Empty;

                char[] base64Chars = null;

                ////////////////////////////////////////////////////////
                // Step 1: Do a Base64 encoding
                string base64Str = System.Convert.ToBase64String(input);
                if (base64Str == null)
                    return null;

                int endPos;
                ////////////////////////////////////////////////////////
                // Step 2: Find how many padding chars are present in the end
                for (endPos = base64Str.Length; endPos > 0; endPos--)
                {
                    if (base64Str[endPos - 1] != '=') // Found a non-padding char!
                    {
                        break; // Stop here
                    }
                }

                ////////////////////////////////////////////////////////
                // Step 3: Create char array to store all non-padding chars,
                //      plus a char to indicate how many padding chars are needed
                base64Chars = new char[endPos + 1];
                base64Chars[endPos] = (char)((int)'0' + base64Str.Length - endPos); // Store a char at the end, to indicate how many padding chars are needed

                ////////////////////////////////////////////////////////
                // Step 3: Copy in the other chars. Transform the "+" to "-", and "/" to "_"
                for (int iter = 0; iter < endPos; iter++)
                {
                    char c = base64Str[iter];

                    switch (c)
                    {
                        case '+':
                            base64Chars[iter] = '-';
                            break;

                        case '/':
                            base64Chars[iter] = '_';
                            break;

                        case '=':
                            System.Diagnostics.Debug.Assert(false);
                            base64Chars[iter] = c;
                            break;

                        default:
                            base64Chars[iter] = c;
                            break;
                    }
                }
                return new string(base64Chars);
            }

            public static byte[] UrlTokenDecode(string input)
            {
                if (input == null)
                    throw new System.ArgumentNullException("input");

                int len = input.Length;
                if (len < 1)
                    return new byte[0];

                ///////////////////////////////////////////////////////////////////
                // Step 1: Calculate the number of padding chars to append to this string.
                //         The number of padding chars to append is stored in the last char of the string.
                int numPadChars = (int)input[len - 1] - (int)'0';
                if (numPadChars < 0 || numPadChars > 10)
                    return null;


                ///////////////////////////////////////////////////////////////////
                // Step 2: Create array to store the chars (not including the last char)
                //          and the padding chars
                char[] base64Chars = new char[len - 1 + numPadChars];


                ////////////////////////////////////////////////////////
                // Step 3: Copy in the chars. Transform the "-" to "+", and "*" to "/"
                for (int iter = 0; iter < len - 1; iter++)
                {
                    char c = input[iter];

                    switch (c)
                    {
                        case '-':
                            base64Chars[iter] = '+';
                            break;

                        case '_':
                            base64Chars[iter] = '/';
                            break;

                        default:
                            base64Chars[iter] = c;
                            break;
                    }
                }

                ////////////////////////////////////////////////////////
                // Step 4: Add padding chars
                for (int iter = len - 1; iter < base64Chars.Length; iter++)
                {
                    base64Chars[iter] = '=';
                }

                // Do the actual conversion
                return System.Convert.FromBase64CharArray(base64Chars, 0, base64Chars.Length);
            }

        }


        // 
        // Zusammenfassung:
        // Ruft den Timeoutwert der Anforderung (in Sekunden) ab und legt diesen fest.
        // 
        // Rückgabewerte:
        // Die Timeoutwert-Einstellung für Anforderungen.
        // 
        // Ausnahmen:
        // T:System.Web.HttpException:
        // Der aktuelle System.Web.HttpContext ist null.
        // 
        // T:System.ArgumentOutOfRangeException:
        // Die Timeoutspanne ist null oder konnte nicht festgelegt werden.
        public int ScriptTimeout { get; set; }
        

        // Ruft den Computernamen des Servers ab.
        public string MachineName
        {
            get
            {
                // Request.ServerVariables["SERVER_NAME"]
                return System.Environment.MachineName;
            }
        }



        public string MapPath(string path)
        {
            return "";
        }



        // Decodiert ein URL-Zeichenfolgentoken in sein entsprechendes Bytearray mit Base-64-Ziffern.
        // Rückgabewerte:
        // Das Bytearray, das das decodierte URL-Zeichenfolgentoken enthält.
        public static byte[] UrlTokenDecode(string input)
        {
            return Legacy.UrlTokenDecode(input);
        }

        // 

        // Codiert ein Bytearray in seine äquivalente Zeichenfolgendarstellung mit Base-64-Ziffern,
        // die für die Übertragung in der URL geeignet ist.
        // input: Das zu codierende Bytearray.
        // Rückgabewerte:
        // Die Zeichenfolge, die das codierte Token enthält, wenn die Länge des Bytearrays
        // größer als eins ist, andernfalls eine leere Zeichenfolge ("").
        public static string UrlTokenEncode(byte[] input)
        {
            return Legacy.UrlTokenEncode(input);
        }



        public string UrlPathEncode(string s)
        {
            return System.Web.HttpUtility.UrlPathEncode(s);
        }


        public void UrlEncode(string s, System.IO.TextWriter output)
        {
            output.Write(System.Web.HttpUtility.UrlEncode(s));
        }

     
        public string UrlEncode(string s)
        {
            return System.Web.HttpUtility.UrlEncode(s);
        }

        public string UrlDecode(string s)
        {
            return System.Web.HttpUtility.UrlDecode(s);
        }



        public void UrlDecode(string s, System.IO.TextWriter output)
        {
            output.Write(System.Web.HttpUtility.UrlDecode(s));
        }

        public string HtmlEncode(string s)
        {
            return System.Web.HttpUtility.HtmlEncode(s);
        }

        public void HtmlEncode(string s, System.IO.TextWriter output)
        {
            output.Write(System.Web.HttpUtility.HtmlEncode(s));
        }


        public string HtmlDecode(string s)
        {
            return System.Web.HttpUtility.HtmlDecode(s);
        }


        public void HtmlDecode(string s, System.IO.TextWriter output)
        {
            output.Write(System.Web.HttpUtility.HtmlDecode(s));
        }





        // 
        // Zusammenfassung:
        // Führt die angegebene URL mit der angegebenen HTTP-Methode und den angegebenen
        // HTTP-Headern asynchron aus.
        // 
        // Parameter:
        // path:
        // Der URL-Pfad für die neue auszuführende Seite auf dem Server.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // method:
        // Die HTTP-Methode, die für die Ausführung der neuen Anforderung verwendet werden
        // soll.
        // 
        // headers:
        // Eine System.Collections.Specialized.NameValueCollection von Anforderungsheadern
        // für die neue Anforderung.
        // 
        // Ausnahmen:
        // T:System.PlatformNotSupportedException:
        // Die Anforderung erfordert, dass IIS 7.0 im integrierten Modus ausgeführt wird.
        // 
        // T:System.Web.HttpException:
        // Der Server ist nicht verfügbar, um die Anforderung zu behandeln.
        // 
        // T:System.ArgumentNullException:
        // Der path-Parameter ist null.
        public void TransferRequest(string path, bool preserveForm, string method, System.Collections.Specialized.NameValueCollection headers)
        {
        }

        // 
        // Zusammenfassung:
        // Führt die angegebene URL asynchron aus und behält die Parameter der Abfragezeichenfolge
        // bei.
        // 
        // Parameter:
        // path:
        // Der URL-Pfad für die neue auszuführende Seite auf dem Server.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // Ausnahmen:
        // T:System.PlatformNotSupportedException:
        // Die Anforderung erfordert den integrierten Pipelinemodus von IIS 7.0.
        // 
        // T:System.Web.HttpException:
        // Der Server ist nicht verfügbar, um die Anforderung zu behandeln.
        // 
        // T:System.ArgumentNullException:
        // Der path-Parameter ist null.
        [System.Runtime.TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void TransferRequest(string path, bool preserveForm)
        {
        }

        // 
        // Zusammenfassung:
        // Beendet die Ausführung der aktuellen Seite und beginnt die Ausführung einer neuen
        // Anforderung mithilfe eines benutzerdefinierten HTTP-Handlers, der die System.Web.IHttpHandler-Schnittstelle
        // implementiert und angibt, ob die System.Web.HttpRequest.QueryString-Auflistung
        // und die System.Web.HttpRequest.Form-Auflistung gelöscht werden sollen.
        // 
        // Parameter:
        // handler:
        // Der HTTP-Handler, der den System.Web.IHttpHandler implementiert, an den die aktuelle
        // Anforderung übertragen werden soll.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // Ausnahmen:
        // T:System.ApplicationException:
        // Die aktuelle Seitenanforderung ist ein Rückruf.
        public void Transfer(System.Web.IHttpHandler handler, bool preserveForm)
        {
        }

        // 
        // Zusammenfassung:
        // Beendet für die aktuelle Anforderung die Ausführung der aktuellen Seite und startet
        // die Ausführung einer neuen Seite unter Verwendung des angegebenen URL-Pfads für
        // die Seite.
        // 
        // Parameter:
        // path:
        // Der URL-Pfad für die neue auszuführende Seite auf dem Server.
        public void Transfer(string path)
        {
        }

        // 
        // Zusammenfassung:
        // Beendet die Ausführung der aktuellen Seite und startet die Ausführung einer neuen
        // Seite unter Verwendung des angegebenen URL-Pfads für die Seite.Gibt an, ob die
        // System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // gelöscht werden soll.
        // 
        // Parameter:
        // path:
        // Der URL-Pfad für die neue auszuführende Seite auf dem Server.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // Ausnahmen:
        // T:System.ApplicationException:
        // Die aktuelle Seitenanforderung ist ein Rückruf.
        public void Transfer(string path, bool preserveForm)
        {
        }

        // 
        // Zusammenfassung:
        // Führt die angegebene URL asynchron aus.
        // 
        // Parameter:
        // path:
        // Der URL-Pfad für die neue auszuführende Seite auf dem Server.
        // 
        // Ausnahmen:
        // T:System.PlatformNotSupportedException:
        // Die Anforderung erfordert den integrierten Pipelinemodus von IIS 7.0.
        // 
        // T:System.Web.HttpException:
        // Der Server ist nicht verfügbar, um die Anforderung zu behandeln.
        // 
        // T:System.ArgumentNullException:
        // Der path-Parameter ist null.
        [System.Runtime.TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void TransferRequest(string path)
        {
        }

        // 
        // Zusammenfassung:
        // Führt den Handler für den angegebenen virtuellen Pfad im Kontext der aktuellen
        // Anforderung aus.Ein System.IO.TextWriter zeichnet die Ausgabe der Seite auf,
        // und ein boolescher Parameter gibt an, ob die System.Web.HttpRequest.QueryString-Auflistung
        // und die System.Web.HttpRequest.Form-Auflistung gelöscht werden sollen.
        // 
        // Parameter:
        // path:
        // Der auszuführende URL-Pfad.
        // 
        // writer:
        // Der zum Aufzeichnen der Ausgabe zu verwendende System.IO.TextWriter.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // Ausnahmen:
        // T:System.Web.HttpException:
        // Der aktuelle System.Web.HttpContext ist ein NULL-Verweis (Nothing in Visual Basic).
        // - oder -path endet mit dem Punkt (.).- oder -Fehler beim Ausführen des von path
        // angegebenen Handlers.
        // 
        // T:System.ArgumentNullException:
        // path ist null.
        // 
        // T:System.ArgumentException:
        // path ist kein virtueller Pfad.
        public void Execute(string path, System.IO.TextWriter writer, bool preserveForm)
        {
        }

        // 
        // Zusammenfassung:
        // Führt den Handler für den angegebenen virtuellen Pfad im Kontext der aktuellen
        // Anforderung aus und gibt an, ob die System.Web.HttpRequest.QueryString-Auflistung
        // und die System.Web.HttpRequest.Form-Auflistung gelöscht werden sollen.
        // 
        // Parameter:
        // path:
        // Der auszuführende URL-Pfad.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // Ausnahmen:
        // T:System.Web.HttpException:
        // Der aktuelle System.Web.HttpContext ist null.- oder -Fehler beim Ausführen des
        // von path angegebenen Handlers.
        // 
        // T:System.ArgumentNullException:
        // path ist null. - oder -path ist kein virtueller Pfad.
        [System.Runtime.TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void Execute(string path, bool preserveForm)
        {
        }

        // 
        // Zusammenfassung:
        // Führt den Handler für den angegebenen virtuellen Pfad im Kontext der aktuellen
        // Anforderung aus.Ein System.IO.TextWriter zeichnet die Ausgabe des ausgeführten
        // Handlers auf.
        // 
        // Parameter:
        // path:
        // Der auszuführende URL-Pfad.
        // 
        // writer:
        // Der zum Aufzeichnen der Ausgabe zu verwendende System.IO.TextWriter.
        // 
        // Ausnahmen:
        // T:System.Web.HttpException:
        // Der aktuelle System.Web.HttpContext ist null. - oder -Fehler beim Ausführen des
        // von path angegebenen Handlers.
        // 
        // T:System.ArgumentNullException:
        // path ist null. - oder -path ist kein virtueller Pfad.
        [System.Runtime.TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void Execute(string path, System.IO.TextWriter writer)
        {
        }

        // 
        // Zusammenfassung:
        // Führt den Handler für den angegebenen virtuellen Pfad im Kontext der aktuellen
        // Anforderung aus.
        // 
        // Parameter:
        // path:
        // Der auszuführende URL-Pfad.
        // 
        // Ausnahmen:
        // T:System.Web.HttpException:
        // Der aktuelle System.Web.HttpContext ist null.- oder -Fehler beim Ausführen des
        // von path angegebenen Handlers.
        // 
        // T:System.ArgumentNullException:
        // path ist null. - oder -path ist kein virtueller Pfad.
        [System.Runtime.TargetedPatchingOptOut("Performance critical to inline this type of method across NGen image boundaries")]
        public void Execute(string path)
        {
        }

        // 
        // Zusammenfassung:
        // Löscht die vorhergehende Ausnahme.
        public void ClearError()
        {
        }

        // 
        // Zusammenfassung:
        // Führt den Handler für den angegebenen virtuellen Pfad im Kontext der aktuellen
        // Anforderung aus.Ein System.IO.TextWriter zeichnet die Ausgabe des ausgeführten
        // Handlers auf, und ein boolescher Parameter gibt an, ob die System.Web.HttpRequest.QueryString-Auflistung
        // und die System.Web.HttpRequest.Form-Auflistung gelöscht werden sollen.
        // 
        // Parameter:
        // handler:
        // Der HTTP-Handler, der den System.Web.IHttpHandler implementiert, an den die aktuelle
        // Anforderung übertragen werden soll.
        // 
        // writer:
        // Der zum Aufzeichnen der Ausgabe zu verwendende System.IO.TextWriter.
        // 
        // preserveForm:
        // true, um die System.Web.HttpRequest.QueryString-Auflistung und die System.Web.HttpRequest.Form-Auflistung
        // beizubehalten, false, um die System.Web.HttpRequest.QueryString-Auflistung und
        // die System.Web.HttpRequest.Form-Auflistung zu löschen.
        // 
        // Ausnahmen:
        // T:System.Web.HttpException:
        // Fehler beim Ausführen des von handler angegebenen Handlers.
        // 
        // T:System.ArgumentNullException:
        // Der handler-Parameter ist null.
        public void Execute(System.Web.IHttpHandler handler, System.IO.TextWriter writer, bool preserveForm)
        {
        }

        // 
        // Zusammenfassung:
        // Erstellt eine Serverinstanz eines COM-Objekts, das durch den Objekttyp identifiziert wird.
        public object CreateObject(System.Type type)
        {
            return System.Activator.CreateInstance(type);
        }


        // Erstellt eine Serverinstanz eines COM-Objekts, das durch den Programmbezeichner
        // (ProgID) des Objekts gekennzeichnet ist.
        public object CreateObject(string progID)
        {
            return CreateObject(System.Type.GetTypeFromProgID(progID));
        }


        // Erstellt eine Serverinstanz eines COM-Objekts, das durch die Klassen-ID (Class
        // Identifier, CLSID) des Objekts gekennzeichnet ist.
        public object CreateObjectFromClsid(string clsid)
        {
            return CreateObject(System.Type.GetTypeFromCLSID(System.Guid.Parse(clsid)));
        }


        public System.Exception GetLastError()
        {
            return null;
        }


    }


}
