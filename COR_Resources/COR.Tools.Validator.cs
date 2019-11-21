using System;

namespace _COR.Tools
{
    class Validator
    {
        public static bool dateBetween(DateTime pSource, DateTime pDateFrom, DateTime pDateTo)
        {
            return pSource.CompareTo(pDateFrom) >= 0 && pSource.CompareTo(pDateTo) <= 0;
        }

        public static bool isValidDate(DateTime pValue)
        {
            if (pValue != null)
                return dateBetween(pValue, (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue, (DateTime)System.Data.SqlTypes.SqlDateTime.MaxValue);

            return false;
        }

        public static bool isValidDate(string pValue)
        {
            if (pValue != null)
                return isValidDate(pValue);

            return false;
        }

        public static bool isValidDate(object pValue)
        {
            if (pValue != null && !string.IsNullOrEmpty(pValue.ToString()))
                return isValidDate(pValue.ToString());

            return false;
        }

        public static bool isValidGUID(Guid pGUID)
        {
            return pGUID != null && !pGUID.Equals(Guid.Empty);
        }

        public static bool isValidGUID(string pGUID)
        {
            return isValidGUID(pGUID) && !new Guid(pGUID).Equals(Guid.Empty);
        }

        public static bool isValidGUID(object pGUID)
        {
            return pGUID != null && isValidGUID(pGUID.ToString());
        }
    }
}
