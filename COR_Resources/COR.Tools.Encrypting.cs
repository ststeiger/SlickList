namespace _COR.Tools
{
    public class Encrypting
    {
        public static string Key = TestPlotly.SecretManager.GetSecret<string>("Des3Password");
        
        
        public static string Crypt(string SourceText)
        {
            using (System.Security.Cryptography.TripleDESCryptoServiceProvider TripleDes = new System.Security.Cryptography.TripleDESCryptoServiceProvider())
            {
                using (System.Security.Cryptography.MD5CryptoServiceProvider HashMD5 = new System.Security.Cryptography.MD5CryptoServiceProvider())
                {
                    TripleDes.Key = HashMD5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(Key));
                    TripleDes.Mode = System.Security.Cryptography.CipherMode.ECB;
                    System.Security.Cryptography.ICryptoTransform desdencrypt = TripleDes.CreateEncryptor();
                    byte[] buff = System.Text.Encoding.UTF8.GetBytes(SourceText);

                    return System.Convert.ToBase64String(desdencrypt.TransformFinalBlock(buff, 0, buff.Length));
                }
            }

            return string.Empty;
        }

        public static string DeCrypt(string SourceText)
        {
            string strReturnValue = "";

            if (string.IsNullOrEmpty(SourceText))
                return strReturnValue;

            using (System.Security.Cryptography.TripleDESCryptoServiceProvider Des = new System.Security.Cryptography.TripleDESCryptoServiceProvider())
            {
                using (System.Security.Cryptography.MD5CryptoServiceProvider HashMD5 = new System.Security.Cryptography.MD5CryptoServiceProvider())
                {
                    Des.Key = HashMD5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(Key));
                    Des.Mode = System.Security.Cryptography.CipherMode.ECB;

                    System.Security.Cryptography.ICryptoTransform desdencrypt = Des.CreateDecryptor();
                    byte[] buff = System.Convert.FromBase64String(SourceText);
                    strReturnValue = System.Text.Encoding.UTF8.GetString
                    (desdencrypt.TransformFinalBlock(buff, 0, buff.Length));
                }
            }

            return strReturnValue;
        }
    }
}
