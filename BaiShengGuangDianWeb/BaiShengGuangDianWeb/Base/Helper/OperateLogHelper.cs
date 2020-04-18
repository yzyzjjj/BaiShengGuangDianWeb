using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using Microsoft.AspNetCore.Http;
using ServiceStack;
using System;
using ModelBase.Base.Utils;

namespace BaiShengGuangDianWeb.Base.Helper
{
    /// <summary>
    /// 日志记录
    /// </summary>
    public class OperateLogHelper
    {
        /// <summary>
        /// 根据权限ID
        /// </summary>
        /// <param name="request"></param>
        /// <param name="accountId"></param>
        /// <param name="operateType"></param>
        /// <param name="param"></param>
        /// <param name="opAccountId"></param>
        /// <param name="operateDesc"></param>
        public static void Log(HttpRequest request, int accountId, int operateType, string param = "", int opAccountId = 0, string operateDesc = "")
        {

            if (operateDesc.IsNullOrEmpty())
            {
                var permission = PermissionHelper.Get(operateType);
                operateDesc = permission.Name;
            }

            var accountInfo = AccountHelper.GetAccountInfo(accountId);
            AccountInfo opAccountInfo = null;
            if (opAccountId != 0)
            {
                opAccountInfo = AccountHelper.GetAccountInfo(accountId);
            }
            ServerConfig.WebDb.Execute(
                "INSERT INTO operate_log (`AccountId`, `AccountName`, `OperateAccountId`, `OperateAccountName`, `OperateType`, `OperateDesc`, `OperateTime`, `IP`, `Param`) " +
                "VALUES (@AccountId, @AccountName, @OperateAccountId, @OperateAccountName, @OperateType, @OperateDesc, @OperateTime, @IP, @Param);", new
                {
                    AccountId = accountInfo.Id,
                    AccountName = accountInfo.Name,
                    OperateAccountId = opAccountInfo?.Id ?? 0,
                    OperateAccountName = opAccountInfo?.Name ?? "",
                    OperateType = operateType,
                    OperateDesc = operateDesc,
                    OperateTime = DateTime.Now,
                    IP = request.GetIp(),
                    Param = param
                });

        }

        /// <summary>
        /// 根据请求路径
        /// </summary>
        /// <param name="request"></param>
        /// <param name="accountId"></param>
        /// <param name="url"></param>
        /// <param name="param"></param>
        /// <param name="opAccountId"></param>
        /// <param name="operateDesc"></param>
        public static void Log(HttpRequest request, int accountId, string url, string param = "", int opAccountId = 0, string operateDesc = "")
        {
            //var permission = PermissionHelper.Get(url);
            //if (operateDesc.IsNullOrEmpty())
            //{
            //    operateDesc = permission.Name;
            //}
            operateDesc ="";

            var accountInfo = AccountHelper.GetAccountInfo(accountId);
            AccountInfo opAccountInfo = null;
            if (opAccountId != 0)
            {
                opAccountInfo = AccountHelper.GetAccountInfo(accountId);
            }
            ServerConfig.WebDb.Execute(
                "INSERT INTO operate_log (`AccountId`, `AccountName`, `OperateAccountId`, `OperateAccountName`, `OperateType`, `OperateDesc`, `OperateTime`, `IP`, `Param`) " +
                "VALUES (@AccountId, @AccountName, @OperateAccountId, @OperateAccountName, @OperateType, @OperateDesc, @OperateTime, @IP, @Param);", new
                {
                    AccountId = accountInfo.Id,
                    AccountName = accountInfo.Name,
                    OperateAccountId = opAccountInfo?.Id ?? 0,
                    OperateAccountName = opAccountInfo?.Name ?? "",
                    OperateType = 0,
                    //OperateType = permission.Id,
                    OperateDesc = operateDesc,
                    OperateTime = DateTime.Now,
                    IP = request.GetIp(),
                    Param = param
                });
        }
    }
}
