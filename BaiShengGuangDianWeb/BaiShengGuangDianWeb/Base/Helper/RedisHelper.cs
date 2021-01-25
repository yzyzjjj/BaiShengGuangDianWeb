using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BaiShengGuangDianWeb.Base.Server;
using Microsoft.Extensions.Configuration;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using ServiceStack;
using ServiceStack.Redis;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class RedisHelper
    {
        //public static readonly RedisHelper Instance = new RedisHelper();
        private static PooledRedisClientManager _pool;
        private static dynamic _redisConfig;
        public RedisHelper()
        {

        }

        public static void Init(IConfiguration configuration)
        {
            var redisConfigStr = configuration.GetSection("RedisConfig");
            if (redisConfigStr == null)
            {
                throw new Exception("Redis 配置缺失");
            }

            _redisConfig = new
            {
                WriteServerConStr = redisConfigStr["WriteServerConStr"],
                ReadServerConStr = redisConfigStr["ReadServerConStr"],
                RedisKey = redisConfigStr["RedisKey"] ?? "",
                MaxWritePoolSize = !redisConfigStr["MaxWritePoolSize"].IsNullOrEmpty() ? int.Parse(redisConfigStr["MaxWritePoolSize"]) : 5,
                MaxReadPoolSize = !redisConfigStr["MaxReadPoolSize"].IsNullOrEmpty() ? int.Parse(redisConfigStr["MaxReadPoolSize"]) : 5,
                AutoStart = redisConfigStr["AutoStart"].IsNullOrEmpty() || bool.Parse(redisConfigStr["AutoStart"]),
                DefaultDb = !redisConfigStr["DefaultDb"].IsNullOrEmpty() ? int.Parse(redisConfigStr["DefaultDb"]) : 0,
                ExpireTime = !redisConfigStr["ExpireTime"].IsNullOrEmpty() ? int.Parse(redisConfigStr["ExpireTime"]) : 1800,
                RecordeLog = redisConfigStr["RecordeLog"].IsNullOrEmpty() || bool.Parse(redisConfigStr["RecordeLog"]),
            };

            var writeServerConStr = _redisConfig.WriteServerConStr.Split(',');
            var readServerConStr = _redisConfig.ReadServerConStr.Split(',');
            RedisConfig.VerifyMasterConnections = false;
            _pool = new PooledRedisClientManager(writeServerConStr, readServerConStr,
                new RedisClientManagerConfig
                {
                    MaxWritePoolSize = _redisConfig.MaxWritePoolSize,
                    MaxReadPoolSize = _redisConfig.MaxReadPoolSize,
                    AutoStart = _redisConfig.AutoStart,
                    DefaultDb = _redisConfig.DefaultDb,
                });

            #region Sub
            //1.查看
            //  PUBSUB channels
            // 2.发布
            //  PUBLISH bxfq reload_table: all
            if (!((string)_redisConfig.RedisKey).IsNullOrEmpty())
            {
                Task.Run(() =>
                {
                    var success = false;
                    var subDoing = false;
                    using (var redisClient = _pool.GetClient())
                    {
                        using (var sub = redisClient.CreateSubscription())
                        {
                            //接受到消息时
                            sub.OnMessage = (channel, msg) =>
                            {
                                var m = $"时间：{DateTime.Now.ToStr()}, 从频道：{channel}上接受到消息：{msg}";
                                Console.WriteLine();
                                Log.Debug(m);
                                var data = msg.Split(':');
                                if (data.Length == 2)
                                {
                                    switch (data[0])
                                    {
                                        case "reload_table":
                                            ServerConfig.ReloadConfig(data[1]);
                                            break;
                                        case "reload_param":
                                            break;
                                        default:
                                            Log.ErrorFormat("UnKnown CMD {0}", msg);
                                            break;
                                    }
                                }
                                else
                                {
                                    Log.ErrorFormat("UnKnown data {0}", msg);
                                }
                            };

                            //订阅频道时
                            sub.OnSubscribe = (channel) =>
                            {
                                var m = $"时间：{DateTime.Now.ToStr()}, 订阅：{channel}";
                                Console.WriteLine(m);
                                Log.Debug(m);
                                success = true;
                                subDoing = false;
                            };
                            //取消订阅频道时
                            sub.OnUnSubscribe = (channel) =>
                            {
                                var m = $"时间：{DateTime.Now.ToStr()}, 取消订阅：{channel}";
                                Console.WriteLine(m);
                                Log.Debug(m);
                                success = false;
                                subDoing = false;
                            };
                            while (true)
                            {
                                if (subDoing || success)
                                    continue;
                                subDoing = true;
                                try
                                {
                                    sub.SubscribeToChannels(_redisConfig.RedisKey);
                                }
                                catch (Exception e)
                                {
                                    Log.Debug(e);
                                    success = false;
                                    subDoing = false;
                                }
                                Thread.Sleep(5 * 1000);
                            }
                        }
                    }
                });
            }
            #endregion

            Log.InfoFormat("Redis连接正常,Master:{0},Slave:{1}", _redisConfig.WriteServerConStr,
                _redisConfig.ReadServerConStr);
        }
        #region 泛型

        public static void Set<T>(string key, T value, DateTime expiry)
        {
            if (value == null)
            {
                return;
            }

            if (expiry <= DateTime.Now)
            {
                Remove(key);
                return;
            }

            //使用GetCacheClient() 来获取一个连接，他会在写的时候调用GetClient获取连接，读的时候调用GetReadOnlyClient获取连接，这样可以做到读写分离，从而利用redis的主从复制功能
            using (var r = _pool.GetClient())
            {
                try
                {
                    r.Set(key, value, expiry - DateTime.Now);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                }
            }
        }

        /// <summary>
        ///     插入一条记录，过期时间为默认配置
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="key"></param>
        /// <param name="value"></param>
        public static void Set<T>(string key, T value)
        {
            Set(key, value, TimeSpan.FromSeconds(_redisConfig.ExpireTime));
        }

        public static void Set<T>(string key, T value, TimeSpan slidingExpiration)
        {
            if (value == null)
            {
                return;
            }

            if (slidingExpiration.TotalSeconds <= 0)
            {
                Remove(key);
                return;
            }

            using (var r = _pool.GetClient())
            {
                try
                {
                    r.Set(key, value, slidingExpiration);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                }
            }
        }

        public static void SetForever<T>(string key, T value)
        {
            if (value == null)
            {
                return;
            }

            using (var r = _pool.GetClient())
            {
                try
                {
                    r.Set(key, value);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                }
            }
        }

        public static bool SetIfNotExist(string key, string value)
        {
            using (var r = _pool.GetClient())
            {
                try
                {
                    return r.SetValueIfNotExists(key, value);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return false;
                }
            }
        }

        public static IEnumerable<string> GetAllKeys()
        {
            using (var r = _pool.GetClient())
            {
                try
                {
                    return r.GetAllKeys();
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return null;
                }
            }
        }
        public static T Get<T>(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                return default(T);
            }

            T obj;

            using (var r = _pool.GetReadOnlyClient())
            {
                try
                {
                    obj = r.Get<T>(key);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    obj = default(T);
                }
            }
            return obj;
        }

        public static bool Remove(string key)
        {
            using (var r = _pool.GetClient())
            {
                try
                {
                    return r.Remove(key);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return false;
                }
            }
        }

        public static bool Exists(string key)
        {
            using (var r = _pool.GetReadOnlyClient())
            {
                try
                {
                    return r.ContainsKey(key);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return false;
                }
            }
        }

        public static IDictionary<string, T> GetAll<T>(IEnumerable<string> keys) where T : class
        {
            if (keys == null || !keys.Any())
            {
                return null;
            }

            keys = keys.Where(k => !string.IsNullOrWhiteSpace(k));

            if (keys.Count() == 1)
            {
                var obj = Get<T>(keys.Single());

                if (obj != null)
                {
                    return new Dictionary<string, T> { { keys.Single(), obj } };
                }

                return null;
            }

            using (var r = _pool.GetReadOnlyClient())
            {
                return r.GetAll<T>(keys);
            }
        }

        #endregion

        #region Redis数据类型List

        public static void List_Add<T>(string key, T t, TimeSpan slidingExpiration = default(TimeSpan))
        {
            var expTime = slidingExpiration == default(TimeSpan) ? TimeSpan.FromSeconds(_redisConfig.ExpireTime) : slidingExpiration;
            using (var redis = _pool.GetClient())
            {
                try
                {
                    var redisTypedClient = redis.As<T>();
                    redisTypedClient.AddItemToList(redisTypedClient.Lists[key], t);
                    SetExpireIn(key, expTime);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                }
            }
        }

        public static void List_AddRange<T>(string key, IEnumerable<T> values, TimeSpan slidingExpiration = default(TimeSpan))
        {
            var expTime = slidingExpiration == default(TimeSpan) ? TimeSpan.FromSeconds(_redisConfig.ExpireTime) : slidingExpiration;
            using (var redis = _pool.GetClient())
            {
                try
                {
                    var redisTypedClient = redis.As<T>();
                    redisTypedClient.Lists[key].AddRange(values);
                    SetExpireIn(key, expTime);

                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                }
            }
        }

        public static bool List_Remove<T>(string key, T t)
        {
            using (var redis = _pool.GetClient())
            {
                try
                {
                    var redisTypedClient = redis.As<T>();
                    return redisTypedClient.RemoveItemFromList(redisTypedClient.Lists[key], t) > 0;

                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return true;
                }
            }
        }

        public static void List_RemoveAll<T>(string key)
        {
            using (var redis = _pool.GetClient())
            {

                try
                {
                    var redisTypedClient = redis.As<T>();
                    redisTypedClient.Lists[key].RemoveAll();
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                }
            }
        }

        public static long List_Count(string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                try
                {
                    return redis.GetListCount(key);

                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return 0;
                }
            }
        }

        public static List<T> List_GetRange<T>(string key, int start, int count)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                try
                {
                    var c = redis.As<T>();
                    return c.Lists[key].GetRange(start, start + count - 1);
                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return new List<T>();
                }
            }
        }

        public static List<T> List_GetList<T>(string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                try
                {
                    var c = redis.As<T>();
                    return c.Lists[key].GetRange(0, c.Lists[key].Count);

                }
                catch (Exception ex)
                {
                    Log.ErrorFormat("Redis连接出错：{0}", ex);
                    return new List<T>();
                }
            }
        }

        public static List<T> List_GetList<T>(string key, int pageIndex, int pageSize)
        {
            var start = pageSize * (pageIndex - 1);
            return List_GetRange<T>(key, start, pageSize);
        }

        #endregion

        #region Redis数据类型哈希Hash

        #region 添加

        /// <summary>
        ///     向hashid集合中添加多个key/value
        /// </summary>
        public static void SetRangeInHash(string key, IEnumerable<KeyValuePair<string, string>> entries)
        {
            using (var redis = _pool.GetClient())
            {
                redis.SetRangeInHash(key, entries);
            }
        }

        /// <summary>
        ///     向hashid集合中添加key/value
        /// </summary>
        public static bool SetEntryInHash(string hashid, string key, string value)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.SetEntryInHash(hashid, key, value);
            }
        }

        /// <summary>
        ///     如果hashid集合中存在key/value则不添加返回false，如果不存在在添加key/value,返回true
        /// </summary>
        public static bool SetEntryInHashIfNotExists(string hashid, string key, string value)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.SetEntryInHashIfNotExists(hashid, key, value);
            }
        }

        /// <summary>
        ///     存储对象T t到hash集合中
        /// </summary>
        public static void StoreAsHash<T>(T t)
        {
            using (var redis = _pool.GetClient())
            {
                redis.StoreAsHash(t);
            }
        }

        #endregion

        #region 获取

        /// <summary>
        ///     获取对象T中ID为id的数据。
        /// </summary>
        public static T GetFromHash<T>(object id)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetFromHash<T>(id);
            }
        }

        /// <summary>
        ///     获取所有hashid数据集的key/value数据集合
        /// </summary>
        public static Dictionary<string, string> GetAllEntriesFromHash(string hashid)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetAllEntriesFromHash(hashid);
            }
        }

        /// <summary>
        ///     获取hashid数据集中的数据总数
        /// </summary>
        public static long GetHashCount(string hashid)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetHashCount(hashid);
            }
        }

        /// <summary>
        ///     获取hashid数据集中所有key的集合
        /// </summary>
        public static List<string> GetHashKeys(string hashid)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetHashKeys(hashid);
            }
        }

        /// <summary>
        ///     获取hashid数据集中的所有value集合
        /// </summary>
        public static List<string> GetHashValues(string hashid)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetHashValues(hashid);
            }
        }

        /// <summary>
        ///     获取hashid数据集中，key的value数据
        /// </summary>
        public static string GetValueFromHash(string hashid, string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetValueFromHash(hashid, key);
            }
        }

        /// <summary>
        ///     获取hashid数据集中，多个keys的value集合
        /// </summary>
        public static List<string> GetValuesFromHash(string hashid, string[] keys)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetValuesFromHash(hashid, keys);
            }
        }

        #endregion


        /// <summary>
        ///     删除hashid数据集中的key数据
        /// </summary>
        public static bool RemoveEntryFromHash(string hashid, string key)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.RemoveEntryFromHash(hashid, key);
            }
        }

        #region 其它

        /// <summary>
        ///     判断hashid数据集中是否存在key的数据
        /// </summary>
        public static bool HashContainsEntry(string hashid, string key)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.HashContainsEntry(hashid, key);
            }
        }

        #endregion

        #endregion

        #region Redis数据类型有序集合Zset

        #region 添加

        /// <summary>
        ///     添加key/value，默认分数是从1.多*10的9次方以此递增的,自带自增效果
        /// </summary>
        public static bool AddItemToSortedSet(string key, string value)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.AddItemToSortedSet(key, value);
            }
        }

        /// <summary>
        ///     添加key/value,并设置value的分数
        /// </summary>
        public static bool AddItemToSortedSet(string key, string value, double score)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.AddItemToSortedSet(key, value, score);
            }
        }

        /// <summary>
        ///     为key添加values集合，values集合中每个value的分数设置为score
        /// </summary>
        public static bool AddRangeToSortedSet(string key, List<string> values, double score)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.AddRangeToSortedSet(key, values, score);
            }
        }

        /// <summary>
        ///     为key添加values集合，values集合中每个value的分数设置为score
        /// </summary>
        public static bool AddRangeToSortedSet(string key, List<string> values, long score)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.AddRangeToSortedSet(key, values, score);
            }
        }

        #endregion

        #region 获取

        /// <summary>
        ///     获取key的所有集合
        /// </summary>
        public static List<string> GetAllItemsFromSortedSet(string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetAllItemsFromSortedSet(key);
            }
        }

        /// <summary>
        ///     获取key的所有集合，倒叙输出
        /// </summary>
        public static List<string> GetAllItemsFromSortedSetDesc(string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetAllItemsFromSortedSetDesc(key);
            }
        }

        /// <summary>
        ///     获取可以的说有集合，带分数
        /// </summary>
        public static IDictionary<string, double> GetAllWithScoresFromSortedSet(string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetAllWithScoresFromSortedSet(key);
            }
        }

        /// <summary>
        ///     获取key为value的下标值
        /// </summary>
        public static long GetItemIndexInSortedSet(string key, string value)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetItemIndexInSortedSet(key, value);
            }
        }

        /// <summary>
        ///     倒叙排列获取key为value的下标值
        /// </summary>
        public static long GetItemIndexInSortedSetDesc(string key, string value)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetItemIndexInSortedSetDesc(key, value);
            }
        }

        /// <summary>
        ///     获取key为value的分数
        /// </summary>
        public static double GetItemScoreInSortedSet(string key, string value)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetItemScoreInSortedSet(key, value);
            }
        }

        /// <summary>
        ///     获取key所有集合的数据总数
        /// </summary>
        public static long GetSortedSetCount(string key)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetSortedSetCount(key);
            }
        }

        /// <summary>
        ///     key集合数据从分数为fromscore到分数为toscore的数据总数
        /// </summary>
        public static long GetSortedSetCount(string key, double fromScore, double toScore)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetSortedSetCount(key, fromScore, toScore);
            }
        }

        /// <summary>
        ///     获取key集合从高分到低分排序数据，分数从fromscore到分数为toscore的数据
        /// </summary>
        public static List<string> GetRangeFromSortedSetByHighestScore(string key, double fromscore, double toscore)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeFromSortedSetByHighestScore(key, fromscore, toscore);
            }
        }

        /// <summary>
        ///     获取key集合从低分到高分排序数据，分数从fromscore到分数为toscore的数据
        /// </summary>
        public static List<string> GetRangeFromSortedSetByLowestScore(string key, double fromscore, double toscore)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeFromSortedSetByLowestScore(key, fromscore, toscore);
            }
        }

        /// <summary>
        ///     获取key集合从高分到低分排序数据，分数从fromscore到分数为toscore的数据，带分数
        /// </summary>
        public static IDictionary<string, double> GetRangeWithScoresFromSortedSetByHighestScore(string key, double fromscore,
            double toscore)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeWithScoresFromSortedSetByHighestScore(key, fromscore, toscore);
            }
        }

        /// <summary>
        ///     获取key集合从低分到高分排序数据，分数从fromscore到分数为toscore的数据，带分数
        /// </summary>
        public static IDictionary<string, double> GetRangeWithScoresFromSortedSetByLowestScore(string key, double fromscore,
            double toscore)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeWithScoresFromSortedSetByLowestScore(key, fromscore, toscore);
            }
        }

        /// <summary>
        ///     获取key集合数据，下标从fromRank到分数为toRank的数据
        /// </summary>
        public static List<string> GetRangeFromSortedSet(string key, int fromRank, int toRank)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeFromSortedSet(key, fromRank, toRank);
            }
        }

        /// <summary>
        ///     获取key集合倒叙排列数据，下标从fromRank到分数为toRank的数据
        /// </summary>
        public static List<string> GetRangeFromSortedSetDesc(string key, int fromRank, int toRank)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeFromSortedSetDesc(key, fromRank, toRank);
            }
        }

        /// <summary>
        ///     获取key集合数据，下标从fromRank到分数为toRank的数据，带分数
        /// </summary>
        public static IDictionary<string, double> GetRangeWithScoresFromSortedSet(string key, int fromRank, int toRank)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeWithScoresFromSortedSet(key, fromRank, toRank);
            }
        }

        /// <summary>
        ///     获取key集合倒叙排列数据，下标从fromRank到分数为toRank的数据，带分数
        /// </summary>
        public static IDictionary<string, double> GetRangeWithScoresFromSortedSetDesc(string key, int fromRank, int toRank)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.GetRangeWithScoresFromSortedSetDesc(key, fromRank, toRank);
            }
        }

        #endregion

        #region 删除

        /// <summary>
        ///     删除key为value的数据
        /// </summary>
        public static bool RemoveItemFromSortedSet(string key, string value)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.RemoveItemFromSortedSet(key, value);
            }
        }

        /// <summary>
        ///     删除下标从minRank到maxRank的key集合数据
        /// </summary>
        public static long RemoveRangeFromSortedSet(string key, int minRank, int maxRank)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.RemoveRangeFromSortedSet(key, minRank, maxRank);
            }
        }

        /// <summary>
        ///     删除分数从fromscore到toscore的key集合数据
        /// </summary>
        public static long RemoveRangeFromSortedSetByScore(string key, double fromscore, double toscore)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.RemoveRangeFromSortedSetByScore(key, fromscore, toscore);
            }
        }

        /// <summary>
        ///     删除key集合中分数最大的数据
        /// </summary>
        public static string PopItemWithHighestScoreFromSortedSet(string key)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.PopItemWithHighestScoreFromSortedSet(key);
            }
        }

        /// <summary>
        ///     删除key集合中分数最小的数据
        /// </summary>
        public static string PopItemWithLowestScoreFromSortedSet(string key)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.PopItemWithLowestScoreFromSortedSet(key);
            }
        }

        #endregion

        #region 其它

        /// <summary>
        ///     判断key集合中是否存在value数据
        /// </summary>
        public static bool SortedSetContainsItem(string key, string value)
        {
            using (var redis = _pool.GetReadOnlyClient())
            {
                return redis.SortedSetContainsItem(key, value);
            }
        }

        /// <summary>
        ///     为key集合值为value的数据，分数加scoreby，返回相加后的分数
        /// </summary>
        public static double IncrementItemInSortedSet(string key, string value, double scoreBy)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.IncrementItemInSortedSet(key, value, scoreBy);
            }
        }

        /// <summary>
        ///     获取keys多个集合的交集，并把交集添加的newkey集合中，返回交集数据的总数
        /// </summary>
        public static long StoreIntersectFromSortedSets(string newkey, string[] keys)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.StoreIntersectFromSortedSets(newkey, keys);
            }
        }

        /// <summary>
        ///     获取keys多个集合的并集，并把并集数据添加到newkey集合中，返回并集数据的总数
        /// </summary>
        public static long StoreUnionFromSortedSets(string newkey, string[] keys)
        {
            using (var redis = _pool.GetClient())
            {
                return redis.StoreUnionFromSortedSets(newkey, keys);
            }
        }

        #endregion

        #endregion

        #region 杂项,设置缓存时间

        /// <summary>
        ///     设置缓存过期
        /// </summary>
        /// <param name="key"></param>
        /// <param name="datetime"></param>
        public static void SetExpireAt(string key, DateTime datetime)
        {
            using (var redis = _pool.GetClient())
            {
                redis.ExpireEntryAt(key, datetime);
            }
        }

        /// <summary>
        ///     设置缓存过期
        /// </summary>
        /// <param name="key"></param>
        /// <param name="timeSpan"></param>
        public static void SetExpireIn(string key, TimeSpan timeSpan)
        {
            using (var redis = _pool.GetClient())
            {
                redis.ExpireEntryIn(key, timeSpan);
            }
        }

        public static void FlushDB()
        {
            using (var redis = _pool.GetClient())
            {
                redis.FlushDb();
            }
        }

        public static void FlushAll()
        {
            using (var redis = _pool.GetClient())
            {
                redis.FlushAll();
            }
        }

        #endregion

        public static void Publish(string channel, string message)
        {
            using (var redis = _pool.GetClient())
            {
                redis.PublishMessage(channel, message);
                //redis.CreateSubscription();
            }
        }

        public static void PublishToTable(string channel = "", string table = "all")
        {
            if (channel.IsNullOrEmpty())
            {
                channel = _redisConfig.RedisKey;
            }

            var message = string.Format("reload_table:{0}", table);
            using (var redis = _pool.GetClient())
            {
                redis.PublishMessage(channel, message);
                //redis.CreateSubscription();
            }
        }
    }
}