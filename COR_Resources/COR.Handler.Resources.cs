
using Microsoft.AspNetCore.Http;


namespace _COR.Handler
{
    public class Resources : System.Web.IHttpHandler
    {
        public async System.Threading.Tasks.Task ProcessRequest(Microsoft.AspNetCore.Http.HttpContext context)
        {
            context.Response.ContentType = "text/css";

            using (System.Data.IDbCommand tCommand = _COR.SQL.CreateCommand("select [OBJT_Symbol], [OBJT_Symbolmime], [OBJT_Code] from [T_OV_Ref_ObjektTyp] where not [OBJT_Symbol] is null"))
            {
                using (System.Data.DataTable tTable = _COR.SQL.GetDataTable(tCommand))
                {
                    foreach (System.Data.DataRow tRow in tTable.Rows)
                    {
                        await context.Response.WriteAsync("._resOBJT" + tRow["OBJT_Code"].ToString() + "{background-image: url('data:" + tRow["OBJT_Symbolmime"].ToString() + ";base64," + System.Convert.ToBase64String((byte[])tRow["OBJT_Symbol"]) + "') !important}");
                        await context.Response.WriteAsync(System.Environment.NewLine);
                    }
                }
            }
            
        }
        
        
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
