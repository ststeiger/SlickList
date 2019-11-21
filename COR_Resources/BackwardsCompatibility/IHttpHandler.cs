
namespace System.Web
{
    using Microsoft.AspNetCore.Http;


    /// <devdoc>
    ///    <para>
    ///       Defines the contract that developers must implement to
    ///       synchronously process HTTP web requests. Developers
    ///       implement the ProcessRequest method to provide custom URL execution.
    ///    </para>
    /// </devdoc>
    public interface IHttpHandler
    {

        /// <devdoc>
        ///    <para>
        ///       Drives web processing execution.
        ///    </para>
        /// </devdoc>
        System.Threading.Tasks.Task ProcessRequest(HttpContext context);
        
        /// <devdoc>
        ///    <para>
        ///       Allows an IHTTPHandler instance to indicate at the end of a
        ///       request whether it can be recycled and used for another request.
        ///    </para>
        /// </devdoc>
        bool IsReusable { get; }
    }


}
