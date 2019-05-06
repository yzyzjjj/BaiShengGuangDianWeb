﻿using BaiShengGuangDianWeb.Base.Server;
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
            string pwdstr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdstr);
        }

        /// <summary>
        /// 使用原始密码生成数据库密码
        /// </summary>
        /// <param name="account"></param>
        /// <param name="orignalPwd">原始密码</param>
        /// <returns></returns>
        public static string GenAccountPwdByOrignalPwd(string account, string orignalPwd)
        {
            string pwd = MD5Util.GetMd5Hash(MD5Util.GetMd5Hash(orignalPwd));
            string pwdstr = pwd + account + ServerConfig.PasswordKey;
            return MD5Util.GetMd5Hash(pwdstr);
        }

        /// <summary>
        /// 根据accountId获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(int accountId)
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.Id = @accountId AND a.IsDeleted = 0 AND b.IsDeleted = 0";
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
        /// 根据code获取账号信息
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
        /// 获取所有账号信息
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<AccountInfo> GetAccountInfo()
        {
            var sql = "SELECT a.*, b.`Name` RoleName, IF ( a.SelfPermissions = '', b.Permissions, CONCAT(b.Permissions, ',', a.SelfPermissions) ) Permissions FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.IsDeleted = 0 AND b.IsDeleted = 0";
            return ServerConfig.WebDb.Query<AccountInfo>(sql);
        }

        /// <summary>
        /// 添加账号
        /// </summary>
        /// <param name="info"></param>
        /// <returns></returns>
        public static void AddAccountInfo(AccountInfo info)
        {
            var sql = "INSERT INTO accounts (`Account`, `Password`, `Name`, `Role`, `EmailAddress`, `IsDeleted`, `SelfPermissions`, `DeviceIds`, `Default`, `ProductionRole`) " +
                      "VALUES (@Account, @Password, @Name, @Role, @EmailAddress, @IsDeleted, @SelfPermissions, @DeviceIds, @Default, @ProductionRole);";
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
            var sql = "UPDATE accounts SET `Account` = @Account, `Password` = @Password, `Name` = @Name, `Role` = @Role, `EmailAddress` = @EmailAddress, `IsDeleted` = @IsDeleted, `SelfPermissions` = @SelfPermissions, `DeviceIds` = @DeviceIds, `Default` = @Default, `ProductionRole` = @ProductionRole WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, info);
        }
    }
}
