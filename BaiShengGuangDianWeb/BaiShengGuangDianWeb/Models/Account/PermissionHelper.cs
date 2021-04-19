using System.Collections.Generic;
using System.Linq;
using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.BaseModel;
using ServiceStack;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class PermissionHelper : DataHelper
    {
        private PermissionHelper()
        {
            TableName = Table = "permissions";
        }
        public static string TableName;
        public static readonly PermissionHelper Instance = new PermissionHelper();
        public static Dictionary<int, Permission> PermissionsList;
        public static void LoadConfig()
        {
            PermissionsList = Instance.GetAll<Permission>().ToDictionary(x => x.Id);
        }

        public static bool CheckPermission(string url)
        {
            if (PermissionsList.Any())
            {
                var permission = PermissionsList.Values.FirstOrDefault(x => x.Url == url);
                if (permission != null)
                {
                    var permissionsList = PermissionGroupHelper.PermissionGroupsList
                        .Where(x => AccountInfoHelper.CurrentUser.PermissionsList.Contains(x.Key))
                        .SelectMany(y => y.Value.List.IsNullOrEmpty() ? new int[0] : y.Value.List.Split(",").Select(int.Parse))
                        .Distinct();
                    if (permissionsList.Contains(permission.Id))
                    {
                        //Console.WriteLine(AccountHelper.CurrentUser.Id);
                        return true;
                    }
                }
            }
            return false;
        }

        public static bool CheckPermission(IEnumerable<int> list, int id)
        {
            if (PermissionsList.Any() && list != null && list.Any())
            {
                var permission = PermissionGroupHelper.PermissionGroupsList.Where(x => list.Contains(x.Key)).SelectMany(x => x.Value.PList);
                if (permission.Any() && permission.Contains(id))
                {
                    return true;
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

        public static void UpdateOrder()
        {
            var permissionsList = PermissionGroupHelper.PermissionGroupsList.Values.OrderBy(x => x.Id);
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
