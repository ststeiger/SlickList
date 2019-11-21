
namespace Microsoft.AspNetCore.Http 
{
    
    
    public static class HttpRequestExtensions
    {
        
        
        public static string Params(this Microsoft.AspNetCore.Http.HttpRequest request, string key)
        {
            if(request.Query.ContainsKey(key))
                return request.Query[key];
            
            if (request.HasFormContentType)
            {
                if (request.Form.ContainsKey(key))
                    return request.Form[key];
            } // End if (context.Request.HasFormContentType) 
            
            if(request.Cookies.ContainsKey(key))
                return request.Cookies[key];
            
            if(request.Headers.ContainsKey(key))
                return request.Headers[key];
            
            return null;
        }
        
        
    }
    
    
}
