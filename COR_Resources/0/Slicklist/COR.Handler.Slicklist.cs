
using System.Data;
using System.Data.SqlClient;
using System.Collections.Generic;
using System.Reflection;


namespace _COR.Handler
{
    
    using Microsoft.AspNetCore.Http;


    public abstract class Slicklist 
        : System.Web.IHttpHandler
    {
        protected _COR.Mandant _Mandant;
        
        protected HttpContext m_context;
        protected System.Data.Common.DbProviderFactory m_factory;


        public Slicklist(_COR.Mandant mandant, System.Data.Common.DbProviderFactory factory)
        {
            this._Mandant = mandant;
            this.m_factory = factory;
        }


        public bool IsReusable
        {
            get { return false; }
        }

        public virtual int BE_ID
        {
            get { return 0; }
        }

        protected string SL_UID
        {
            get
            {
                string tV = this.m_context.Request.Params("SL_UID");
                if (!string.IsNullOrEmpty(tV))
                {
                    return tV;
                }

                return string.Empty;
            }
        }

        protected _COR.Mandant Mandant
        {
            set { this._Mandant = value; }
        }

        protected List<System.Data.Common.DbParameter> SQLParameter
        {
            get
            {
                Dictionary<string, object> tList = new Dictionary<string, object>();
                List<System.Data.Common.DbParameter> tSQL = new List<System.Data.Common.DbParameter>();
                string[] tPrivate = new[] {"SL_UID", "BE_ID", "SQLParameter", "Type", "Cache"};

                foreach (string tKey in this.m_context.Request.Query.Keys)
                {
                    if (System.Array.IndexOf(tPrivate, tKey) < 0)
                    {
                        if (!tList.ContainsKey(tKey))
                            tList.Add(tKey, this.m_context.Request.Query[tKey].ToString());
                    }
                }



                if (this.m_context.Request.HasFormContentType)
                {

                    var allKeys = System.Linq.Enumerable.ToDictionary(this.m_context.Request.Form, x => x.Key, x => x.Value.ToString());
                    System.Console.WriteLine(allKeys);

                    foreach (string tKey in this.m_context.Request.Form.Keys)
                    {
                        if (tKey != null && System.Array.IndexOf(tPrivate, tKey) < 0)
                        {
                            if (!tList.ContainsKey(tKey))
                                tList.Add(tKey, this.m_context.Request.Form[tKey].ToString());
                        }
                    }
                }

                foreach (MethodInfo tMethod in typeof(Slicklist).GetMethods((BindingFlags.Public | BindingFlags.Instance)))
                {
                    if (tList.ContainsKey(tMethod.Name))
                    {
                        tList[tMethod.Name] = tMethod.Invoke(this, new object[] {tList[tMethod.Name]});
                    }
                }


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

        protected object S(string value)
        {
            if (_COR.Tools.Validator.isValidDate(value))
            {
                return System.Convert.ToDateTime((value));
            }

            return System.DBNull.Value;
        }

        protected object From(string value)
        {
            if (_COR.Tools.Validator.isValidDate(value))
            {
                return System.Convert.ToDateTime((value));
            }

            return System.DBNull.Value;
        }

        protected object To(string value)
        {
            if (_COR.Tools.Validator.isValidDate(value))
            {
                return System.Convert.ToDateTime((value));
            }

            return System.DBNull.Value;
        }

        //REM: Liest die Slicklist-Spalten-Einstellungen von der Datenbank
        public System.Data.DataTable getColumns()
        {
            using (IDbCommand tCommand = _COR.SQL.fromFile("Slicklist.SL_Slickcolumns", Assembly.GetExecutingAssembly(),
                this._Mandant))
            {
                _COR.SQL.AddParameter(tCommand, "@BE_ID", this.BE_ID);
                _COR.SQL.AddParameter(tCommand, "@SL", this.SL_UID);
                return _COR.SQL.GetDataTable(tCommand, "columns");
            }
        }

        //REM: Liest die Slicklist-Einstellungen von der Datenbank
        public System.Data.DataTable getOptions()
        {
            using (IDbCommand tCommand = _COR.SQL.fromFile("Slicklist.SL_Slickoptions", Assembly.GetExecutingAssembly(),
                this._Mandant))
            {
                _COR.SQL.AddParameter(tCommand, "@BE_ID", this.BE_ID);
                _COR.SQL.AddParameter(tCommand, "@SL", this.SL_UID);
                return _COR.SQL.GetDataTable(tCommand, "options");
            }
        }

        //REM: Holt die Daten von der Datenbank
        public System.Data.DataSet getData(string sql)
        {
            System.Data.IDbCommand tDataCommand = getDataCommand(sql);
            if (tDataCommand != null && !string.IsNullOrEmpty(tDataCommand.CommandText))
            {
                if (this.SQLParameter != null)
                {
                    foreach (System.Data.Common.DbParameter tParameter in this.SQLParameter)
                    {
                        _COR.SQL.AddParameter(tDataCommand, tParameter.ParameterName, tParameter.Value);
                    }
                }

                ;

                return _COR.SQL.GetDataSet(tDataCommand);
            }

            ;

            return null;
        }

        //REM: Setzt den eigentlichen SQL - kann überschrieben werden
        public virtual System.Data.IDbCommand getDataCommand(string sql)
        {
            System.Data.IDbCommand tCommand = _COR.SQL.CreateCommand(_COR.Tools.Resourceloader.readSingleFile(
                System.Web.Hosting.HostingEnvironment.MapPath(sql),
                ((int) this._Mandant).ToString(),
                null)
            );
            
            _COR.SQL.AddParameter(tCommand, "BE_ID", this.BE_ID);

            return tCommand;
        }

        //REM: Holt die kundenspezifischen Daten von der Datenbank
        public System.Data.DataTable getMetaData()
        {
            using (IDbCommand tCommand = _COR.SQL.fromFile("Slicklist.SL_getMetadata", Assembly.GetExecutingAssembly(),
                this._Mandant))
            {
                _COR.SQL.AddParameter(tCommand, "@BE_ID", this.BE_ID);
                _COR.SQL.AddParameter(tCommand, "@SL", this.SL_UID);
                return _COR.SQL.GetDataTable(tCommand);
            }
        }

        public System.Data.DataSet getReferences(System.Data.DataTable table)
        {
            System.Data.DataSet tDataSet = new System.Data.DataSet("References");

            if (table != null && table.Rows.Count > 0)
            {
                IDbCommand tCommand = _COR.SQL.CreateCommand(string.Empty);

                //REM: Zwingende Parameter anfügen
                _COR.SQL.AddParameter(tCommand, "@BE_ID", this.BE_ID);

                //REM: Übergebene Parameter weitergeben
                List<System.Data.Common.DbParameter> tSQLParameters = this.SQLParameter;
                if (tSQLParameters != null)
                {
                    foreach (SqlParameter tParameter in tSQLParameters)
                    {
                        _COR.SQL.AddParameter(tCommand, tParameter.ParameterName, tParameter.Value);
                    }
                }

                ;

                foreach (System.Data.DataRow tRow in table.Rows)
                {
                    System.Reflection.Assembly tAssembly = Assembly.GetExecutingAssembly();
                    string tSQL = tRow["referenceSQL"].ToString();
                    string tTablename = tRow["referenceTablename"].ToString();
                    System.Guid tID = new System.Guid(tRow["id"].ToString());

                    if (string.IsNullOrEmpty(tSQL))
                    {
                        tSQL = "Slicklist.SL_Referencetable";
                    }
                    else
                    {
                        tAssembly = null;
                    }

                    if (
                        !string.IsNullOrEmpty(tTablename) &&
                        !tDataSet.Tables.Contains(tTablename)
                    )
                    {
                        //REM: Tabellen-Parameter
                        //_COR.SQL.AddParameter(tCommand, "@Tablename", tTablename);
                        _COR.SQL.AddParameter(tCommand, "@ID", tID);

                        //REM: SQL-Datei
                        if (!tSQL.StartsWith(".") && tAssembly != null)
                        {
                            tSQL = "." + tSQL;
                        }

                        if (!tSQL.EndsWith(".sql"))
                        {
                            tSQL = tSQL + ".sql";
                        }

                        //REM: Inhalt der SQL-Datei
                        tCommand.CommandText = _COR.SQL.GetEmbeddedSqlScript(tSQL, tAssembly, this._Mandant);

                        using (System.Data.DataTable tTable = _COR.SQL.GetDataTable(tCommand, tTablename))
                        {
                            tDataSet.Tables.Add(tTable);
                        }
                    }
                }
            }

            ;

            return tDataSet;
        }


        public async System.Threading.Tasks.Task ProcessRequest(HttpContext context)
        {
            this.m_context = context;

            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json; charset=utf-8";

            try
            {
                System.Data.DataTable tColumns = getColumns();
                System.Data.DataTable tOptions = getOptions();

                if (tOptions != null && tOptions.Rows.Count == 1)
                {
                    using (System.Data.DataSet tDataset = getData(tOptions.Rows[0]["sql"].ToString()))
                    {
                        if (tDataset != null)
                        {
                            //REM: Daten
                            System.Data.DataTable tData = tDataset.Tables[0];
                            tData.TableName = "data";

                            //REM: Kundenspezifische Daten hinzufügen
                            try
                            {
                                if (tData.Columns.Contains("id"))
                                {
                                    System.Data.DataTable tMeta = getMetaData();
                                    if (
                                        tMeta != null &&
                                        tMeta.Rows.Count > 0 &&
                                        tMeta.Columns.Contains("id")
                                    )
                                    {
                                        /*
                                            //REM: DataTable.Merge() funktioniert anscheinend nur mit Primärschlüsseln
                                            //REM: Wäre auch mit LINQ möglich, jedoch nicht zwingend einfacher
                                            //REM: Funktioniert nicht so ideal.. es macht wohl einen full und keinen left join
                                            //DataColumn[] tKeys = new DataColumn[1];
                                            //tKeys[0] = tData.Columns["id"];
                                            //tData.PrimaryKey = tKeys;

                                            //DataColumn[] tKeys2 = new DataColumn[1];
                                            //tKeys2[0] = tMeta.Columns["id"];
                                            //tMeta.PrimaryKey = tKeys2;

                                            //tData.Merge(tMeta, false, MissingSchemaAction.AddWithKey);
                                        */

                                        //REM: Primärschlüssel setzen
                                        DataColumn[] tKeys = new DataColumn[1];
                                        tKeys[0] = tData.Columns["id"];
                                        tData.PrimaryKey = tKeys;

                                        //REM: Spalten der Kundendaten an die Hauptdaten anfügen
                                        foreach (System.Data.DataColumn tColumn in tMeta.Columns)
                                        {
                                            if (!tData.Columns.Contains(tColumn.ColumnName))
                                            {
                                                tData.Columns.Add(new System.Data.DataColumn(tColumn.ColumnName));
                                            }
                                        }

                                        //REM: Werte einfügen
                                        foreach (System.Data.DataRow tRow in tMeta.Rows)
                                        {
                                            System.Data.DataRow tMainRow = tData.Rows.Find(tRow["id"]);
                                            if (tMainRow != null)
                                            {
                                                foreach (System.Data.DataColumn tColumn in tMeta.Columns)
                                                {
                                                    if (tColumn.ColumnName != "id")
                                                    {
                                                        tMainRow[tColumn.ColumnName] = tRow[tColumn.ColumnName];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            catch (System.Exception tE)
                            {
                                //REM: Nix - Beta. Dann kommt es einfach ohne Kundendaten.
                            }
                            
                            
                            //REM: Parameters
                            System.Data.DataTable tParameter = null;
                            if (tDataset.Tables.Count > 1)
                            {
                                tParameter = tDataset.Tables[1];
                                tParameter.TableName = "parameters";
                            }
                            else
                            {
                                tParameter = new System.Data.DataTable("parameters");
                            }
                            
                            //REM: Standard-Sortierung
                            string tSortString = tOptions.Rows[0]["defaultSortString"].ToString();
                            if (!string.IsNullOrEmpty(tSortString))
                            {
                                tData.DefaultView.Sort = tSortString;
                            }
                            
                            
                            //REM: Referenzen
                            System.Data.DataSet tReferences = getReferences(tColumns);

                            //REM: Ausgabe
                            System.Data.DataSet tOutput = new System.Data.DataSet();
                            tOutput.Tables.Add(tData.DefaultView.ToTable());
                            tOutput.Tables.Add(tColumns.Copy());
                            tOutput.Tables.Add(tOptions.Copy());
                            tOutput.Tables.Add(tParameter.Copy());
                            
                            if (tReferences != null && tReferences.Tables.Count > 0)
                            {
                                foreach (System.Data.DataTable tReference in tReferences.Tables)
                                {
                                    tOutput.Tables.Add(tReference.Copy());
                                }
                            }
                            
                            await context.Response.WriteAsync(_COR.Tools.JSON.JsonHelper.Serialize(tOutput));
                        }
                        else
                        {
                            await context.Response.WriteAsync(_COR.Tools.JSON.JsonHelper.Serialize(
                                "@@Error: [SL_SQL] nicht gefunden '" + tOptions.Rows[0]["sql"].ToString() + "'"));
                        }
                    }
                }
            }
            catch (System.Exception tE)
            {
                //context.Response.Write(_COR.Tools.JSON.JsonHelper.Serialize("@@Error: " + tE.Message));
                await context.Response.WriteAsync("@@Error: " + tE.Message + " \r\n" + tE.StackTrace);
            }
        }
    }
}
