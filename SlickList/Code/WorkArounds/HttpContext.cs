
namespace System.Web
{
    // using Microsoft.AspNetCore.Http;


    public static class HttpContextExtensions 
    {
        public static string MapPath(this Microsoft.AspNetCore.Http.HttpContext context, string dir)
        {
            return System.Web.Hosting.HostingEnvironment.MapPath(dir);
        }

    }


    public static class HttpContextTest
    {
        private static Microsoft.AspNetCore.Http.IHttpContextAccessor m_httpContextAccessor;


        public static void Configure(Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor)
        {
            m_httpContextAccessor = httpContextAccessor;
        }


        public static Microsoft.AspNetCore.Http.HttpContext Current
        {
            get
            {
                return m_httpContextAccessor.HttpContext;
            }
        }

    }

    public class NotHttpContext
    {

        private static Microsoft.AspNetCore.Http.HttpContextAccessor s_accessor;
        
        
        public static void Configure(Microsoft.AspNetCore.Http.HttpContextAccessor accessor)
        {
            s_accessor = accessor;
        }
        
        
        public static Microsoft.AspNetCore.Http.HttpContext Current
        {
            get { return s_accessor.HttpContext; }

        }
        
        
    }
}