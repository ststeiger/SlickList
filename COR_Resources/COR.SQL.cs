
using System;

namespace _COR
{

    
    public class SQL
    {
        protected static System.Data.Common.DbProviderFactory s_factory;
        public static string Directory = string.Empty;
        public static onCreateCommand_t onCreateCommand;
        public delegate void onCreateCommand_t(System.Data.IDbCommand cmd);


        static SQL()
        {
            // s_factory = System.Data.Common.DbProviderFactories.GetFactory("System.Data.SqlClient");
            s_factory = _COR.DbProviderFactories.GetFactory(typeof(System.Data.SqlClient.SqlClientFactory));
        }

        private static string mergeScript(string pScript, Mandant enuMandant, ref System.Reflection.Assembly ass)
        {
            if (!string.IsNullOrEmpty(pScript))
            {
                int tI = pScript.IndexOf("--#Include:", System.StringComparison.OrdinalIgnoreCase);
                if (tI > 0)
                {
                    string tP = pScript.Substring(tI);
                    tP = tP.Substring(0, tP.IndexOf(System.Environment.NewLine)).Trim();

                    string tS = tP.Substring(tP.IndexOf(":") + 1);
                    if (!string.IsNullOrEmpty(tS))
                    {
                        string tT = GetEmbeddedSqlScript(tS, ass, enuMandant);
                        tP = pScript.Replace(tP, tT);
                        pScript = mergeScript(tP, enuMandant, ref ass);
                    }
                }
            }

            return pScript;
        }

        public static System.Data.Common.DbConnection GetConnection(string connectionString)
        {
            System.Data.Common.DbConnection con = s_factory.CreateConnection();
            con.ConnectionString = connectionString;

            return con;
        }

        public static System.Data.Common.DbConnection GetConnection()
        {
            return GetConnection(getConnectionString());
        }

        //REM: Wie kann diese Methode überschrieben werden?
        public static System.Data.IDbCommand CreateCommand(string strSQL)
        {
            System.Data.Common.DbCommand tCommand = s_factory.CreateCommand();
            tCommand.CommandText = strSQL;

            //string tBenutzer = "0";

            if(onCreateCommand != null){
                onCreateCommand(tCommand);
            }
            //else {
                //REM: Ist nun im onCreateCommand
                //REM: PortalV4
                //if (string.IsNullOrEmpty(tBenutzer) || tBenutzer.Equals("0"))
                //{
                //    try
                //    {
                //        System.Web.HttpCookie tCookie = System.Web.HttpContext.Current.Request.Cookies["proc2"];
                //        if (tCookie != null)
                //        {
                //            tBenutzer = _COR.Tools.JSON.JsonHelper.Deserialize<System.Collections.Generic.Dictionary<string, object>>(System.Web.HttpContext.Current.Server.UrlDecode(tCookie.Value))["ID"].ToString();
                //        }
                //    }
                //    catch
                //    {
                //    }
                //}

                //REM: Portal_2013 & Portal_2014
                //if (string.IsNullOrEmpty(tBenutzer) || tBenutzer.Equals("0"))
                //{
                //    try
                //    {
                //        System.Web.HttpCookie tCookie = System.Web.HttpContext.Current.Request.Cookies["proc"];
                //        if (tCookie != null)
                //        {
                //            tBenutzer = System.Web.HttpContext.Current.Server.UrlDecode(System.Web.HttpContext.Current.Request.Cookies["proc"].Value).Split(';')[0];
                //        }
                //    }
                //    catch
                //    {
                //    }
                //}

                //AddParameter(tCommand, "@BE_ID", tBenutzer);
            //}

            return tCommand;
        }

        public static System.Data.DataTable GetDataTable(System.Data.IDbCommand cmd, string strTableName)
        {
            System.Data.DataTable dt = new System.Data.DataTable();

            if (!string.IsNullOrEmpty(strTableName))
                dt.TableName = strTableName;

            using (System.Data.Common.DbConnection idbc = GetConnection())
            {
                try
                {
                    cmd.Connection = idbc;

                    using (System.Data.Common.DbDataAdapter daQueryTable = s_factory.CreateDataAdapter())
                    {
                        daQueryTable.SelectCommand = (System.Data.Common.DbCommand)cmd;
                        daQueryTable.Fill(dt);
                    }
                }
                catch
                {
                    // 'Logme
                    throw;
                }
            }

            return dt;
        }

        public static System.Data.DataTable GetDataTable(System.Data.IDbCommand cmd)
        {
            return GetDataTable(cmd, null);
        }

        public static System.Data.DataTable GetDataTable(string strSQL)
        {
            using (System.Data.IDbCommand cmd = CreateCommand(strSQL))
            {
                return GetDataTable(cmd, null);
            } // cmd
        }

        public static System.Data.DataSet GetDataSet(System.Data.IDbCommand cmd)
        {
            System.Data.DataSet ds = new System.Data.DataSet();

            using (System.Data.Common.DbConnection sqlConnection = GetConnection())
            {
                cmd.Connection = sqlConnection;

                using (System.Data.Common.DbDataAdapter daQueryTable = s_factory.CreateDataAdapter())
                {
                    daQueryTable.SelectCommand = (System.Data.Common.DbCommand)cmd;

                    try
                    {
                        daQueryTable.Fill(ds);
                    }
                    catch
                    {
                        // 'Logme
                        throw;
                    }
                }
            }

            return ds;
        }

        public static void PowerOnSelfTest()
        {
            using (System.Data.Common.DbConnection conn = GetConnection())
            {
                conn.Open();
                conn.Close();
            }
        }

        public static _COR.Mandant getMandant()
        {
            string strSQL = "select top 1 [MDT_Kurz_DE] from [T_AP_Ref_Mandant] where([MDT_Status] = 1)";
            System.Data.IDbCommand tCommand = CreateCommand(strSQL);
            string strMDT = ExecuteScalar<string>(tCommand);

            try
            {
                return (_COR.Mandant)System.Enum.Parse(typeof(_COR.Mandant), strMDT);
            }
            catch
            {
                return _COR.Mandant.Global;
            }
        }

        public static System.Data.IDbCommand fromFile(string pName, System.Reflection.Assembly pAssembly, _COR.Mandant pMandant)
        {
            if (!pName.StartsWith(".") && pAssembly != null)
                pName = "." + pName;

            if (!pName.EndsWith(".sql"))
                pName = pName + ".sql";

            return CreateCommand(GetEmbeddedSqlScript(pName, pAssembly, pMandant));
        }   

        public static void ExecuteNonQueryFromFile(string strEmbeddedFileName)
        {
            string strSQL = GetEmbeddedSqlScript(strEmbeddedFileName, null, getMandant());
            ExecuteNonQuery(strSQL);
        }

        public static void ExecuteNonQuery(string strSQL)
        {
            ExecuteNonQuery(strSQL, getConnectionString());
        }

        public static void ExecuteNonQuery(string strSQL, string strConnectionString)
        {
            using (System.Data.IDbCommand cmd = CreateCommand(strSQL))
            {
                ExecuteNonQuery(cmd, strConnectionString);
            }
        }

        public static void ExecuteNonQuery(System.Data.IDbCommand cmd)
        {
            ExecuteNonQuery(cmd, getConnectionString());
        }

        public static void ExecuteNonQuery(System.Data.IDbCommand cmd, string strConnectionString)
        {
            using (System.Data.IDbConnection idbConn = GetConnection(strConnectionString))
            {
                if (!string.IsNullOrEmpty(strConnectionString))
                    idbConn.ConnectionString = strConnectionString;

                cmd.Connection = idbConn;

                try
                {
                    if (idbConn.State != System.Data.ConnectionState.Open)
                        idbConn.Open();

                    cmd.ExecuteNonQuery();
                }
                catch
                {
                    throw;
                }
            }
        }

        public static System.Data.IDataReader ExecuteReader(System.Data.IDbCommand cmd)
        {
            System.Data.IDataReader dr = null;

            System.Data.IDbConnection sqldbConnection = null;

            lock (cmd)
            {
                try
                {
                    sqldbConnection = GetConnection();

                    bool bSuccess = System.Threading.Monitor.TryEnter(sqldbConnection, 5000);
                    if (!bSuccess)
                        throw new System.Exception("Could not get lock on SQL DB connection in COR.SQL.ExecuteReader ==> Threading.Monitor.TryEnter");

                    cmd.Connection = sqldbConnection;

                    if (cmd.Connection.State != System.Data.ConnectionState.Open)
                        cmd.Connection.Open();

                    // When CommandBehavior.CloseConnection is used, then closing/disposing the reader 
                    // is specified to also close the Connection.

                    // Dispose methods may also mark the object in such a way that it can no longer be used.  
                    // Typically, Dispose methods do the same thing as Close with a further action 
                    // to mark the object as disposed and no longer usable.  
                    // In a proper implementation, either Close or Dispose, by itself, 
                    // is sufficient to prevent leakage of unmanaged objects.

                    dr = cmd.ExecuteReader(System.Data.CommandBehavior.CloseConnection);
                }
                catch (System.Exception)
                {
                    throw;
                }
            } // cmd

            return dr;
        } // ExecuteReader


        public static T GetClass<T>(System.Data.IDbCommand cmd)
        {
            T tThisValue = default(T);
            System.Type tThisType = typeof(T);

            lock (cmd)
            {
                using (System.Data.IDataReader idr = ExecuteReader(cmd))
                {
                    lock (idr)
                    {
                        try
                        {
                            while (idr.Read())
                            {
                                tThisValue = System.Activator.CreateInstance<T>();

                                for (int i = 0; i <= idr.FieldCount - 1; i++)
                                {
                                    string strName = idr.GetName(i);
                                    object objVal = idr.GetValue(i);

                                    System.Reflection.FieldInfo fi = tThisType.GetField(strName);
                                    if (fi != null)
                                        fi.SetValue(tThisValue, MyChangeType(objVal, fi.FieldType));
                                    else
                                    {
                                        System.Reflection.PropertyInfo pi = tThisType.GetProperty(strName);
                                        if (pi != null)
                                            pi.SetValue(tThisValue, MyChangeType(objVal, pi.PropertyType), null);
                                    }
                                }
                                break;
                            }
                        }
                        // Whend
                        catch (System.Exception)
                        {
                            throw;
                        }
                        finally
                        {
                            idr.Close();
                        }
                    } // idr 
                } // idr
            } // cmd

            return tThisValue;
        } // GetClass

        public static T GetClass<T>(string strSQL)
        {
            T tReturnValue = default(T);

            using (System.Data.IDbCommand cmd = CreateCommand(strSQL))
            {
                tReturnValue = GetClass<T>(cmd);
            } // cmd

            return tReturnValue;
        } // GetClass

        protected const System.Reflection.BindingFlags m_CaseSensitivity = System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.IgnoreCase;

        public static object MyChangeType(object objVal, System.Type t)
        {
            if (objVal == null | objVal == System.DBNull.Value)
                return null;

            // getbasetype
            System.Type tThisType = objVal.GetType();

            bool bNullable = IsNullable(t);
            if (bNullable)
                t = System.Nullable.GetUnderlyingType(t);

            if (object.ReferenceEquals(t, typeof(string)) && object.ReferenceEquals(tThisType, typeof(System.Guid)))
                return objVal.ToString();

            return System.Convert.ChangeType(objVal, t);
        }

        // Anything else than a struct or a class
        public static bool IsSimpleType(System.Type tThisType)
        {
            if (tThisType.IsPrimitive)
                return true;

            if (object.ReferenceEquals(tThisType, typeof(System.String)))
                return true;

            if (object.ReferenceEquals(tThisType, typeof(System.DateTime)))
                return true;

            if (object.ReferenceEquals(tThisType, typeof(System.Guid)))
                return true;

            if (object.ReferenceEquals(tThisType, typeof(System.Decimal)))
                return true;

            if (object.ReferenceEquals(tThisType, typeof(System.Object)))
                return true;

            return false;
        }

        public static System.Collections.Generic.IList<T> GetList<T>(System.Data.IDbCommand cmd)
        {
            System.Collections.Generic.List<T> lsReturnValue = new System.Collections.Generic.List<T>();
            T tThisValue = default(T);
            System.Type tThisType = typeof(T);


            lock (cmd)
            {
                using (System.Data.IDataReader idr = ExecuteReader(cmd))
                {
                    lock (idr)
                    {
                        try
                        {
                            if (IsSimpleType(tThisType))
                            {
                                while (idr.Read())
                                {
                                    object objVal = idr.GetValue(0);
                                    tThisValue = (T)MyChangeType(objVal, typeof(T));

                                    lsReturnValue.Add(tThisValue);
                                }
                            }
                            else
                            {
                                int myi = idr.FieldCount;


                                System.Reflection.FieldInfo[] fis = new System.Reflection.FieldInfo[idr.FieldCount - 1 + 1];
                                // Action<T, object>[] setters = new Action<T, object>[idr.FieldCount];

                                for (int i = 0; i <= idr.FieldCount - 1; i++)
                                {
                                    string strName = idr.GetName(i);
                                    System.Reflection.FieldInfo fi = tThisType.GetField(strName, m_CaseSensitivity);

                                    // if (fi != null)
                                    // setters[i] = GetSetter<T>(fi);
                                    fis[i] = fi;
                                }

                                while (idr.Read())
                                {
                                    // idr.GetOrdinal("")
                                    tThisValue = System.Activator.CreateInstance<T>();

                                    // Console.WriteLine(idr.FieldCount);
                                    for (int i = 0; i <= idr.FieldCount - 1; i++)
                                    {
                                        string strName = idr.GetName(i);
                                        object objVal = idr.GetValue(i);

                                        // System.Reflection.FieldInfo fi = t.GetField(strName, m_CaseSensitivity);
                                        if (fis[i] != null)
                                        {
                                            // if (fi != null)
                                            // fi.SetValue(tThisValue, System.Convert.ChangeType(objVal, fi.FieldType));
                                            if (objVal == System.DBNull.Value)
                                            {
                                                objVal = null;
                                                // SetValue<T>(tThisValue, fi, null);
                                                // setters[i](tThisValue, null);
                                                fis[i].SetValue(tThisValue, null);
                                            }
                                            else
                                            {
                                                // System.ComponentModel.TypeConverter conv = System.ComponentModel.TypeDescriptor.GetConverter(fi.FieldType);

                                                // bool bNullable = IsNullable(fi.FieldType);
                                                bool bNullable = IsNullable(fis[i].FieldType);

                                                if (bNullable)
                                                    fis[i].SetValue(tThisValue, objVal);
                                                else
                                                    // SetValue<T>(tThisValue, fi, objVal);
                                                    // setters[i](tThisValue, objVal);


                                                    // fis(i).SetValue(tThisValue, System.Convert.ChangeType(objVal, fis(i).FieldType))
                                                    fis[i].SetValue(tThisValue, MyChangeType(objVal, fis[i].FieldType));
                                            }
                                        }
                                        else
                                        {
                                            // End if (fi != null) 
                                            System.Reflection.PropertyInfo pi = tThisType.GetProperty(strName, m_CaseSensitivity);
                                            if (pi != null)
                                            {
                                                // pi.SetValue(tThisValue, System.Convert.ChangeType(objVal, pi.PropertyType), null);

                                                if (objVal == System.DBNull.Value)
                                                {
                                                    objVal = null;
                                                    pi.SetValue(tThisValue, null, null);
                                                }
                                                else
                                                {
                                                    bool bNullable = IsNullable(pi.PropertyType);
                                                    if (bNullable)
                                                        pi.SetValue(tThisValue, objVal, null);
                                                    else
                                                        pi.SetValue(tThisValue, System.Convert.ChangeType(objVal, pi.PropertyType), null);
                                                }
                                            } // End if (pi != null)
                                        } // End else of if (fi != null)
                                    }

                                    lsReturnValue.Add(tThisValue);
                                } // Whend
                            } // tThisType.IsPrimitive OrElse Object.ReferenceEquals(tThisType, GetType(String)) 
                        }

                        catch
                        {
                            throw;
                        }
                        finally
                        {
                            idr.Close();
                        }
                    } // idr
                } // idr
            } // cmd

            return lsReturnValue;
        } // GetList

        public static System.Collections.Generic.IList<T> GetList<T>(string strSQL)
        {
            System.Collections.Generic.List<T> lsReturnValue = null;

            using (System.Data.IDbCommand cmd = CreateCommand(strSQL))
            {
                lsReturnValue = (System.Collections.Generic.List<T>)GetList<T>(cmd);
            } // cmd

            return lsReturnValue;
        } // GetList


        public static string GetUserId()
        {
            string tBenutzer = "0";

            try
            {
                Microsoft.AspNetCore.Http.HttpRequest request = null; // System.Web.HttpContext.Current.Request
                
                string tCookie = request.Cookies["proc2"];
                if (tCookie != null)
                {
                    string str = System.Net.WebUtility.UrlDecode(tCookie);
                    tBenutzer = Newtonsoft.Json.JsonConvert.DeserializeObject<System.Collections.Generic.Dictionary<string, object>>(str)["ID"].ToString();
                }
           
            }
            catch (System.Exception ex)
            {
                throw;
            }

            return tBenutzer;
        } // GetUserId


        private static string SqlTypeFromDbType(System.Data.DbType type)
        {
            string strRetVal = null;

            // http://msdn.microsoft.com/en-us/library/cc716729.aspx
            switch (type)
            {
                case System.Data.DbType.Guid:
                    strRetVal = "uniqueidentifier";
                    break;
                case System.Data.DbType.Date:
                    strRetVal = "date";
                    break;
                case System.Data.DbType.Time:
                    strRetVal = "time(7)";
                    break;
                case System.Data.DbType.DateTime:
                    strRetVal = "datetime";
                    break;
                case System.Data.DbType.DateTime2:
                    strRetVal = "datetime2";
                    break;
                case System.Data.DbType.DateTimeOffset:
                    strRetVal = "datetimeoffset(7)";
                    break;

                case System.Data.DbType.StringFixedLength:
                    strRetVal = "nchar(MAX)";
                    break;
                case System.Data.DbType.String:
                    strRetVal = "nvarchar(MAX)";
                    break;

                case System.Data.DbType.AnsiStringFixedLength:
                    strRetVal = "char(MAX)";
                    break;
                case System.Data.DbType.AnsiString:
                    strRetVal = "varchar(MAX)";
                    break;

                case System.Data.DbType.Single:
                    strRetVal = "real";
                    break;
                case System.Data.DbType.Double:
                    strRetVal = "float";
                    break;
                case System.Data.DbType.Decimal:
                    strRetVal = "decimal(19, 5)";
                    break;
                case System.Data.DbType.VarNumeric:
                    strRetVal = "numeric(19, 5)";
                    break;

                case System.Data.DbType.Boolean:
                    strRetVal = "bit";
                    break;
                case System.Data.DbType.SByte:
                case System.Data.DbType.Byte:
                    strRetVal = "tinyint";
                    break;
                case System.Data.DbType.Int16:
                    strRetVal = "smallint";
                    break;
                case System.Data.DbType.Int32:
                    strRetVal = "int";
                    break;
                case System.Data.DbType.Int64:
                    strRetVal = "bigint";
                    break;
                case System.Data.DbType.Xml:
                    strRetVal = "xml";
                    break;
                case System.Data.DbType.Binary:
                    strRetVal = "varbinary(MAX)"; // or image
                    break;
                case System.Data.DbType.Currency:
                    strRetVal = "money";
                    break;
                case System.Data.DbType.Object:
                    strRetVal = "sql_variant";
                    break;

                case System.Data.DbType.UInt16:
                case System.Data.DbType.UInt32:
                case System.Data.DbType.UInt64:
                    throw new System.NotImplementedException("Uints not mapped - MySQL only");
            } // End switch (type)

            return strRetVal;
        } // End Function SqlTypeFromDbType



        // http://www.sqlusa.com/bestpractices/datetimeconversion/
        const string DATEFORMAT = "{0:yyyyMMdd}"; // YYYYMMDD ISO date format works at any language setting - international standard
        const string DATETIMEFORMAT = "{0:yyyy'-'MM'-'dd'T'HH:mm:ss.fff}"; // ISO 8601 format: international standard - works with any language setting


        public static string GetParameters(System.Data.IDbCommand cmd)
        {
            string strReturnValue = "";
            try
            {
                System.Text.StringBuilder msg = new System.Text.StringBuilder();
                System.DateTime dtLogTime = System.DateTime.UtcNow;

                if (cmd == null || string.IsNullOrEmpty(cmd.CommandText))
                {
                    return strReturnValue;
                }


                if (cmd.Parameters != null && cmd.Parameters.Count > 0)
                {
                    msg.AppendLine("-- ***** Listing Parameters *****");

                    foreach (System.Data.IDataParameter idpThisParameter in cmd.Parameters)
                    {
                        // http://msdn.microsoft.com/en-us/library/cc716729.aspx
                        msg.AppendLine(string.Format("DECLARE {0} AS {1} -- DbType: {2}", idpThisParameter.ParameterName, SqlTypeFromDbType(idpThisParameter.DbType), idpThisParameter.DbType.ToString()));
                    } // Next idpThisParameter

                    msg.AppendLine(System.Environment.NewLine);
                    msg.AppendLine(System.Environment.NewLine);

                    foreach (System.Data.IDataParameter idpThisParameter in cmd.Parameters)
                    {
                        string strParameterValue = null;
                        if (object.ReferenceEquals(idpThisParameter.Value, System.DBNull.Value))
                        {
                            strParameterValue = "NULL";
                        }
                        else
                        {
                            if (idpThisParameter.DbType == System.Data.DbType.Date)
                                strParameterValue = string.Format(DATEFORMAT, idpThisParameter.Value);
                            else if (idpThisParameter.DbType == System.Data.DbType.DateTime || idpThisParameter.DbType == System.Data.DbType.DateTime2)
                                strParameterValue = string.Format(DATETIMEFORMAT, idpThisParameter.Value);
                            else
                                strParameterValue = idpThisParameter.Value.ToString();

                            strParameterValue = "'" + strParameterValue.Replace("'", "''") + "'";
                        }

                        msg.AppendLine(string.Format("SET {0} = {1}", idpThisParameter.ParameterName, strParameterValue));
                    }

                    msg.AppendLine("-- ***** End Parameter Listing *****");
                    msg.AppendLine(System.Environment.NewLine);
                } // End if (cmd.Parameters != null && cmd.Parameters.Count > 0)

                strReturnValue = msg.ToString();
                msg = null;
            }
            catch (System.Exception ex)
            {
                strReturnValue = "Error in Function COR.SQL.GetParametrizedQueryText";
                strReturnValue += System.Environment.NewLine;
                strReturnValue += ex.Message;
            }

            return strReturnValue;
        } // End Function GetParametrizedQueryText


        public static void ExecuteNonQueryNoLogCircle(System.Data.IDbCommand cmd)
        {
            // Create a connection

            lock (cmd)
            {
                using (System.Data.IDbConnection idbConn = GetConnection())
                {

                    lock (idbConn)
                    {
                        idbConn.ConnectionString = getConnectionString();
                        cmd.Connection = idbConn;

                        try
                        {
                            if (!(idbConn.State == System.Data.ConnectionState.Open))
                            {
                                idbConn.Open();
                            }

                            cmd.ExecuteNonQuery();
                        }
                        catch
                        {
                            // Warning: Logging an error that occured during logging an error (e.g. wrong database) will create a stackoverflow exception...
                            // LogError("claSQL.cs ==> SQL.ExecuteNonQuery", ex, cmd);
                            throw;
                        }
                        finally
                        {
                            if (idbConn != null)
                            {
                                if (!(idbConn.State == System.Data.ConnectionState.Closed))
                                {
                                    idbConn.Close();
                                }
                            }
                        }

                    } // End Using idbConn

                } // End Using idbConn

            } // End Using cmd

        } // End Sub ExecuteNonQueryNoLogCircle


        public static void LogError(string Origin, System.Exception ex, System.Data.IDbCommand command)
        {
            LogError(Origin, ex, command, null);
        }
        
        public static void LogError(string Origin, System.Exception ex, System.Data.IDbCommand command, Microsoft.AspNetCore.Http.HttpContext context)
        {
            string strSQL = @"
-- DECLARE @__in_All varchar(MAX)
-- DECLARE @__in_implementationScript nvarchar(400)
-- DECLARE @__in_Message nvarchar(MAX) 
-- DECLARE @__in_Parameters nvarchar(MAX) 
-- DECLARE @__in_Processed bit
-- DECLARE @__in_Source nvarchar(400)
-- DECLARE @__in_SQL nvarchar(MAX) 
-- DECLARE @__in_TaskUserName nvarchar(100)
-- DECLARE @__in_Trace nvarchar(MAX) 
-- DECLARE @__in_Type nvarchar(500)
-- DECLARE @__in_URL nvarchar(500)
-- DECLARE @__in_Date datetime

-- SET @__in_All = 'ex.ToString()' -- text
-- SET @__in_implementationScript = NULL -- nvarchar(400)
-- SET @__in_Message = N'ex.Message' -- ntext
-- SET @__in_Parameters= N'aaaaaaaaaaa' -- ntext
-- SET @__in_Processed = 'false' -- bit
-- SET @__in_Source = N'ex.Source' -- nvarchar(400)
-- SET @__in_SQL = N'' -- ntext
-- SET @__in_TaskUserName = N'TaskUserName' -- nvarchar(100)
-- SET @__in_Trace = N'ex.StackTrace' -- ntext
-- SET @__in_Type = N'ex.GetType().FullName.ToString' -- nvarchar(500)
-- SET @__in_URL = N'' -- nvarchar(500)
-- SET @__in_Date = getdate() 


INSERT INTO T_COR_Error 
(
	 [All]
	,implementationScript
	,Message
	,Parameters
	,Processed
	,Source
	,SQL
	,TaskUserName
	,Trace
	,Type
	,URL
	,[Date]
)
VALUES
(
	 @__in_All -- text
	,@__in_implementationScript -- nvarchar(400)
	,@__in_Message -- ntext
	,@__in_Parameters -- ntext
	,@__in_Processed -- bit
	,SUBSTRING(@__in_Source, 1, 400) -- nvarchar(400) 
	,@__in_SQL -- ntext
	,SUBSTRING(@__in_TaskUserName, 1, 100) -- nvarchar(100) 
	,@__in_Trace -- ntext
	,SUBSTRING(@__in_Type, 1, 500) -- nvarchar(500) 
	,SUBSTRING(@__in_URL, 1, 500) -- nvarchar(500) 
	,@__in_Date -- datetime
)
;
";
            string strTaskUserName = GetUserId();
            string strURL = null;
            string strCommand = null;
            string strParameters = null;
            
            if (command != null)
            {
                strCommand = command.CommandText;
                // strParameters = GetParametrizedQueryText(command);
                strParameters = GetParameters(command);
            } // End if (command != null)
            
            if (context != null)
                strURL = context.Request.Path.Value;
            
            using (System.Data.IDbConnection dbcon = GetConnection())
            {
                
                using (System.Data.IDbCommand cmd = CreateCommand(strSQL))
                {
                    cmd.Connection = dbcon;
                    
                    AddParameter(cmd, "__in_All", ex.ToString());
                    AddParameter(cmd, "__in_implementationScript", null);
                    AddParameter(cmd, "__in_Message", ex.Message);
                    AddParameter(cmd, "__in_Parameters", strParameters);
                    AddParameter(cmd, "__in_Processed", false);
                    AddParameter(cmd, "__in_Source", ex.Source);
                    AddParameter(cmd, "__in_SQL", strCommand);
                    AddParameter(cmd, "__in_TaskUserName", strTaskUserName);
                    AddParameter(cmd, "__in_Trace", ex.StackTrace);
                    AddParameter(cmd, "__in_Type", ex.GetType().FullName);
                    AddParameter(cmd, "__in_URL", strURL);
                    AddParameter(cmd, "__in_Date", System.DateTime.Now);

                    ExecuteNonQueryNoLogCircle(cmd);
                } // End Using cmd 

            } // End Using dbcon 


            //Elmah.ErrorSignal.FromCurrentContext().Raise(ex);
            //string strMessage = "Exception in ExecuteStoredProcedure" + Environment.NewLine;
            //strMessage += "SQL: " + strSQL + Environment.NewLine;
            //strMessage += "Exception: " + ex.Message + Environment.NewLine;
            //strMessage += "StackTrace: " + ex.StackTrace;


            //if (ex.InnerException != null)
            //{
            //    strMessage += Environment.NewLine + Environment.NewLine;
            //    strMessage += "Inner Exception: " + ex.InnerException.Message + Environment.NewLine;
            //    strMessage += "InnerStacktrace: " + ex.InnerException.StackTrace + Environment.NewLine;
            //}


            // System.Diagnostics.Debug.WriteLine(strMessage);
            // System.Diagnostics.Trace.WriteLine(strMessage);
            // COR.Debug.Output.MsgBox(strMessage);
        }


        private static string GetAssemblyQualifiedNoVersionName(string input)
        {
            int i = 0;
            bool isNotFirst = false;
            while (i < input.Length)
            {
                if (input[i] == ',')
                {
                    if (isNotFirst)
                        break;

                    isNotFirst = true;
                }
                i += 1;
            }

            return input.Substring(0, i);
        } // GetAssemblyQualifiedNoVersionName

        public delegate void callbackAddData_t<T>(System.Data.IDbCommand cmd, T thisItem);

        public delegate void callbackAddDataClosure_t<T>(T thisItem);

        public static void InsertList<T>(string cmdInsert, System.Collections.Generic.IEnumerable<T> listToInsert, callbackAddDataClosure_t<T> addDataCallback)
        {
            using (System.Data.IDbCommand cmd = CreateCommand(cmdInsert))
            {
                InsertList<T>(cmd, listToInsert, addDataCallback);
            }
        }

        public static void InsertList<T>(System.Data.IDbCommand cmdInsert, System.Collections.Generic.IEnumerable<T> listToInsert, callbackAddDataClosure_t<T> addDataCallback)
        {
            using (System.Data.Common.DbConnection conn = GetConnection())
            {
                if (conn.State != System.Data.ConnectionState.Open)
                    conn.Open();
                cmdInsert.Connection = conn;
                using (System.Data.Common.DbTransaction transact = conn.BeginTransaction())
                {
                    cmdInsert.Transaction = transact;
                    try
                    {
                        foreach (T thisItem in listToInsert)
                        {
                            addDataCallback(thisItem);
                            if (cmdInsert.ExecuteNonQuery() != 1)
                                throw new System.InvalidProgramException();
                        }

                        transact.Commit();
                    }
                    catch (System.Exception)
                    {
                        transact.Rollback();
                        // LogError("claSQL.cs ==> SQL.InsertList > callbackAddDataClosure_t", ex, cmdInsert)
                        throw;
                    }
                    finally
                    {
                        if (conn.State != System.Data.ConnectionState.Closed)
                            conn.Close();
                    }
                }
            }
        }

        public static void InsertList<T>(string cmdInsert, System.Collections.Generic.IEnumerable<T> listToInsert, callbackAddData_t<T> addDataCallback)
        {
            using (System.Data.IDbCommand cmd = CreateCommand(cmdInsert))
            {
                InsertList<T>(cmd, listToInsert, addDataCallback);
            }
        }

        public static void InsertList<T>(System.Data.IDbCommand cmdInsert, System.Collections.Generic.IEnumerable<T> listToInsert, callbackAddData_t<T> addDataCallback)
        {
            using (System.Data.Common.DbConnection conn = GetConnection())
            {
                if (conn.State != System.Data.ConnectionState.Open)
                    conn.Open();
                cmdInsert.Connection = conn;
                using (System.Data.Common.DbTransaction transact = conn.BeginTransaction())
                {
                    cmdInsert.Transaction = transact;
                    try
                    {
                        foreach (T thisItem in listToInsert)
                        {
                            addDataCallback(cmdInsert, thisItem);
                            if (cmdInsert.ExecuteNonQuery() != 1)
                                throw new System.InvalidProgramException();
                        }

                        transact.Commit();
                    }
                    catch
                    {
                        transact.Rollback();
                        // LogError("claSQL.cs ==> SQL.InsertList > callbackAddData_t", ex, cmdInsert)
                        throw;
                    }
                    finally
                    {
                        if (conn.State != System.Data.ConnectionState.Closed)
                            conn.Close();
                    }
                }
            }
        }

        private static string GetAssemblyQualifiedNoVersionName(System.Type type)
        {
            if (type == null)
                return null;

            return GetAssemblyQualifiedNoVersionName(type.AssemblyQualifiedName);
        } // GetAssemblyQualifiedNoVersionName

        private static void WriteAssociativeArray(Newtonsoft.Json.JsonTextWriter jsonWriter, System.Data.Common.DbDataReader dr, bool dataType)
        {
            jsonWriter.WriteStartObject();

            for (int i = 0; i <= dr.FieldCount - 1; i++)
            {
                jsonWriter.WritePropertyName(dr.GetName(i));
                jsonWriter.WriteStartObject();

                jsonWriter.WritePropertyName("index");
                jsonWriter.WriteValue(i);

                /* TODO ERROR: Skipped IfDirectiveTrivia *//* TODO ERROR: Skipped DisabledTextTrivia *//* TODO ERROR: Skipped EndIfDirectiveTrivia */
                if (dataType)
                {
                    jsonWriter.WritePropertyName("fieldType");
                    jsonWriter.WriteValue(GetAssemblyQualifiedNoVersionName(dr.GetFieldType(i)));
                }

                jsonWriter.WriteEndObject();
            }

            jsonWriter.WriteEndObject();
        } // WriteAssociativeArray

        private static void WriteAssociativeArray(Newtonsoft.Json.JsonTextWriter jsonWriter, System.Data.Common.DbDataReader dr)
        {
            WriteAssociativeArray(jsonWriter, dr, false);
        } // WriteAssociativeArray

        public static void SerializeLargeDataset(System.Data.IDbCommand cmd, System.IO.Stream outputStream, bool pretty)
        {
            Newtonsoft.Json.JsonSerializer ser = new Newtonsoft.Json.JsonSerializer();
            System.Data.Common.DbCommand cmd2 = (System.Data.Common.DbCommand)cmd;

            using (System.IO.StreamWriter output = new System.IO.StreamWriter(outputStream))
            {
                using (Newtonsoft.Json.JsonTextWriter jsonWriter = new Newtonsoft.Json.JsonTextWriter(output)) // context.Response.Output)
                {
                    if (pretty)
                        jsonWriter.Formatting = Newtonsoft.Json.Formatting.Indented;

                    jsonWriter.WriteStartObject();

                    jsonWriter.WritePropertyName("tables");
                    jsonWriter.WriteStartArray();

                    using (System.Data.Common.DbConnection con = GetConnection())
                    {
                        cmd.Connection = con;

                        if (con.State != System.Data.ConnectionState.Open)
                            con.Open();

                        using (System.Data.Common.DbDataReader dr = cmd2.ExecuteReader(System.Data.CommandBehavior.SequentialAccess | System.Data.CommandBehavior.CloseConnection))
                        {
                            do
                            {
                                jsonWriter.WriteStartObject();
                                jsonWriter.WritePropertyName("columns");

                                WriteAssociativeArray(jsonWriter, dr);
                                jsonWriter.WritePropertyName("rows");
                                jsonWriter.WriteStartArray();
                                if (dr.HasRows)
                                {
                                    while (dr.Read())
                                    {
                                        object[] thisRow = new object[dr.FieldCount - 1 + 1];
                                        jsonWriter.WriteStartArray();
                                        for (int i = 0; i <= dr.FieldCount - 1; i++)
                                            jsonWriter.WriteValue(dr.GetValue(i));
                                        jsonWriter.WriteEndArray();
                                    }
                                }

                                jsonWriter.WriteEndArray();
                                jsonWriter.WriteEndObject();
                            }
                            while (dr.NextResult());
                        } // dr 

                        if (con.State != System.Data.ConnectionState.Closed)
                            con.Close();
                    } // con 

                    jsonWriter.WriteEndArray();

                    jsonWriter.WriteEndObject();

                    jsonWriter.Flush();
                    output.Flush();
                    outputStream.Flush();
                } // jsonWriter 
            } // output 
        } // SerializeLargeDataset 

        public static bool IsNullable(System.Type t)
        {
            if (t == null)
                return false;

            return t.IsGenericType && object.ReferenceEquals(t.GetGenericTypeDefinition(), typeof(System.Nullable<>));
        }

        public static T ExecuteScalar<T>(System.Data.IDbCommand cmd)
        {
            string strReturnValue = "";
            object objResult = null;
            System.Type tReturnType = null;

            // Create a connection
            using (System.Data.IDbConnection sqldbConnection = GetConnection())
            {
                try
                {
                    tReturnType = typeof(T);
                    cmd.Connection = sqldbConnection;

                    if (cmd.Connection.State != System.Data.ConnectionState.Open)
                        cmd.Connection.Open();

                    objResult = cmd.ExecuteScalar();

                    if (objResult != null)
                    {
                        if (!object.ReferenceEquals(tReturnType, typeof(byte[])))
                        {
                            strReturnValue = objResult.ToString();
                            objResult = null;
                        }
                    }
                    else
                        strReturnValue = null;
                }

                // MsgBox("Command completed successfully", MsgBoxStyle.OkOnly, "Success !")
                catch
                {
                    // 'Logme
                    throw;
                }
            } // sqldbConnection


            try
            {
                if (tReturnType == typeof(string))
                    return CAnyType<T>((object)strReturnValue);
                else if (tReturnType == typeof(bool))
                {
                    if (string.IsNullOrEmpty(strReturnValue))
                        return CAnyType<T>(false);

                    double dbl;
                    if(double.TryParse(strReturnValue, out dbl))
                    {
                        if (dbl == 0.0)
                            return CAnyType<T>(false);
                        else
                            return CAnyType<T>(true);
                    }

                    bool bReturnValue = bool.Parse(strReturnValue);
                    return CAnyType<T>((object)bReturnValue);
                }
                else if (tReturnType == typeof(int))
                {
                    int iReturnValue = int.Parse(strReturnValue);
                    return CAnyType<T>((object)iReturnValue);
                }
                else if (tReturnType == typeof(long))
                {
                    long lngReturnValue = long.Parse(strReturnValue);
                    return CAnyType<T>((object)lngReturnValue);
                }
                else if (tReturnType == typeof(System.Type))
                {
                    // Type.GetType() will only look in the calling assembly and then mscorlib.dll for the type. 
                    // Use Type.AssemblyQualifiedName for getting any type.
                    System.Type tReturnValue = System.Type.GetType(strReturnValue);
                    if (System.StringComparer.OrdinalIgnoreCase.Equals(strReturnValue, "System.Uri"))
                        tReturnValue = typeof(System.Uri);

                    return CAnyType<T>((object)tReturnValue);
                }
                else if (tReturnType == typeof(byte[]))
                {
                    if (objResult == System.DBNull.Value)
                        return CAnyType<T>(null);

                    return CAnyType<T>(objResult);
                }
                else
                    // COR.Debug.Output.MsgBox("ExecuteSQLstmtScalar(Of " + GetType(T).ToString() + "): This type is not yet defined.")
                    // System.Diagnostics.Trace.WriteLine("ExecuteSQLstmtScalar(Of T): This type is not yet defined.")
                    throw new System.NotImplementedException("ExecuteSQLstmtScalar(Of " + typeof(T).ToString() + "): This type is not yet defined.");
            }
            catch
            {
                // 'Logme
                throw;
            }

            return default(T);
        } // ExecuteScalar

        protected static T CAnyType<T>(object UTO)
        {
            return (T)UTO;
        } // CAnyType

        public static T ExecuteScalarFromFile<T>(string strEmbeddedFileName)
        {
            string strSQL = GetEmbeddedSqlScript(strEmbeddedFileName, null, getMandant());
            return ExecuteScalar<T>(strSQL);
        }

        public static T ExecuteScalar<T>(string strSQL)
        {
            T tReturnValue = default(T);

            using (System.Data.IDbCommand cmd = CreateCommand(strSQL))
            {
                tReturnValue = ExecuteScalar<T>(cmd);
            } // cmd

            return tReturnValue;
        }

        public static System.Data.IDbDataParameter AddParameter(System.Data.IDbCommand command, string strParameterName, object objValue)
        {
            return AddParameter(command, strParameterName, objValue, System.Data.ParameterDirection.Input);
        }

        public static System.Data.IDbDataParameter AddParameter(System.Data.IDbCommand command, string strParameterName, object objValue, System.Data.ParameterDirection pad)
        {
            if (objValue == null)
                objValue = System.DBNull.Value;

            System.Type tDataType = objValue.GetType();
            System.Data.DbType dbType = GetDbType(tDataType);

            return AddParameter(command, strParameterName, objValue, pad, dbType);
        }

        public static void RemoveParameter(System.Data.IDbCommand command, string parameterName)
        {
            if (!parameterName.StartsWith("@"))
                parameterName = "@" + parameterName;

            if ((command.Parameters.Contains(parameterName)))
                command.Parameters.RemoveAt(parameterName);
        }

        public static System.Data.IDbDataParameter AddParameter(System.Data.IDbCommand command, string strParameterName, object objValue, System.Data.ParameterDirection pad, System.Data.DbType dbType)
        {
            System.Data.IDbDataParameter parameter = command.CreateParameter();

            if (!strParameterName.StartsWith("@"))
                strParameterName = "@" + strParameterName;

            if ((command.Parameters.Contains(strParameterName)))
                command.Parameters.RemoveAt(strParameterName);

            parameter.ParameterName = strParameterName;
            parameter.DbType = dbType;
            parameter.Direction = pad;

            if (objValue == null)
                parameter.Value = System.DBNull.Value;
            else
                parameter.Value = objValue;

            command.Parameters.Add(parameter);
            return parameter;
        }

        protected static System.Data.DbType GetDbType(System.Type type)
        {
            // http://social.msdn.microsoft.com/Forums/en/winforms/thread/c6f3ab91-2198-402a-9a18-66ce442333a6
            string strTypeName = type.Name;
            System.Data.DbType DBtype = System.Data.DbType.String; // default value

            if (object.ReferenceEquals(type, typeof(System.DBNull)))
                return DBtype;

            try
            {
                DBtype = (System.Data.DbType)System.Enum.Parse(typeof(System.Data.DbType), strTypeName, true);
            }
            catch
            {
            }

            return DBtype;
        }

        public static string GetEmbeddedSqlScript(string pScriptName, System.Reflection.Assembly pAssembly, Mandant pMandant)
        {
            string tScript = _COR.Tools.Resourceloader.readSingleFile(Directory + pScriptName, System.Convert.ToInt32(pMandant).ToString(), pAssembly);
            return mergeScript(tScript, pMandant, ref pAssembly);
        }

        public static string getConnectionString()
        {
            return SQL.GetConnectionString(null);
        }

        // Requires reference to System.Configuration
        // http://stackoverflow.com/questions/6582970/separate-connectionstrings-and-mailsettings-from-web-config-possible
        protected static string strStaticConnectionString = null;

        public static string GetInitialCatalog()
        {
            string strInitialCatalog = null;
            System.Data.SqlClient.SqlConnectionStringBuilder csb = new System.Data.SqlClient.SqlConnectionStringBuilder();
            csb.ConnectionString = _COR.SQL.getConnectionString();

            strInitialCatalog = csb.InitialCatalog;
            csb.Clear();
            csb = null;

            return strInitialCatalog;
        }

        public static System.Data.SqlClient.SqlConnectionStringBuilder GetConnectionStringBuilder(string strIntitialCatalog)
        {
            System.Data.SqlClient.SqlConnectionStringBuilder tReturn;
            string tConnectionString = null;

            string tName = System.Environment.MachineName;

            if (string.IsNullOrEmpty(tName)) {
                tName = "LocalSqlServer";
            }
            
            
            /*
            System.Configuration.ConnectionStringSettingsCollection settings = System.Configuration.ConfigurationManager.ConnectionStrings;
            if ((settings != null)) {
                foreach (System.Configuration.ConnectionStringSettings cs in settings) {
                    if (System.StringComparer.OrdinalIgnoreCase.Equals(cs.Name, tName)) {
                        tConnectionString = cs.ConnectionString;
                        break;
                    }
                }
            }

            if (string.IsNullOrEmpty(tConnectionString)) {
                tName = "server";

                System.Configuration.ConnectionStringSettings conString = System.Configuration.ConfigurationManager.ConnectionStrings[tName];
                if (conString != null) {
                    tConnectionString = conString.ConnectionString;
                }
            }
            
            if(string.IsNullOrEmpty(tConnectionString)){
                throw new System.ArgumentNullException("ConnectionString \"" + tName + "\" in file web.config.");
            }

            tReturn = new System.Data.SqlClient.SqlConnectionStringBuilder(tConnectionString);


            if (string.IsNullOrEmpty(strStaticConnectionString)){
                if (!tReturn.IntegratedSecurity) {
                    tReturn.Password = _COR.Tools.Encrypting.DeCrypt(System.Convert.ToString(tReturn.Password));
                }

                tConnectionString = tReturn.ConnectionString;
                strStaticConnectionString = tConnectionString;
            }

            if(!string.IsNullOrEmpty(strIntitialCatalog)){ 
                tReturn.InitialCatalog = strIntitialCatalog;
            }
            */
            
            tReturn = new System.Data.SqlClient.SqlConnectionStringBuilder();
            tReturn.DataSource = System.Environment.MachineName;
            tReturn.InitialCatalog = TestPlotly.SecretManager.GetSecret<string>("DefaultDb");
            tReturn.IntegratedSecurity = System.Environment.OSVersion.Platform != PlatformID.Unix;
            
            if (!tReturn.IntegratedSecurity)
            {
                tReturn.UserID = TestPlotly.SecretManager.GetSecret<string>("DefaultDbUser");            
                tReturn.Password = TestPlotly.SecretManager.GetSecret<string>("DefaultDbPassword");
            }
            
            return tReturn;
        }

        public static string GetConnectionString(string strIntitialCatalog)
        {
            string strReturnValue = null;
            string strProviderName = null;


            if (string.IsNullOrEmpty(strStaticConnectionString))
            {
                string strConnectionStringName = System.Environment.MachineName;

                if (string.IsNullOrEmpty(strConnectionStringName))
                    strConnectionStringName = "LocalSqlServer";
                
                /*
                System.Configuration.ConnectionStringSettingsCollection settings = System.Configuration.ConfigurationManager.ConnectionStrings;
                if ((settings != null))
                {
                    foreach (System.Configuration.ConnectionStringSettings cs in settings)
                    {
                        if (System.StringComparer.OrdinalIgnoreCase.Equals(cs.Name, strConnectionStringName))
                        {
                            strReturnValue = cs.ConnectionString;
                            strProviderName = cs.ProviderName;
                            break;
                        }
                    }
                }

                if (string.IsNullOrEmpty(strReturnValue))
                {
                    strConnectionStringName = "server";

                    System.Configuration.ConnectionStringSettings conString = System.Configuration.ConfigurationManager.ConnectionStrings[strConnectionStringName];

                    if (conString != null)
                        strReturnValue = conString.ConnectionString;
                }

                if (string.IsNullOrEmpty(strReturnValue))
                    throw new System.ArgumentNullException("ConnectionString \"" + strConnectionStringName + "\" in file web.config.");
                
                settings = null; // TODO Change to default(_) if this is not a reference type
                */
                strConnectionStringName = null;
               
            }
            else
            {
                if (string.IsNullOrEmpty(strIntitialCatalog))
                    return strStaticConnectionString;

                strReturnValue = strStaticConnectionString;
            }
            

            System.Data.SqlClient.SqlConnectionStringBuilder sb = new System.Data.SqlClient.SqlConnectionStringBuilder(_COR.Workarounds.ConnectionFactory.GetConnectionString());


            if (string.IsNullOrEmpty(strStaticConnectionString))
            {
                if (!sb.IntegratedSecurity)
                {
                    try
                    {
                        sb.Password = _COR.Tools.Encrypting.DeCrypt(System.Convert.ToString(sb.Password));
                    }
                    catch (System.Exception)
                    {
                        // Then the password is not encrypted, and we don't need to do anything 
                    }
                    
                }

                strReturnValue = sb.ConnectionString;
                strStaticConnectionString = strReturnValue;
            }

            if (!string.IsNullOrEmpty(strIntitialCatalog))
                sb.InitialCatalog = strIntitialCatalog;

            strReturnValue = sb.ConnectionString;
            sb = null;

            return strReturnValue;
        }
    }
}
