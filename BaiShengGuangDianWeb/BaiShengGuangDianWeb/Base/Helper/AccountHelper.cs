using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using ModelBase.Base.Utils;
using ServiceStack;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class AccountHelper
    {
        /// <summary>
        /// 将当前请求的User转换成 AccountInfo，以便获取数据
        /// </summary>
        public static AccountInfo CurrentUser { get; set; }
        /// <summary>
        /// 账号创建密码规则
        /// </summary>
        /// <param name="accountId"></param>
        /// <param name="pwd">两次MD5</param>
        /// <returns></returns>
        public static string GenAccountPwd(string accountId, string pwd)
        {
            string pwdstr = pwd + accountId + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdstr);
        }
        public static string GenAccountPwd(int accountId, string pwd)
        {
            return GenAccountPwd(accountId.ToString(), pwd);
        }
        /// <summary>
        /// 使用原始密码生成数据库密码
        /// </summary>
        /// <param name="accountId"></param>
        /// <param name="orignalPwd">原始密码</param>
        /// <returns></returns>
        public static string GenAccountPwdByOrignalPwd(string accountId, string orignalPwd)
        {
            string pwd = MD5Util.GetMd5Hash(MD5Util.GetMd5Hash(orignalPwd));
            string pwdstr = pwd + accountId + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdstr);
        }

        /// <summary>
        /// 根据accountId获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(int accountId)
        {
            var sql = "SELECT a.*, IF ( a.SelfPermissions = '', b.Permissions, a.SelfPermissions ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Id = @accountId ";
            var accountInfo = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId }).FirstOrDefault();
            return accountInfo;
        }
        /// <summary>
        /// 根据账号获取账号信息
        /// </summary>
        /// <param name="account">账号</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(string account)
        {
            var sql = "SELECT a.*, IF ( a.SelfPermissions = '', b.Permissions, a.SelfPermissions ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Account = @account ";
            var accountInfo = ServerConfig.WebDb.Query<AccountInfo>(sql, new { account }).FirstOrDefault();
            return accountInfo;
        }
    }
}
