﻿using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Models.Account;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.ServerConfig.Enum;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using ServiceStack;
using System;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.AccountManagement
{
    /// <summary>
    /// 用户管理
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Route("AccountManagement")]
    [ApiController]
    public class AccountManagementController : ControllerBase
    {
        /// <summary>
        /// 获取用户信息
        /// </summary>
        /// <returns></returns>
        [HttpGet("List")]
        public DataResult List(int id = 0)
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<DataResult>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<DataResult>(Error.NoAuth);
            }

            var result = new DataResult();
            if (id == 0)
            {
                result.datas.AddRange(AccountHelper.GetAccountInfo());
            }
            else
            {
                result.datas.Add(AccountHelper.GetAccountInfo(id));
            }
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        /// <summary>
        /// 添加用户
        /// </summary>
        /// <returns></returns>
        [HttpPost("Add")]
        public Result Add()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var account = param.GetValue("account");
            var password = param.GetValue("password");
            var name = param.GetValue("name");
            var email = param.GetValue("email");
            var roleStr = param.GetValue("role");
            var permissions = param.GetValue("permissions");
            if (account.IsNullOrEmpty() || account.IsNullOrEmpty() || name.IsNullOrEmpty() || roleStr.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            if (!int.TryParse(roleStr, out var role))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var accountInfo = AccountHelper.GetAccountInfo(account);
            if (accountInfo != null)
            {
                return Result.GenError<Result>(Error.AccountIsExist);
            }

            var roleInfo = RoleHelper.GetRoleInfo(role);
            if (roleInfo == null)
            {
                return Result.GenError<Result>(Error.RoleNotExist);
            }

            if (!permissions.IsNullOrEmpty())
            {
                try
                {
                    permissions = permissions.Split(',').Distinct().Where(x => !roleInfo.Permissions.Contains(x)).ToJSON();
                }
                catch (Exception e)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }

            var info = new AccountInfo
            {
                Account = account,
                Password = AccountHelper.GenAccountPwdByOrignalPwd(account, password),
                Name = name,
                Role = role,
                EmailAddress = email,
                SelfPermissions = permissions
            };
            AccountHelper.AddAccountInfo(info);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, $"账号:{account},名字:{name},角色:{roleInfo.Name},邮箱:{email},特殊权限列表:{permissions}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 删除用户 可根据账号ID或者账号名删除账号
        /// </summary>
        /// <returns></returns>
        [HttpPost("Delete")]
        public Result Delete()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var idStr = param.GetValue("id");
            var accountStr = param.GetValue("account");
            if (idStr.IsNullOrEmpty() || accountStr.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            AccountInfo accountInfo = null;
            if (!idStr.IsNullOrEmpty())
            {
                if (!int.TryParse(idStr, out var id))
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
                accountInfo = AccountHelper.GetAccountInfo(id);
            }
            else
            {

                accountInfo = AccountHelper.GetAccountInfo(accountStr);
            }
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            AccountHelper.DeleteAccountInfo(accountInfo.Id);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, $"账号:{accountInfo.Account},名字:{accountInfo.Name},角色:{accountInfo.RoleName}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 更新用户
        /// </summary>
        /// <returns></returns>
        [HttpPost("Update")]
        public Result Update()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<DataResult>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var idStr = param.GetValue("id");
            var accountStr = param.GetValue("account");
            if (idStr.IsNullOrEmpty() || accountStr.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            AccountInfo accountInfo = null;
            if (!idStr.IsNullOrEmpty())
            {
                if (!int.TryParse(idStr, out var id))
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
                accountInfo = AccountHelper.GetAccountInfo(id);
            }
            else
            {

                accountInfo = AccountHelper.GetAccountInfo(accountStr);
            }
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }

            var logParam = $"账号:{accountInfo.Account}";
            //Name
            var name = param.GetValue("name");
            if (!name.IsNullOrEmpty())
            {
                logParam = $",名字:{accountInfo.Name},新名字:{name}";
                accountInfo.Name = name;
            }
            //Password
            var password = param.GetValue("password");
            if (!password.IsNullOrEmpty())
            {
                var pwd = AccountHelper.GenAccountPwdByOrignalPwd(accountInfo.Account, password);
                logParam = $",密码:{accountInfo.Password},新密码明文/密文:{password}/{pwd}";
                accountInfo.Password = pwd;
            }

            //EmailAddress
            var email = param.GetValue("email");
            if (!email.IsNullOrEmpty())
            {
                logParam = $",邮箱:{accountInfo.EmailAddress},新邮箱:{email}";
                accountInfo.EmailAddress = email;
            }

            //Role
            var roleStr = param.GetValue("role");
            if (!roleStr.IsNullOrEmpty())
            {
                if (!int.TryParse(roleStr, out var role))
                {
                    return Result.GenError<Result>(Error.ParamError);
                }

                var roleInfo = RoleHelper.GetRoleInfo(role, true);
                if (roleInfo == null)
                {
                    return Result.GenError<Result>(Error.RoleNotExist);
                }
                logParam = $",角色ID:{accountInfo.Role},角色名:{accountInfo.RoleName},新角色ID:{role},新角色名:{roleInfo.Name}";
                accountInfo.Role = role;
            }
            //Permissions
            var permissions = param.GetValue("permissions");
            if (!permissions.IsNullOrEmpty())
            {
                try
                {
                    var roleInfo = RoleHelper.GetRoleInfo(accountInfo.Role);
                    permissions = permissions.Split(',').Distinct().Where(x => !roleInfo.Permissions.Contains(x)).ToJSON();
                    if (!permissions.IsNullOrEmpty())
                    {
                        accountInfo.Permissions = permissions;
                        logParam += $",新特殊权限列表: {accountInfo.Permissions}";
                    }
                }
                catch (Exception e)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }
            AccountHelper.UpdateAccountInfo(accountInfo);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam);
            return Result.GenError<Result>(Error.Success);
        }
    }
}