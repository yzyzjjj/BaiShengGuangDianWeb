using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class PermissionHelper
    {
        public static Dictionary<int, Permission> PermissionsList;

        public static string TableName = "permissions";

        public static void LoadConfig()
        {
            PermissionsList = ServerConfig.WebDb.Query<Permission>("SELECT * FROM `permissions` WHERE IsDelete = 0;").ToDictionary(x => x.Id);
        }

        public static bool CheckPermission(string url)
        {
            if (PermissionsList.Any())
            {
                var permission = PermissionsList.Values.FirstOrDefault(x => x.Url == url);
                if (permission != null)
                {
                    if (AccountHelper.CurrentUser.PermissionsList.Contains(permission.Id))
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        public static Permission Get(int id)
        {
            return PermissionsList.ContainsKey(id) ? PermissionsList[id] : null;
        }

        public static Permission Get(string url)
        {
            return PermissionsList.Values.FirstOrDefault(x => x.Url == url);
        }
    }
}
