using System;
using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class PermissionHelper
    {
        public static Dictionary<int, Permission> PermissionsList;

        public static string TableName = "permissions_group";

        public static void LoadConfig()
        {
            PermissionsList = ServerConfig.WebDb.Query<Permission>("SELECT * FROM `permissions_group` WHERE IsDelete = 0;").ToDictionary(x => x.Id);
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
                        Console.WriteLine(AccountHelper.CurrentUser.Id);
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

        public static IEnumerable<int> GetDefault()
        {
            return PermissionsList.Values.Where(x => x.Type == 0).Select(x => x.Id);
        }

        public static void Delete(IEnumerable<int> list)
        {
            ServerConfig.WebDb.Execute("UPDATE permissions_group SET  `IsDelete` = 1 WHERE `Id` IN @Id AND Type != 0;", new { Id = list });
        }

    }
}
