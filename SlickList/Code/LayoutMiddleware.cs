
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;


namespace SlickList
{
    
    
    public class LayoutMiddleware
    {
        protected readonly Microsoft.AspNetCore.Http.RequestDelegate m_next;
        protected Microsoft.AspNetCore.Hosting.IHostingEnvironment m_env;


        public LayoutMiddleware(Microsoft.AspNetCore.Http.RequestDelegate next, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            this.m_next = next;
            this.m_env = env;
        }


        public async System.Threading.Tasks.Task Invoke(Microsoft.AspNetCore.Http.HttpContext context)
        {
            string file = context.Request.Query["Single"];
            
            try
            {
                string ext = System.IO.Path.GetExtension(file);
                bool isJs = ".js".Equals(ext, System.StringComparison.InvariantCultureIgnoreCase);
                string contentType = isJs ? "application/javascript; charset=utf-8" : "text/css; charset=utf-8";

                if (string.IsNullOrEmpty(file))
                {
                    context.Response.StatusCode = 422;
                    context.Response.ContentType = "text/plain";
                    
                    await context.Response.WriteAsync("Missing parameter 'file'.");
                    return;
                }
                
                int ind = file.IndexOf(":");
                if (ind != -1)
                {
                    string proj = file.Substring(0, ind);
                    file = file.Substring(ind + 1);

                    string fileContent = _COR.Tools.Resourceloader.readSingleFile(file);
                    await context.Response.WriteAsync(fileContent);
                    return;
                }

#if false
                string bp = @"D:\username\Documents\Visual Studio 2017\TFS\COR-Basic-V4\Portal\Portal\Resources\Styles\0\";
                if (System.Environment.OSVersion.Platform == System.PlatformID.Unix)
                    bp = "/root/gitlab/TFS/COR-Basic-V4/Portal/Portal/Resources/Styles/0/";
                
                if (isJS)
                {
                    
                    if(System.Environment.OSVersion.Platform == System.PlatformID.Unix)
                        bp = "/root/gitlab/TFS/COR-Basic-V4/Portal/Portal/Resources/Scripts/0/";
                    else
                        bp = @"D:\username\Documents\Visual Studio 2017\TFS\COR-Basic-V4\Portal\Portal\Resources\Scripts\0";
                }
                
                string fn = System.IO.Path.Combine(bp, file);
                string fc = System.IO.File.ReadAllText(fn);
#endif
                
                string ws = isJs ? System.Web.Hosting.HostingEnvironment.MapWebRootPath("/js/0/" + file) 
                    : System.Web.Hosting.HostingEnvironment.MapWebRootPath("/css/0/" + file);
                
                if (System.IO.File.Exists(ws))
                {
                    string fc = System.IO.File.ReadAllText(ws);
                    // System.IO.File.WriteAllText(ws, fc, System.Text.Encoding.UTF8);
                    
                    context.Response.StatusCode = 200;
                    context.Response.ContentType = contentType;
                    
                    await context.Response.WriteAsync(fc);
                    return;
                } // End if (System.IO.File.Exists(ws))
                
            } // End Try 
            catch (System.Exception e)
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "text/plain";
                await context.Response.WriteAsync("Error reading file '" + file + "'.\r\n" + e.Message + "\r\n" + e.StackTrace);
                return;
            } // End Catch 
            
            context.Response.StatusCode = 404;
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("File '" + file + "' not found.");
        } // End Task Invoke 
        
        
    } // End Class LayoutMiddleware
    
    
    public static class LayoutMiddlewareExtensions
    {
        
        public static Microsoft.AspNetCore.Builder.IApplicationBuilder UseLayoutMiddleware(
            this Microsoft.AspNetCore.Builder.IApplicationBuilder app)
        {
            // app.UseWhen(context => context.Request.Path.StartsWithSegments("/blob"), appBuilder => { }

            // https://www.devtrends.co.uk/blog/conditional-middleware-based-on-request-in-asp.net-core
            app.UseWhen(
                delegate(Microsoft.AspNetCore.Http.HttpContext context)
                {
                    return context.Request.Path.StartsWithSegments("/w8/Script.ashx")
                           || context.Request.Path.StartsWithSegments("/w8/Layout.ashx");
                }
                , delegate(Microsoft.AspNetCore.Builder.IApplicationBuilder appBuilder)
                {
                    // appBuilder.UseStatusCodePagesWithReExecute("/apierror/{0}");
                    appBuilder.UseMiddleware<LayoutMiddleware>();
                    //appBuilder.UseExceptionHandler("/apierror/500");
                }
            );
            
            return app;
        } // End Function UseLayoutMiddleware 
        
        
    } // End Class LayoutMiddlewareExtensions 
    
    
} // End Namespace 
