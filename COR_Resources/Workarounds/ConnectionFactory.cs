
namespace _COR.Workarounds 
{


    public class ConnectionFactory
    {

        public static string FindLocalInstanceName()
        {
            if ("W541".Equals(System.Environment.MachineName, System.StringComparison.InvariantCultureIgnoreCase))
                return System.Environment.MachineName + ",2017";

            if (System.Environment.OSVersion.Platform == System.PlatformID.Unix)
                return System.Environment.MachineName;

            Microsoft.Win32.RegistryKey key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL");

            // foreach (string subKeyName in key.GetSubKeyNames()) { }

            if (key != null)
            {

                foreach (string valueName in key.GetValueNames())
                {
                    if ("MSSQLSERVER".Equals(valueName, System.StringComparison.OrdinalIgnoreCase))
                        return System.Environment.MachineName;

                    return System.Environment.MachineName + @"\" + valueName;
                }

            }

            if ("COR".Equals(System.Environment.UserDomainName, System.StringComparison.OrdinalIgnoreCase))
                return System.Environment.MachineName + @"\SQLEXPRESS";

            return System.Environment.MachineName;
        }


        public static string GetConnectionString()
        {
            System.Data.SqlClient.SqlConnectionStringBuilder csb = new System.Data.SqlClient.SqlConnectionStringBuilder();
            csb.DataSource = FindLocalInstanceName();

            csb.IntegratedSecurity = System.Environment.OSVersion.Platform != System.PlatformID.Unix;

            if (!csb.IntegratedSecurity)
            {
                csb.UserID = TestPlotly.SecretManager.GetSecret<string>("DefaultDbUser");
                csb.Password = TestPlotly.SecretManager.GetSecret<string>("DefaultDbPassword");
            } // End if (!csb.IntegratedSecurity)

            try
            {
                csb.InitialCatalog = TestPlotly.SecretManager.GetSecret<string>("DatabaseName");
            }
            catch (System.Exception ex)
            {
                csb.InitialCatalog = System.Environment.UserDomainName + "_Basic_Demo_V4";
            }

            csb.PacketSize = 4096;
            csb.Pooling = false;
            csb.ApplicationName = "TestSlickListMVC";
            csb.ConnectTimeout = 5;
            csb.Encrypt = false;
            csb.MultipleActiveResultSets = false;
            csb.PersistSecurityInfo = false;
            csb.Replication = false;
            csb.WorkstationID = System.Environment.MachineName;

            return csb.ConnectionString;
        } // End Function GetDataAdapter


    }


}
