
using System;
using System.Collections.Generic;
using System.Text;

namespace _COR.Tools
{
    public class Resourceloader
    {
        /// <summary>
        /// Stellt eine Ressourcen-Datei dar
        /// </summary>
        public class resourceFile
        {
            #region "Felder"
            private System.Reflection.Assembly _Assembly;
            private string _Content;
            private string _FullName;
            private Boolean _IgnoreDirectory;
            private Boolean _Minify;
            #endregion

            #region "Konstruktoren"
            //public resourceFile(string pFullName)
            public resourceFile(string pFullName, System.Reflection.Assembly pAssembly = null, Boolean pMinify = false, Boolean pIgnoreDirectory = false)
            {
                this._Assembly = pAssembly;
                this._FullName = pFullName;
                this._IgnoreDirectory = pIgnoreDirectory;
                this._Minify = pMinify;
            }

            /*
            public resourceFile(string pFullName, System.Reflection.Assembly pAssembly = null, Boolean pMinify = false)
            {
                this._Assembly = pAssembly;
                this._FullName = pFullName;
                this._Minify = pMinify;
            }
            */
            #endregion

            #region "Eigenschaften"
            public string Content
            {
                get
                {
                    return this._Content;
                }
				set
                {
                    this._Content = value;
                }
            }

            public System.Reflection.Assembly Assembly
            {
                get
                {
                    return this._Assembly;
                }
            }

            public Boolean Minify
            {
                get
                {
                    return this._Minify;
                }
            }

            public Boolean IgnoreDirectory
            {
                get
                {
                    return this._IgnoreDirectory;
                }
            }

            public string FullName
            {
                get
                {
                    return this._FullName;
                }
            }
			#endregion
        }

        /// <summary>
        /// Beinhaltet die Liste aller einzelnen Ressourcen-Dateien
        /// </summary>
        protected List<resourceFile> _resourceFiles = new List<resourceFile>();
        protected string _defaultDirectory = "";

        public Resourceloader(string pDefaultDirectory)
        {
            this._defaultDirectory = pDefaultDirectory;
        }

        #region "Methoden"
        /// <summary>
        /// Nimmt eine neue Ressourcen-Datei auf
        /// </summary>
        /// <param name="pResourceFile"></param>
        public void Add(resourceFile pResourceFile)
        {
            this._resourceFiles.Add(pResourceFile);
        }

        /// <summary>
        /// Nimmt eine neue Ressourcen-Datei auf
        /// </summary>
        /// <param name="pResourceFile"></param>
        public void Add(string pFullName)
        {
            this._resourceFiles.Add(new resourceFile(pFullName));
        }

        public List<resourceFile> readAllFiles(string pMandant)
        {
            foreach (resourceFile tResourceFile in this._resourceFiles)
            {
                string tPath = tResourceFile.FullName;
                if (!tResourceFile.IgnoreDirectory){
                    tPath = this._defaultDirectory + tPath;
                };

                tResourceFile.Content = readSingleFile(
                    tPath,
                    pMandant,
                    tResourceFile.Assembly
                );
            }

            return this._resourceFiles;
        }


        private static char[] s_seps = new char[] {'/', '\\', System.IO.Path.DirectorySeparatorChar};
        
        public static string EnsurePathRoot(string path)
        {
            if (string.IsNullOrEmpty(path))
                return path;
            
            path = System.IO.Path.GetFullPath(path);
            
            string minBase = System.Web.Hosting.HostingEnvironment.MapContentPath("");
            string[] minBases = minBase.Split(s_seps);
            
            string[] pathParts = path.Split(s_seps);
            
            int startIndex = 0;
            
            for (; startIndex < minBases.Length; ++startIndex)
            {
                if (startIndex >= pathParts.Length)
                    break;
                
                if (!string.Equals(minBases[startIndex], pathParts[startIndex], System.StringComparison.InvariantCultureIgnoreCase))
                {
                    break;
                }
            } // Next startIndex 
            
            string newPath = minBase;
            
            for (int i = startIndex; i < pathParts.Length; ++i)
            {
                newPath = System.IO.Path.Combine(newPath, pathParts[i]);
            } // Next i 
            
            return newPath;
        } // End Function EnsurePathRoot 
        
        
        /// <summary>
        /// Liest den Inhalt einer Datei als Text nach folgenden Prioritäten:
        /// A) Verzeichnis mit "/Debug/"
        /// B) Verzeichnis mit "/Mandant/"
        /// C) Verzeichnis mit "/Global/"
        /// D) Aus den Eigebettetenressourcen des Assemblys
        /// </summary>
        /// <param name="pFullFilename"></param>
        /// <param name="pMandant"></param>
        /// <param name="pAssembly"></param>
        /// <returns></returns>
        public static string readSingleFile(string pFullFilename, string pMandant, System.Reflection.Assembly pAssembly)
        {
            string tContent = null;

            if (!string.IsNullOrEmpty(pFullFilename) && pFullFilename.Trim() != "")
            {
                string tDirectory = System.IO.Path.GetDirectoryName(pFullFilename) + System.IO.Path.DirectorySeparatorChar;
                string tFilename = System.IO.Path.GetFileName(pFullFilename);
                
                if (tFilename.StartsWith("."))
                {
                    tFilename = System.IO.Path.DirectorySeparatorChar + tFilename.Substring(1);
                }
                else
                {
                    tFilename = System.IO.Path.DirectorySeparatorChar + tFilename;
                }

                if (tDirectory.StartsWith("~"))
                {
                    tDirectory = System.AppDomain.CurrentDomain.BaseDirectory + tDirectory.Substring(1);
                }

                string tPath0 = tDirectory + tFilename; // 'REM: Ohne Mandant/
                string tPath1 = tDirectory + "Debug" + tFilename; // 'REM: Debug/
                string tPath2 = tDirectory + pMandant + tFilename; // 'REM: Mandant/
                string tPath3 = tDirectory + "0" + tFilename; // 'REM: Global/

                // string minBbase = System.IO.Path.GetDirectoryName(typeof(Resourceloader).Assembly.Location);
                // string minBbase = System.Web.Hosting.HostingEnvironment.MapPath("");
                
                tPath0 = EnsurePathRoot(tPath0);
                tPath0 = EnsurePathRoot(tPath1);
                tPath0 = EnsurePathRoot(tPath2);
                tPath0 = EnsurePathRoot(tPath3);
                
                
                
                //REM: Sucht die Datei auf dem Dateisystem
                if (System.IO.File.Exists(tPath0))
                {
                    tContent = System.IO.File.ReadAllText(tPath0);
                }
                else if (System.IO.File.Exists(tPath1))
                {
                    tContent = System.IO.File.ReadAllText(tPath1);
                }
                else if (System.IO.File.Exists(tPath2))
                {
                    tContent = System.IO.File.ReadAllText(tPath2);
                }
                else if (pMandant != "Global" && System.IO.File.Exists(tPath3))
                {
                    tContent = System.IO.File.ReadAllText(tPath3);
                }

                //REM: Sucht die Datei im Assembly
                if (pAssembly != null && string.IsNullOrEmpty(tContent))
                {
                    try
                    {
                        if (tFilename.StartsWith(System.IO.Path.DirectorySeparatorChar.ToString()))
                        {
                            tFilename = "." + tFilename.Substring(1);
                        }

                        if(pAssembly.EntryPoint != null)
                        {
                            string tDefaultNamespace = pAssembly.EntryPoint.DeclaringType.FullName;
                            tDefaultNamespace = tDefaultNamespace.Substring(0, (tDefaultNamespace.IndexOf(".") + 1));
                            tFilename = (tDefaultNamespace + tFilename);
                        }

                        string tMandant = (pAssembly.FullName.Split(',')[0] + ("._" + pMandant));
                        string tGlobal = (pAssembly.FullName.Split(',')[0] + "._0");

                        // string tMandant =  "._" + pMandant;
                        // string tGlobal =  "._0";

                        foreach (string tResourcename in pAssembly.GetManifestResourceNames())
                        {
                            //Mandanten-Überschreibung, wird zurückgegeben falls gefunden
                            // string mandantResourceName = tMandant + tFilename;

                            if (((tResourcename != null) && (tResourcename.EndsWith(tFilename, StringComparison.OrdinalIgnoreCase) && tResourcename.StartsWith(tMandant, StringComparison.OrdinalIgnoreCase))))
                                // if ((tResourcename != null) && (tResourcename.EndsWith(mandantResourceName, StringComparison.OrdinalIgnoreCase)))
                            {
                                System.IO.StreamReader sr = new System.IO.StreamReader(pAssembly.GetManifestResourceStream(tResourcename), Encoding.UTF8);
                                tContent = sr.ReadToEnd();
                                break;
                            }

                            // string globalResourceName = tGlobal + tFilename;

                            //Globale-Version, Suche geht weiter (für Mandanten-Überschreibung)
                            if (((tResourcename != null) && (tResourcename.EndsWith(tFilename, StringComparison.OrdinalIgnoreCase) && tResourcename.StartsWith(tGlobal, StringComparison.OrdinalIgnoreCase))))
                            // if ((tResourcename != null) && (tResourcename.EndsWith(globalResourceName, StringComparison.OrdinalIgnoreCase)))
                            {
                                System.IO.StreamReader sr = new System.IO.StreamReader(pAssembly.GetManifestResourceStream(tResourcename), Encoding.UTF8);
                                tContent = sr.ReadToEnd();
                            }
                        }
                    }
                    catch
                    {
                        //No catch
                    }
                }
            }

            return tContent;
        }

        public static string readSingleFile(string pFullFilename, string pMandant)
        {
            return readSingleFile(pFullFilename, pMandant, typeof(Resourceloader).Assembly);
        }

        public static string readSingleFile(string pFullFilename)
        {
            return readSingleFile(pFullFilename, "0");
        }
        
        #endregion
    }
}
