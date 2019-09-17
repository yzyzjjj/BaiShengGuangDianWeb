using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using ModelBase.Base.Utils;
using System.Collections.Generic;
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
        /// <param name="account"></param>
        /// <param name="pwd">两次MD5</param>
        /// <returns></returns>
        public static string GenAccountPwd(string account, string pwd)
        {
            var pwdstr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdstr);
        }
        /// <summary>
        /// 账号创建密码规则 一次MD5
        /// </summary>
        /// <param name="account"></param>
        /// <param name="pwd">两次MD5</param>
        /// <returns></returns>
        public static string GenAccountPwdByOne(string account, string pwd)
        {
            pwd = MD5Util.GetMd5Hash(pwd);
            var pwdStr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdStr);
        }
        /// <summary>
        /// 使用原始密码生成数据库密码
        /// </summary>
        /// <param name="account"></param>
        /// <param name="orignalPwd">原始密码</param>
        /// <returns></returns>
        public static string GenAccountPwdByOrignalPwd(string account, string orignalPwd)
        {
            var pwd = MD5Util.GetMd5Hash(MD5Util.GetMd5Hash(orignalPwd));
            var pwdStr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdStr);
        }

        /// <summary>
        /// 根据accountId获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(int accountId)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Id = @accountId AND a.IsDeleted = 0 AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId }).FirstOrDefault();
            return info;
        }
        /// <summary>
        /// 根据accountId获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoAll(int accountId)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Id = @accountId AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId }).FirstOrDefault();
            return info;
        }
        /// <summary>
        /// 根据账号获取账号信息
        /// </summary>
        /// <param name="account">账号</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(string account)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Account = @account AND a.IsDeleted = 0 AND b.IsDeleted = 0";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { account }).FirstOrDefault();
            return info;
        }
        /// <summary>
        /// 根据账号获取账号信息  包括已删除
        /// </summary>
        /// <param name="account">账号</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoAll(string account)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Account = @account AND b.IsDeleted = 0";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { account }).FirstOrDefault();
            return info;
        }

        /// <summary>
        /// 根据accountId 批量获取账号信息
        /// </summary>
        /// <param name="accountIds"></param>
        /// <returns></returns>
        public static IEnumerable<AccountInfo> GetAccountInfos(IEnumerable<int> accountIds)
        {
            var sql = "SELECT * FROM `accounts` WHERE Id IN @accountId AND IsDeleted = 0";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId = accountIds });
            return info;
        }

        /// <summary>
        /// 根据code获取账号信息
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByCode(string code)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Code = @code AND a.IsDeleted = 0 AND b.IsDeleted = 0";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { code }).FirstOrDefault();
            return info;
        }

        /// <summary>
        /// 根据姓名获取账号信息
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByName(string name)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Name = @name AND a.IsDeleted = 0 AND b.IsDeleted = 0";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { name }).FirstOrDefault();
            return info;
        }
        /// <summary>
        /// 根据姓名获取账号信息
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByNameAll(string name)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Name = @name AND b.IsDeleted = 0";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { name }).FirstOrDefault();
            return info;
        }
        /// <summary>
        /// 获取所有账号信息  不包括已删除
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<AccountInfo> GetAccountInfo()
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.IsDeleted = 0 AND b.IsDeleted = 0 ORDER BY a.Id";
            return ServerConfig.WebDb.Query<AccountInfo>(sql);
        }
        /// <summary>
        /// 获取所有账号信息    包括已删除
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<AccountInfo> GetAccountInfoAll()
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE b.IsDeleted = 0 ORDER BY a.IsDeleted, a.Id";
            return ServerConfig.WebDb.Query<AccountInfo>(sql);
        }

        /// <summary>
        /// 添加账号
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        public static void AddAccountInfo(AccountInfo info)
        {
            var sql = "INSERT INTO accounts (`Account`, `Password`, `Name`, `Role`, `EmailType`, `EmailAddress`, `IsDeleted`, `SelfPermissions`, `DeviceIds`, `Default`, `ProductionRole`, `MaxProductionRole`) " +
                      "VALUES (@Account, @Password, @Name, @Role, @EmailType, @EmailAddress, @IsDeleted, @SelfPermissions, @DeviceIds, @Default, @ProductionRole, @MaxProductionRole);";
            ServerConfig.WebDb.Execute(sql, info);
        }

        /// <summary>
        /// 删除账号
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static void DeleteAccountInfo(int id)
        {
            var sql = "UPDATE accounts Set `IsDeleted` = 1 WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, new { id });
        }

        /// <summary>
        /// 修改账号信息 不支持修改账号
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        public static void UpdateAccountInfo(AccountInfo info)
        {
            var sql = "UPDATE accounts SET `Account` = @Account, `Password` = @Password, `Name` = @Name, `Role` = @Role, `EmailType` = @EmailType, `EmailAddress` = @EmailAddress, `IsDeleted` = @IsDeleted, " +
                      "`SelfPermissions` = @SelfPermissions, `DeviceIds` = @DeviceIds, `Default` = @Default, `ProductionRole` = @ProductionRole, `MaxProductionRole` = @MaxProductionRole WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, info);
        }
    }
}
