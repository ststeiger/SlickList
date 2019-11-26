
using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;


namespace SlickList
{


    public static class AshxMiddlewareExtensions
    {

        public static Microsoft.AspNetCore.Builder.IApplicationBuilder UseAshxMiddleware(
            this Microsoft.AspNetCore.Builder.IApplicationBuilder app)
        {
            // app.UseWhen(context => context.Request.Path.StartsWithSegments("/blob"), appBuilder => { }

            // https://www.devtrends.co.uk/blog/conditional-middleware-based-on-request-in-asp.net-core
            app.UseWhen(
                delegate (Microsoft.AspNetCore.Http.HttpContext context)
                {
                    return context.Request.Path.StartsWithSegments("/ajax/Data.ashx");
                }
                , delegate (Microsoft.AspNetCore.Builder.IApplicationBuilder appBuilder)
                {
                    // appBuilder.UseStatusCodePagesWithReExecute("/apierror/{0}");
                    appBuilder.UseMiddleware<AshxMiddleware>();
                    //appBuilder.UseExceptionHandler("/apierror/500");
                }
            );

            return app;
        } // End Function AshxMiddlewareExtensions 


    } // End Class LayoutMiddlewareExtensions 


    public class AshxMiddleware
    {
        protected readonly Microsoft.AspNetCore.Http.RequestDelegate m_next;
        protected Microsoft.AspNetCore.Hosting.IHostingEnvironment m_env;


        public AshxMiddleware(Microsoft.AspNetCore.Http.RequestDelegate next, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            this.m_next = next;
            this.m_env = env;
        }


        public async System.Threading.Tasks.Task Invoke(Microsoft.AspNetCore.Http.HttpContext context)
        {
            System.Web.IHttpHandler handler = new Data(_COR.Mandant.Global, System.Data.SqlClient.SqlClientFactory.Instance);
            await handler.ProcessRequest(context);
        }

    }


    public class Data
        : System.Web.IHttpHandler
        // : Portal.General.Handler.baseASHX, System.Web.IHttpHandler, System.Web.SessionState.IRequiresSessionState
    {

        protected _COR.Mandant _Mandant;
        protected HttpContext m_context;
        protected System.Data.Common.DbProviderFactory m_factory;


        public Data(_COR.Mandant mandant, System.Data.Common.DbProviderFactory factory)
        {
            this._Mandant = mandant;
            this.m_factory = factory;
        }

        
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }


        protected System.Reflection.Assembly Assembly
        {
            get
            {
                return System.Reflection.Assembly.Load(this.assemblyText);
                // return System.Reflection.Assembly.ReflectionOnlyLoad(this.assemblyText);
            }
        }

        protected string assemblyText
        {
            get
            {
                return typeof(Data).Assembly.FullName;
                
                string tV = this.m_context.Request.Params("Assembly");
                if (this.SQLString.StartsWith("VWS2"))
                    tV = "Portal_Visualiser";

                else if (string.IsNullOrEmpty(tV))
                    tV = "Portal";

                return tV;
            }
        }

        protected string contentType
        {
            get
            {
                string tV = this.m_context.Request.Params("contentType");
                if (!string.IsNullOrWhiteSpace(tV))
                    return tV;

                return "application/json";
            }
        }

        protected string SQLString
        {
            get
            {
                string tV = this.m_context.Request.Params("SQL");
                if (!tV.EndsWith(".sql"))
                    tV += ".sql";

                return tV;
            }
        }

        protected System.Collections.Generic.List<System.Data.Common.DbParameter> SQLParameter
        {
            get
            {
                System.Collections.Generic.Dictionary<string, object> tList =
                    new System.Collections.Generic.Dictionary<string, object>(System.StringComparer.InvariantCultureIgnoreCase);

                System.Collections.Generic.List<System.Data.Common.DbParameter> tSQL = 
                    new System.Collections.Generic.List<System.Data.Common.DbParameter>();

                string[] tPrivate = new[] { "SQL", "BE_ID", "SQLParameter", "Assembly", "assemblyText", "contentType" };
                
                foreach (string key in this.m_context.Request.Query.Keys)
                {

                    if (System.Array.IndexOf(tPrivate, key) < 0)
                    {
                        if (!tList.ContainsKey(key))
                            tList.Add(key, this.m_context.Request.Query[key].ToString());
                    }
                }

                if (this.m_context.Request.HasFormContentType)
                {

                    foreach (string tKey in this.m_context.Request.Form.Keys)
                    {
                        if (!string.IsNullOrEmpty(tKey) && System.Array.IndexOf(tPrivate, tKey) < 0)
                        {
                            if (!tList.ContainsKey(tKey))
                                tList.Add(tKey, System.Web.HttpUtility.UrlDecode(this.m_context.Request.Form[tKey]));
                        }
                    }

                }
                
                // For Each tProperty As PropertyInfo In GetType(Data).GetProperties((BindingFlags.Public Or BindingFlags.Instance))
                // If tList.ContainsKey(tProperty.Name) Then
                // tList(tProperty.Name) = tProperty.GetValue(Me, New Object() {tList(tProperty.Name)})
                // End If
                // Next
                foreach (string tKey in tList.Keys)
                {
                    System.Data.Common.DbParameter tParam = this.m_factory.CreateParameter();
                    {
                        tParam.ParameterName = "@" + tKey;
                        tParam.Value = tList[tKey];
                    }
                    
                    tSQL.Add(tParam);
                }

                return tSQL;
            }
        }

        protected void Log(string pWhy)
        {
            try
            {
                if (this.assemblyText.Equals("Portal_Visualiser"))
                {
                    using (System.Data.IDbCommand tCommand = _COR.SQL.fromFile("VWS.Log.Add.sql", this.Assembly, _COR.Mandant.Global))
                    {
                        _COR.SQL.AddParameter(tCommand, "@Why", pWhy);
                        _COR.SQL.AddParameter(tCommand, "@What", "Data.ashx (" + this.SQLString + ")");
                        _COR.SQL.ExecuteNonQuery(tCommand);
                    }
                }
            }
            catch
            {
            }
        }

        protected byte[] toBinary(string t)
        {
            return System.Convert.FromBase64String(t.Replace(" ", "+"));
        }

        protected object toCrypt(string t)
        {
            if (!string.IsNullOrEmpty(t))
                return _COR.Tools.Encrypting.Crypt(t);
            else
                return System.DBNull.Value;
        }


        // Portal/ajax/Data.ashx
        //public override void ProcessRequest(HttpContext context)
        public async System.Threading.Tasks.Task ProcessRequest(HttpContext context)
        {
            this.m_context = context;

            string tContentType = this.contentType;
            context.Response.ContentType = tContentType;

            
            if ("localhost".Equals( context.Request.Host.Host, System.StringComparison.InvariantCultureIgnoreCase))
                context.Request.Headers["Access-Control-Allow-Origin"] = "*"; // Nur bei localhost
            
            this.Log("Start");

            try
            {
                using (System.Data.IDbCommand tCommand = _COR.SQL.fromFile(this.SQLString, this.Assembly, _COR.Mandant.Global))
                {
                    System.Collections.Generic.List<System.Data.Common.DbParameter> tParameters = this.SQLParameter;
                    if (tParameters != null)
                    {
                        foreach (System.Data.Common.DbParameter tParameter in tParameters)
                        {
                            if (tParameter.ParameterName.StartsWith("@Crypt:"))
                            {
                                tParameter.Value = toCrypt(tParameter.Value.ToString());
                                tParameter.ParameterName = tParameter.ParameterName.Substring("@Crypt:".Length);
                            }
                            else if (tParameter.ParameterName.StartsWith("@Binary:"))
                            {
                                tParameter.Value = toBinary(tParameter.Value.ToString());
                                tParameter.ParameterName = tParameter.ParameterName.Substring("@Binary:".Length);
                                tParameter.DbType = System.Data.DbType.Binary;
                            }

                            _COR.SQL.AddParameter(tCommand, tParameter.ParameterName, tParameter.Value, System.Data.ParameterDirection.Input, tParameter.DbType);
                        }
                        
                        
                    }

                    if (tContentType.Equals("application/json", System.StringComparison.OrdinalIgnoreCase))
                    {
                        using (System.Data.DataSet tS = _COR.SQL.GetDataSet(tCommand))
                        {
                            if (tS.Tables.Count == 1)
                                await context.Response.WriteAsync(_COR.Tools.JSON.JsonHelper.Serialize(tS.Tables[0]));
                            else
                                await context.Response.WriteAsync(_COR.Tools.JSON.JsonHelper.Serialize(tS));
                        }
                    }
                    else
                        await context.Response.WriteAsync(_COR.SQL.ExecuteScalar<string>(tCommand));
                }
            }
            catch (System.Exception tE)
            {
                await context.Response.WriteAsync(_COR.Tools.JSON.JsonHelper.Serialize("@@Error: " + tE.Message));
            }

            this.Log("End");
        }
    }
}
