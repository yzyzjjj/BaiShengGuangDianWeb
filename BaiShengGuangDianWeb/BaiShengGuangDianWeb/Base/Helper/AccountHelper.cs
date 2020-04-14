﻿using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using ModelBase.Base.Utils;
using ServiceStack;
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
            var pwdStr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdStr);
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
        /// <param name="originalPwd">原始密码</param>
        /// <returns></returns>
        public static string GenAccountPwdByOriginalPwd(string account, string originalPwd)
        {
            var pwd = MD5Util.GetMd5Hash(MD5Util.GetMd5Hash(originalPwd));
            var pwdStr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdStr);
        }

        /// <summary>
        /// 根据accountId获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(int accountId, bool isAll = false)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions )) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE a.Id = @accountId {(isAll ? "" : "AND a.IsDeleted = 0")} AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
        }
        /// <summary>
        /// 根据accountId获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoAll(int accountId)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE a.Id = @accountId AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
        }
        /// <summary>
        /// 根据账号获取账号信息
        /// </summary>
        /// <param name="account">账号</param>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(string account, bool isAll = false)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE a.Account = @account {(isAll ? "" : "AND a.IsDeleted = 0")} AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { account }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
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
            return info.Where(x => !x.Account.IsNullOrEmpty());
        }

        /// <summary>
        /// 根据number获取账号信息
        /// </summary>
        /// <param name="number"></param>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByNumber(string number, bool isAll = false)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE MD5(a.Number) = @number {(isAll ? "" : "AND a.IsDeleted = 0")} AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { number }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
        }

        /// <summary>
        /// 根据姓名获取账号信息
        /// </summary>
        /// <param name="name"></param>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByName(string name, bool isAll = false)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE a.Name = @name {(isAll ? "" : "AND a.IsDeleted = 0")} AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { name }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
        }
        /// <summary>
        /// 根据姓名获取账号信息
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByNameAll(string name)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE a.Name = @name AND b.IsDeleted = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { name }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
        }
        /// <summary>
        /// 获取所有账号信息
        /// </summary>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static IEnumerable<AccountInfo> GetAccountInfo(bool isAll = false)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE {(isAll ? "" : "AND a.IsDeleted = 0")} AND b.IsDeleted = 0 GROUP BY a.Id ORDER BY a.Id;";
            return ServerConfig.WebDb.Query<AccountInfo>(sql);
        }
        /// <summary>
        /// 获取所有账号信息    包括已删除
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<AccountInfo> GetAccountInfoAll()
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE b.IsDeleted = 0 GROUP BY a.Id ORDER BY a.Id;";
            return ServerConfig.WebDb.Query<AccountInfo>(sql);
        }

        /// <summary>
        /// 添加账号
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        public static void AddAccountInfo(AccountInfo info)
        {
            var sql = "INSERT INTO accounts (`Account`, `Password`, `Name`, `Role`, `Phone`, `EmailType`, `EmailAddress`, `IsDeleted`, `SelfPermissions`, `AllDevice`, `DeviceIds`, `Default`, `ProductionRole`, `MaxProductionRole`) " +
                      "VALUES (@Account, @Password, @Name, @Role, @Phone, @EmailType, @EmailAddress, @IsDeleted, @SelfPermissions, @AllDevice, @DeviceIds, @Default, @ProductionRole, @MaxProductionRole);";
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
            var sql = "UPDATE accounts SET `Account` = @Account, `Password` = @Password, `Name` = @Name, `Role` = @Role, `Phone` = @Phone, `EmailType` = @EmailType, `EmailAddress` = @EmailAddress, `IsDeleted` = @IsDeleted, " +
                      "`SelfPermissions` = @SelfPermissions, `AllDevice` = @AllDevice, `DeviceIds` = @DeviceIds, `Default` = @Default, `ProductionRole` = @ProductionRole, `MaxProductionRole` = @MaxProductionRole WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, info);
        }
    }
}
