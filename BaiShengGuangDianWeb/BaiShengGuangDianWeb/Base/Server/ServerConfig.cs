using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.Extensions.Configuration;
using ModelBase.Base.Dapper;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Base.Server
{
    public class ServerConfig
    {
        public static DataBase WebDb;
        public static string PasswordKey;
        public static string EmailAccount;
        public static string EmailPassword;
        public static RedisHelper RedisHelper;
        public static Dictionary<string, Action> Loads;
        public static void Init(IConfiguration configuration)
        {
            WebDb = new DataBase(configuration.GetConnectionString("WebDb"));
            PasswordKey = configuration.GetAppSettings<string>("PasswordKey");
            EmailAccount = configuration.GetAppSettings<string>("EmailAccount");
            EmailPassword = configuration.GetAppSettings<string>("EmailPassword");
            RedisHelper.Init(configuration);
            Loads = new Dictionary<string, Action>
            {
                {PermissionHelper.TableName, PermissionHelper.LoadConfig},
                {ManagementServerHelper.TableName, ManagementServerHelper.LoadConfig},
            };

            foreach (var action in Loads.Values)
            {
                action();
            }

            //const string baseDic = "File";
            //foreach (var entity in EnumHelper.EnumToList<FileEnum>())
            //{
            //    var fileEnum = (FileEnum)entity.EnumValue;
            //    FilePath.AddConfig(fileEnum, Path.Combine(baseDic, entity.EnumName));
            //}

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
