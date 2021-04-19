using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using ModelBase.Base.Utils;
using ServiceStack;
using System.Collections.Generic;
using System.Linq;
using BaiShengGuangDianWeb.Models.BaseModel;
using Microsoft.Extensions.Configuration;
using ModelBase.Models.BaseModel;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class AccountInfoHelper : DataHelper
    {
        public static string PasswordKey;
        public static string EmailAccount;
        public static string EmailPassword;
        public static void Init(IConfiguration configuration)
        {
            PasswordKey = configuration.GetAppSettings<string>("PasswordKey");
            EmailAccount = configuration.GetAppSettings<string>("EmailAccount");
            EmailPassword = configuration.GetAppSettings<string>("EmailPassword");
        }
        private AccountInfoHelper()
        {
            Table = "accounts";
            InsertSql =
                "INSERT INTO accounts (`Account`, `Password`, `Name`, `Role`, `Phone`, `EmailType`, `EmailAddress`, `MarkedDelete`, `SelfPermissions`, `AllDevice`, `DeviceIds`, `Default`, `ProductionRole`, `MaxProductionRole`) " +
                "VALUES (@Account, @Password, @Name, @Role, @Phone, @EmailType, @EmailAddress, @MarkedDelete, @SelfPermissions, @AllDevice, @DeviceIds, @Default, @ProductionRole, @MaxProductionRole);";

            UpdateSql = "UPDATE accounts SET `Account` = @Account, `Password` = @Password, `Name` = @Name, `Role` = @Role, `Phone` = @Phone, `EmailType` = @EmailType, `EmailAddress` = @EmailAddress, `MarkedDelete` = @MarkedDelete, " +
                        "`SelfPermissions` = @SelfPermissions, `AllDevice` = @AllDevice, `DeviceIds` = @DeviceIds, `Default` = @Default, `ProductionRole` = @ProductionRole, `MaxProductionRole` = @MaxProductionRole WHERE `Id` = @Id;";

            SameField = "Account";
        }

        public static readonly AccountInfoHelper Instance = new AccountInfoHelper();
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
            var pwdStr = pwd + account + PasswordKey;
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
            var pwdStr = pwd + account + PasswordKey;
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
            var pwdStr = pwd + account + PasswordKey;
            return MD5Util.GetMd5Hash(pwdStr);
        }

        /// <summary>
        /// 根据获取账号信息
        /// </summary>
        /// <param name="accountId"></param>
        /// <param name="isAll"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(int accountId, bool isAll = false)
        {
            return GetAccountInfo(accountId, "", "", "", isAll);
        }

        /// <summary>
        /// 根据获取账号信息
        /// </summary>
        /// <param name="account"></param>
        /// <param name="isAll"></param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(string account, bool isAll = false)
        {
            return GetAccountInfo(0, account, "", "", isAll);
        }

        /// <summary>
        /// 根据number获取账号信息
        /// </summary>
        /// <param name="number"></param>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByNumber(string number, bool isAll = false)
        {
            return GetAccountInfo(0, "", number, "", isAll);
        }

        /// <summary>
        /// 根据number获取账号信息
        /// </summary>
        /// <param name="name"></param>
        /// <param name="isAll">是否包含已删除</param>
        /// <returns></returns>
        public static AccountInfo GetAccountInfoByName(string name, bool isAll = false)
        {
            return GetAccountInfo(0, "", "", name, isAll);
        }
        /// <summary>
        /// 根据获取账号信息
        /// </summary>
        /// <returns></returns>
        public static AccountInfo GetAccountInfo(int accountId, string account, string number, string name, bool isAll = false)
        {
            var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
                      $"WHERE{(accountId == 0 ? "" : " a.Id = @accountId AND ")}" +
                      $"{(account.IsNullOrEmpty() ? "" : " a.Account = @account AND ")}" +
                      $"{(number.IsNullOrEmpty() ? "" : " MD5(a.Number) = @number AND ")}" +
                      $"{(name.IsNullOrEmpty() ? "" : " a.Name = @name AND ")}" +
                      $"{(isAll ? "" : " a.MarkedDelete = 0 AND ")}" +
                      $"b.MarkedDelete = 0;";
            var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId, account }).FirstOrDefault();
            return info == null || info.Account.IsNullOrEmpty() ? null : info;
        }

        public static void Login(int accountId)
        {
            var sql = "UPDATE accounts SET `LoginTime` = Now(), `LoginCount` = `LoginCount` + 1 WHERE Id = @accountId";
            ServerConfig.WebDb.Execute(sql, new { accountId  });
        }
        public static void Login(AccountInfo accountInfo)
        {
            Login(accountInfo.Id);
        }
        public static void Logout(int accountId)
        {
            var sql = "UPDATE accounts SET `LogoutTime` = Now() WHERE Id = @accountId";
            ServerConfig.WebDb.Execute(sql, new { accountId });
        }
        public static void Logout(AccountInfo accountInfo)
        {
            Logout(accountInfo.Id);
        }
        ///// <summary>
        ///// 根据accountId 批量获取账号信息
        ///// </summary>
        ///// <param name="accountIds"></param>
        ///// <returns></returns>
        //public static IEnumerable<AccountInfo> GetAccountInfos(IEnumerable<int> accountIds)
        //{
        //    var sql = "SELECT * FROM `accounts` WHERE Id IN @accountId AND MarkedDelete = 0";
        //    var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { accountId = accountIds });
        //    return info.Where(x => !x.Account.IsNullOrEmpty());
        //}

        ///// <summary>
        ///// 根据number获取账号信息
        ///// </summary>
        ///// <param name="number"></param>
        ///// <param name="isAll">是否包含已删除</param>
        ///// <returns></returns>
        //public static AccountInfo GetAccountInfoByNumber(string number, bool isAll = false)
        //{
        //    var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
        //              $"WHERE MD5(a.Number) = @number {(isAll ? "" : "AND a.MarkedDelete = 0")} AND b.MarkedDelete = 0;";
        //    var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { number }).FirstOrDefault();
        //    return info == null || info.Account.IsNullOrEmpty() ? null : info;
        //}

        ///// <summary>
        ///// 根据姓名获取账号信息
        ///// </summary>
        ///// <param name="name"></param>
        ///// <param name="isAll">是否包含已删除</param>
        ///// <returns></returns>
        //public static AccountInfo GetAccountInfoByName(string name, bool isAll = false)
        //{
        //    var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
        //              $"WHERE a.Name = @name {(isAll ? "" : "AND a.MarkedDelete = 0")} AND b.MarkedDelete = 0;";
        //    var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { name }).FirstOrDefault();
        //    return info == null || info.Account.IsNullOrEmpty() ? null : info;
        //}
        ///// <summary>
        ///// 根据姓名获取账号信息
        ///// </summary>
        ///// <param name="name"></param>
        ///// <returns></returns>
        //public static AccountInfo GetAccountInfoByNameAll(string name)
        //{
        //    var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
        //              $"WHERE a.Name = @name AND b.MarkedDelete = 0;";
        //    var info = ServerConfig.WebDb.Query<AccountInfo>(sql, new { name }).FirstOrDefault();
        //    return info == null || info.Account.IsNullOrEmpty() ? null : info;
        //}
        ///// <summary>
        ///// 获取所有账号信息
        ///// </summary>
        ///// <param name="isAll">是否包含已删除</param>
        ///// <returns></returns>
        //public static IEnumerable<AccountInfo> GetAccountInfo(bool isAll = false)
        //{
        //    var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
        //              $"WHERE {(isAll ? "" : "AND a.MarkedDelete = 0")} AND b.MarkedDelete = 0 GROUP BY a.Id ORDER BY a.Id;";
        //    return ServerConfig.WebDb.Query<AccountInfo>(sql);
        //}
        ///// <summary>
        ///// 获取所有账号信息    包括已删除
        ///// </summary>
        ///// <returns></returns>
        //public static IEnumerable<AccountInfo> GetAccountInfoAll()
        //{
        //    var sql = $"SELECT a.*, GROUP_CONCAT(b.`Name`) RoleName, IF ( a.SelfPermissions = '', GROUP_CONCAT(b.Permissions), CONCAT( GROUP_CONCAT(b.Permissions), ',', a.SelfPermissions ) ) Permissions FROM `accounts` a JOIN `roles` b ON FIND_IN_SET(b.Id, a.Role) != 0 " +
        //              $"WHERE b.MarkedDelete = 0 GROUP BY a.Id ORDER BY a.Id;";
        //    return ServerConfig.WebDb.Query<AccountInfo>(sql);
        //}

        ///// <summary>
        ///// 添加账号
        ///// </summary>
        ///// <param name="info"></param>
        ///// <returns></returns>
        //public static void AddAccountInfo(AccountInfo info)
        //{
        //    var sql = "INSERT INTO accounts (`Account`, `Password`, `Name`, `Role`, `Phone`, `EmailType`, `EmailAddress`, `MarkedDelete`, `SelfPermissions`, `AllDevice`, `DeviceIds`, `Default`, `ProductionRole`, `MaxProductionRole`) " +
        //              "VALUES (@Account, @Password, @Name, @Role, @Phone, @EmailType, @EmailAddress, @MarkedDelete, @SelfPermissions, @AllDevice, @DeviceIds, @Default, @ProductionRole, @MaxProductionRole);";
        //    ServerConfig.WebDb.Execute(sql, info);
        //}

        ///// <summary>
        ///// 删除账号
        ///// </summary>
        ///// <param name="id"></param>
        ///// <returns></returns>
        //public static void DeleteAccountInfo(int id)
        //{
        //    var sql = "UPDATE accounts Set `MarkedDelete` = 1 WHERE `Id` = @Id;";
        //    ServerConfig.WebDb.Execute(sql, new { id });
        //}

        ///// <summary>
        ///// 修改账号信息 不支持修改账号
        ///// </summary>
        ///// <param name="info"></param>
        ///// <returns></returns>
        //public static void UpdateAccountInfo(AccountInfo info)
        //{
        //    var sql = "UPDATE accounts SET `Account` = @Account, `Password` = @Password, `Name` = @Name, `Role` = @Role, `Phone` = @Phone, `EmailType` = @EmailType, `EmailAddress` = @EmailAddress, `MarkedDelete` = @MarkedDelete, " +
        //              "`SelfPermissions` = @SelfPermissions, `AllDevice` = @AllDevice, `DeviceIds` = @DeviceIds, `Default` = @Default, `ProductionRole` = @ProductionRole, `MaxProductionRole` = @MaxProductionRole WHERE `Id` = @Id;";
        //    ServerConfig.WebDb.Execute(sql, info);
        //}
    }
}
