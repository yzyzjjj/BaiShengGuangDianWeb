using System.Collections.Generic;
using System.Linq;
using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Models.BaseModel;
using ServiceStack;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class PermissionGroupHelper : DataHelper
    {
        private PermissionGroupHelper()
        {
            TableName = Table = "permissions_group";
        }
        public static string TableName;
        public static readonly PermissionGroupHelper Instance = new PermissionGroupHelper();
        public static Dictionary<int, PermissionGroup> PermissionGroupsList;

        public static void LoadConfig()
        {
            PermissionGroupsList = Instance.GetAll<PermissionGroup>().ToDictionary(x => x.Id);
        }

        public static PermissionGroup Get(int id)
        {
            return PermissionGroupsList.ContainsKey(id) ? PermissionGroupsList[id] : null;
        }

        public static PermissionGroup Get(string url)
        {
            return PermissionGroupsList.Values.FirstOrDefault(x => x.Url == url);
        }

        public static IEnumerable<int> GetDefault()
        {
            return PermissionGroupsList.Values.Where(x => x.Type == 0).Select(x => x.Id);
        }
    }
}
