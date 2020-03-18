using System.Collections.Generic;
using System.Linq;
using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class ManagementServerHelper
    {
        public static Dictionary<int, ManagementServer> ManagementServerList;

        public static string TableName = "management_server";

        public static void LoadConfig()
        {
            ManagementServerList = ServerConfig.WebDb.Query<ManagementServer>("SELECT * FROM `management_server`;").ToDictionary(x => x.Id);
        }

        public static ManagementServer Get(int id)
        {
            return ManagementServerList.ContainsKey(id) ? ManagementServerList[id] : null;
        }

    }
}
