using BaiShengGuangDianWeb.Base.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace BaiShengGuangDianWeb.Base.Chat
{
    public class ChatHelper
    {
        private static bool _isRun = false;
        private static Timer _clearConnectionId = new Timer(ClearConnectionId, null, 5000, 5 * 60 * 1000);

        private static void ClearConnectionId(object state)
        {
            if (_isRun)
            {
                return;
            }

            _isRun = true;
            var keys = GetAllKeys().Where(x => x.Contains(_redisPre));
            foreach (var key in keys)
            {
                var connectionInfos = ServerConfig.RedisHelper.List_GetList<ConnectionInfo>(key);

                foreach (var connectionInfo in connectionInfos)
                {
                    if (connectionInfo.ExpireTime < DateTime.Now)
                    {
                        ServerConfig.RedisHelper.List_Remove(key, connectionInfo);
                    }
                }
            }

            _isRun = false;
        }

        private static string _redisPre = "Chat:";
        private static int _hour = 24;
        private static string GetKey(int accountId)
        {
            return _redisPre + accountId;
        }

        public static void AddConnectionId(int accountId, string connectionId)
        {
            var key = GetKey(accountId);
            var connectionInfo = new ConnectionInfo
            {
                AccountId = accountId,
                ConnectionId = connectionId,
                ExpireTime = DateTime.Now.AddHours(_hour)
            };
            ServerConfig.RedisHelper.List_Add(key, connectionInfo, TimeSpan.FromHours(_hour));
        }

        public static IEnumerable<ConnectionInfo> GetSingleConnectionId(int accountId = 0)
        {
            try
            {
                var key = GetKey(accountId);
                return ServerConfig.RedisHelper.List_GetList<ConnectionInfo>(key).Where(x => x.ExpireTime > DateTime.Now);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static IEnumerable<ConnectionInfo> GetAllConnectionId()
        {
            try
            {
                var list = new List<ConnectionInfo>();
                var keys = GetAllKeys();
                foreach (var key in keys)
                {
                    list.AddRange(ServerConfig.RedisHelper.List_GetList<ConnectionInfo>(key));
                }

                return list.Where(x => x.ExpireTime > DateTime.Now);
            }
            catch (Exception)
            {
                return null;
            }
        }

        private static IEnumerable<string> GetAllKeys()
        {
            try
            {
                return ServerConfig.RedisHelper.GetAllKeys();
            }
            catch (Exception)
            {
                return null;
            }
        }
    }

    public class ConnectionInfo
    {
        public int AccountId { get; set; }
        public string ConnectionId { get; set; }
        public DateTime ExpireTime { get; set; }
    }
}
