using Microsoft.Extensions.Configuration;
using ModelBase.Base.Dapper;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;

namespace BaiShengGuangDianWeb.Base.Server
{
    public class ServerConfig
    {
        public static DataBase WebDb;
        public static string PasswordKey;

        public static void Init(IConfiguration configuration)
        {
            WebDb = new DataBase(configuration.GetConnectionString("WebDb"));
            PasswordKey = configuration.GetAppSettings<string>("PasswordKey");

            Log.InfoFormat("ServerConfig Done");
        }
    }
}
