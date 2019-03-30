using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.Extensions.Configuration;
using ModelBase.Base.Dapper;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using System;
using System.Collections.Generic;

namespace BaiShengGuangDianWeb.Base.Server
{
    public class ServerConfig
    {
        public static DataBase WebDb;
        public static string PasswordKey;
        public static RedisCacheHelper RedisHelper;
        public static Dictionary<string, Action> Loads;
        public static void Init(IConfiguration configuration)
        {
            WebDb = new DataBase(configuration.GetConnectionString("WebDb"));
            PasswordKey = configuration.GetAppSettings<string>("PasswordKey");
            RedisHelper = new RedisCacheHelper(configuration);
            Loads = new Dictionary<string, Action>
            {
                {PermissionHelper.TableName, PermissionHelper.LoadConfig},
            };

            foreach (var action in Loads.Values)
            {
                action();
            }
            Log.InfoFormat("ServerConfig Done");
        }

        public static void ReloadConfig(string tableName)
        {
            if (tableName != "all" && !Loads.ContainsKey(tableName))
            {
                return;
            }

            if (tableName == "all")
            {
                foreach (var action in Loads.Values)
                {
                    action();
                }
            }
            else
            {
                if (Loads.ContainsKey(tableName))
                {
                    Loads[tableName]();
                }
            }
        }
    }
}
