
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Extensions;


namespace SlickList
{
    
    
    public class SlickListMiddleware
        : _COR.Handler.Slicklist
    {

        protected readonly Microsoft.AspNetCore.Http.RequestDelegate _next;
        

        public SlickListMiddleware(Microsoft.AspNetCore.Http.RequestDelegate next)
            :base(_COR.Mandant.Global, System.Data.SqlClient.SqlClientFactory.Instance)
        {
            this._next = next;
        } // End Constructor 




        public override int BE_ID
        {
            get { return 12435; }
        }


        public override System.Data.IDbCommand getDataCommand(string sql)
        {

            using (System.Data.IDbCommand tCommand = _COR.SQL.fromFile("../../test/slicklist", typeof(SlickListMiddleware).Assembly, _COR.Mandant.Global))
            {
                _COR.SQL.AddParameter(tCommand, "BE_ID", this.BE_ID);
                return tCommand;
            }

        }


        public async System.Threading.Tasks.Task Invoke(Microsoft.AspNetCore.Http.HttpContext context)
        {   
            string sl_uid = context.Request.Query["SL_UID"];
            
            string du = context.Request.GetDisplayUrl(); // for human display ony, not suitable for network operations
            string eu = context.Request.GetEncodedUrl(); // for network
            string url = context.Request.GetRawUrl();
            string virtualDirectory = context.Request.PathBase.Value;
            string canonicalUrl = context.Request.GetCanonicalUrl();
            string domain = context.Request.GetDomain();

            System.Console.Write(url, du, eu, virtualDirectory, canonicalUrl, domain);

            await base.ProcessRequest(context);
        }
        
    } // End Class SlickListMiddleware



    // https://github.com/aspnet/HttpAbstractions/blob/master/src/Microsoft.AspNetCore.Http.Extensions/UriHelper.cs
    public static class HttpRequestExtensions
    {


        public static string GetDomain(this HttpRequest request)
        {
            string url = request.Scheme + "://" + request.Host.Value;
            return url;
        }



        public static string GetCanonicalUrl(this HttpRequest request)
        {
            string url = request.Scheme + "://" + request.Host.Value + request.PathBase.Value;
            return url;
        }


        public static string GetRawUrl(this HttpRequest request)
        {
            var httpContext = request.HttpContext;

            var requestFeature = httpContext.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpRequestFeature>();
            string raw = requestFeature.RawTarget;

            string url = request.Scheme + "://" + request.Host.Value + raw;

            // return new System.Uri(url, System.UriKind.RelativeOrAbsolute);
            return url;
        }
    }

    public class JsonHandler
    {
        /*
        public static void Serialize(object target, bool prettyPrint, System.IO.TextWriter pOutput, string callback)
        {
            Newtonsoft.Json.JsonSerializer ser = new Newtonsoft.Json.JsonSerializer();

            ser.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.MicrosoftDateFormat;
            ser.Formatting = prettyPrint ? Newtonsoft.Json.Formatting.Indented : Newtonsoft.Json.Formatting.None;
            ser.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;


            if (string.IsNullOrEmpty(callback))
            {
                ser.Serialize(pOutput, target);
                return;
            }

            // typeof foobar != 'undefined' ? foobar(bla) : alert('Callback-Funktion "foobar" undefiniert...'); 
            pOutput.Write("typeof ");
            pOutput.Write(callback);
            pOutput.Write(" != 'undefined' ? ");
            pOutput.Write(callback);
            pOutput.Write("(");
            ser.Serialize(pOutput, target);
            pOutput.Write(")");
            pOutput.Write(" : alert('Callback-Funktion \"");
            pOutput.Write(callback);
            pOutput.Write("\" undefiniert...');");
        }

        
        public static string Serialize(object target, bool prettyPrint, string callback)
        {
            string strResult = null;

            Newtonsoft.Json.JsonSerializerSettings settings = new Newtonsoft.Json.JsonSerializerSettings();
            settings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;

            if (prettyPrint){
                settings.Formatting = Newtonsoft.Json.Formatting.Indented;
            }
            else{
                settings.Formatting = Newtonsoft.Json.Formatting.None;
            }

            settings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.MicrosoftDateFormat;

            if (string.IsNullOrEmpty(callback))
            {
                strResult = Newtonsoft.Json.JsonConvert.SerializeObject(target, settings);
                settings = null;
                return strResult;
            }
            

            //  JSONP
            //  https://github.com/visionmedia/express/pull/1374
            // strResult = strCallback + " && " + strCallback + "(" + Newtonsoft.Json.JsonConvert.SerializeObject(target, settings) + "); " + System.Environment.NewLine
            // typeof bla1 != "undefined" ? alert(bla1(3)) : alert("foo undefined");
            strResult = ("typeof "
                         + (callback + (" != \'undefined\' ? "
                                        + (callback + ("("
                                                       + (Newtonsoft.Json.JsonConvert.SerializeObject(target, settings) + (") : alert(\'Callback-Funktion \""
                                                                                                                           + (callback + ("\" undefiniert...\'); " + System.Environment.NewLine)))))))));

            settings = null;
            return strResult;
        }
        */
    }


    public static class SlickListMiddlewareExtensions
    {

        public static Microsoft.AspNetCore.Builder.IApplicationBuilder UseSlickListMiddleware(
            this Microsoft.AspNetCore.Builder.IApplicationBuilder app)
        {
            // return app.UseMiddleware<SqlMiddleware>();

            // app.UseWhen(context => context.Request.Path.StartsWithSegments("/blob"), appBuilder => { }

            // https://www.devtrends.co.uk/blog/conditional-middleware-based-on-request-in-asp.net-core
            app.UseWhen(
                delegate(Microsoft.AspNetCore.Http.HttpContext context) 
                {
                    return context.Request.Path.StartsWithSegments("/Slicklist.ashx");
                }
                , delegate(Microsoft.AspNetCore.Builder.IApplicationBuilder appBuilder )
                {
                    // appBuilder.UseStatusCodePagesWithReExecute("/apierror/{0}");
                    appBuilder.UseMiddleware<SlickListMiddleware>();
                    //appBuilder.UseExceptionHandler("/apierror/500");
                }
            );

            return app;
        } // End Function UseSlickListMiddleware 


    } // End Class SlickListMiddlewareExtensions 
    
    
}
