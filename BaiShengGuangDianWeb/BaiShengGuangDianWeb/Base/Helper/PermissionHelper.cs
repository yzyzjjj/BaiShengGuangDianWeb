using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class PermissionHelper
    {
        public static Dictionary<int, Permission> PermissionsList;
        public static Dictionary<int, Permission> PermissionsDetailList;

        public static string TableName = "permissions_group";

        public static void LoadConfig()
        {
            PermissionsList = ServerConfig.WebDb.Query<Permission>("SELECT * FROM `permissions_group` WHERE IsDelete = 0;").ToDictionary(x => x.Id);
            PermissionsDetailList = ServerConfig.WebDb.Query<Permission>("SELECT * FROM `permissions` WHERE IsDelete = 0;").ToDictionary(x => x.Id);
            //UpdateOrder();
        }

        public static bool CheckPermission(string url)
        {
            if (PermissionsDetailList.Any())
            {
                var permission = PermissionsDetailList.Values.FirstOrDefault(x => x.Url == url);
                if (permission != null)
                {
                    var permissionsDetailList = PermissionsList
                        .Where(x => AccountHelper.CurrentUser.PermissionsList.Contains(x.Key))
                        .SelectMany(y => y.Value.List.IsNullOrEmpty() ? new int[0] : y.Value.List.Split(",").Select(int.Parse))
                        .Distinct();
                    if (permissionsDetailList.Contains(permission.Id))
                    {
                        //Console.WriteLine(AccountHelper.CurrentUser.Id);
                        return true;
                    }
                }
            }
            return false;
        }

        public static Permission Get(int id)
        {
            return PermissionsDetailList.ContainsKey(id) ? PermissionsDetailList[id] : null;
        }

        public static Permission Get(string url)
        {
            return PermissionsDetailList.Values.FirstOrDefault(x => x.Url == url);
        }

        public static IEnumerable<int> GetDefault()
        {
            return PermissionsList.Values.Where(x => x.Type == 0).Select(x => x.Id);
        }

        public static void Delete(IEnumerable<int> list)
        {
            ServerConfig.WebDb.Execute("UPDATE permissions_group SET  `IsDelete` = 1 WHERE `Id` IN @Id AND Type != 0;", new { Id = list });
        }

        public static void UpdateOrder()
        {
            var permissionsList = PermissionsList.Values.OrderBy(x => x.Id);
            foreach (var parent in permissionsList.GroupBy(x => x.Parent).Select(z => z.Key))
            {
                var levels = permissionsList.Where(x => x.Parent == parent).GroupBy(y => y.Level).Select(z => z.Key);
                foreach (var level in levels)
                {
                    var i = 1;
                    var permissions = permissionsList.Where(x => x.Parent == parent && x.Level == level);
                    foreach (var permission in permissions)
                    {
                        permission.Order = i++;
                    }
                }
            }

            ServerConfig.WebDb.Execute("UPDATE `permissions_group` SET `Order` = @Order WHERE Id = @Id AND `Order` = 0;", permissionsList);
        }
    }
}
