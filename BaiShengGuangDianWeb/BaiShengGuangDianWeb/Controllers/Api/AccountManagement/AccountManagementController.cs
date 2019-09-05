using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Models.Account;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.HttpServer;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using ServiceStack;
using System;
using System.Collections.Generic;
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
                result.datas.Add(AccountHelper.GetAccountInfoAll(id));
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
            var isProcessor = param.GetValue("isProcessor");
            var deviceIds = param.GetValue("deviceIds");
            var emailType = param.GetValue("emailType");
            if (account.IsNullOrEmpty() || account.IsNullOrEmpty() || name.IsNullOrEmpty() || roleStr.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            if (!int.TryParse(roleStr, out var role))
            {
                return Result.GenError<Result>(Error.ParamError);
            }
            var accountInfo = AccountHelper.GetAccountInfoAll(account);
            if (accountInfo != null)
            {
                return Result.GenError<Result>(Error.AccountIsExist);
            }

            if (AccountHelper.GetAccountInfoByNameAll(name) != null)
            {
                return Result.GenError<Result>(Error.NameIsExist);
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
                    var permissionList = permissions.Split(',').Select(int.Parse).ToList();
                    permissionList.AddRange(PermissionHelper.GetDefault());
                    permissions = permissionList.Distinct().Where(x => !roleInfo.PermissionsList.Contains(x)).Join(",");
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }

            if (!deviceIds.IsNullOrEmpty())
            {
                try
                {
                    deviceIds = deviceIds.Split(',').Select(int.Parse).Distinct().Join(",");
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }
            var logParam = $"账号:{account},名字:{name},角色:{roleInfo.Name},邮箱:{email},邮件类型:{emailType},特殊权限列表:{permissions}";
            if (!isProcessor.IsNullOrEmpty())
            {
                try
                {
                    var isProcessorList = isProcessor.Split(',').Select(int.Parse).ToList();
                    logParam += $",生产角色:{isProcessor}";
                    isProcessor = isProcessorList.Join(",");
                    foreach (var variable in isProcessorList)
                    {
                        int opType;
                        Permission permission;
                        ManagementServer managementServer;
                        string opData;
                        string url;
                        switch (variable)
                        {
                            case 0:
                                opType = 251;
                                permission = PermissionHelper.Get(opType);
                                if (permission == null || permission.HostId == 0)
                                {
                                    break;
                                }

                                managementServer = ManagementServerHelper.Get(permission.HostId);
                                if (managementServer == null)
                                {
                                    break;
                                }

                                opData = new
                                {
                                    ProcessorName = name,
                                    Account = account,
                                }.ToJSON();
                                url = managementServer.Host + permission.Url;
                                HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                    (s, exception) =>
                                    {

                                    });
                                break;
                            case 1:
                                opType = 257;
                                permission = PermissionHelper.Get(opType);
                                if (permission == null || permission.HostId == 0)
                                {
                                    break;
                                }

                                managementServer = ManagementServerHelper.Get(permission.HostId);
                                if (managementServer == null)
                                {
                                    break;
                                }

                                opData = new
                                {
                                    SurveyorName = name,
                                    Account = account
                                }.ToJSON();
                                url = managementServer.Host + permission.Url;
                                HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                    (s, exception) =>
                                    {

                                    });
                                break;
                            default:
                                break;
                        }
                    }
                }
                catch (Exception)
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
                EmailType = emailType,
                EmailAddress = email,
                SelfPermissions = permissions ?? "",
                DeviceIds = deviceIds ?? "",
                ProductionRole = isProcessor.IsNullOrEmpty() ? "" : isProcessor,
                MaxProductionRole = isProcessor.IsNullOrEmpty() ? "" : isProcessor
            };
            AccountHelper.AddAccountInfo(info);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam);
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
            if (idStr.IsNullOrEmpty() && accountStr.IsNullOrEmpty())
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
                accountInfo = AccountHelper.GetAccountInfoAll(id);
            }
            else
            {
                accountInfo = AccountHelper.GetAccountInfoAll(accountStr);
            }
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }

            if (accountInfo.Default)
            {
                return Result.GenError<Result>(Error.AccountNotOperate);
            }

            if (accountInfo.Id == AccountHelper.CurrentUser.Id)
            {
                return Result.GenError<Result>(Error.OperateNotSafe);
            }

            var logParam = $"账号:{accountInfo.Account},名字:{accountInfo.Name},角色:{accountInfo.RoleName}";
            AccountHelper.DeleteAccountInfo(accountInfo.Id);
            if (!accountInfo.ProductionRole.IsNullOrEmpty())
            {
                var isProcessor = accountInfo.ProductionRole;
                try
                {
                    var isProcessorList = isProcessor.Split(',').Select(int.Parse).ToList();
                    logParam += $",生产角色:{isProcessor}";
                    foreach (var variable in isProcessorList)
                    {
                        int opType;
                        Permission permission;
                        ManagementServer managementServer;
                        string opData;
                        string url;
                        switch (variable)
                        {
                            case 0:
                                opType = 253;
                                permission = PermissionHelper.Get(opType);
                                if (permission == null || permission.HostId == 0)
                                {
                                    break;
                                }

                                managementServer = ManagementServerHelper.Get(permission.HostId);
                                if (managementServer == null)
                                {
                                    break;
                                }

                                opData = new
                                {
                                    accountInfo.Account
                                }.ToJSON();
                                url = managementServer.Host + permission.Url;
                                HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                    (s, exception) =>
                                    {

                                    });
                                break;
                            case 1:
                                opType = 259;
                                permission = PermissionHelper.Get(opType);
                                if (permission == null || permission.HostId == 0)
                                {
                                    break;
                                }

                                managementServer = ManagementServerHelper.Get(permission.HostId);
                                if (managementServer == null)
                                {
                                    break;
                                }

                                opData = new
                                {
                                    accountInfo.Account
                                }.ToJSON();
                                url = managementServer.Host + permission.Url;
                                HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                    (s, exception) =>
                                    {

                                    });
                                break;
                            default:
                                break;
                        }
                    }
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }

            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam, accountInfo.Id);
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
            if (idStr.IsNullOrEmpty() && accountStr.IsNullOrEmpty())
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
                accountInfo = AccountHelper.GetAccountInfoAll(id);
            }
            else
            {
                accountInfo = AccountHelper.GetAccountInfoAll(accountStr);
            }
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }

            var logParam = $"账号:{accountInfo.Account}";
            //Name
            var fName = false;
            var name = param.GetValue("name");
            if (!name.IsNullOrEmpty() && accountInfo.Name != name)
            {
                if (AccountHelper.GetAccountInfoByName(name) != null)
                {
                    return Result.GenError<Result>(Error.NameIsExist);
                }
                logParam = $",名字:{accountInfo.Name},新名字:{name}";
                accountInfo.Name = name;
                fName = true;
            }

            //Password
            var password = param.GetValue("password");
            if (!password.IsNullOrEmpty())
            {
                var pwd = AccountHelper.GenAccountPwdByOrignalPwd(accountInfo.Account, password);
                if (accountInfo.Password != pwd)
                {
                    logParam = $",密码:{accountInfo.Password},新密码明文/密文:{password}/{pwd}";
                    accountInfo.Password = pwd;
                }
            }

            //EmailAddress
            var email = param.GetValue("email");
            if (accountInfo.EmailAddress != email)
            {
                logParam = $",邮箱:{accountInfo.EmailAddress},新邮箱:{email}";
                accountInfo.EmailAddress = email;
            }

            //EmailAddress
            var emailType = param.GetValue("emailType");
            if (accountInfo.EmailType != emailType)
            {
                logParam = $",邮件类型:{accountInfo.EmailType},新邮件类型:{emailType}";
                accountInfo.EmailType = emailType;
                fName = true;
            }

            //Role
            var roleStr = param.GetValue("role");
            if (!roleStr.IsNullOrEmpty())
            {
                if (!int.TryParse(roleStr, out var role))
                {
                    return Result.GenError<Result>(Error.ParamError);
                }

                if (accountInfo.Role != role)
                {
                    var roleInfo = RoleHelper.GetRoleInfo(role, true);
                    if (roleInfo == null)
                    {
                        return Result.GenError<Result>(Error.RoleNotExist);
                    }
                    logParam = $",角色ID:{accountInfo.Role},角色名:{accountInfo.RoleName},新角色ID:{role},新角色名:{roleInfo.Name}";
                    accountInfo.Role = role;
                }
            }

            //Permissions
            var permissions = param.GetValue("permissions");
            if (!permissions.IsNullOrEmpty() && accountInfo.SelfPermissions != permissions)
            {
                try
                {
                    var roleInfo = RoleHelper.GetRoleInfo(accountInfo.Role);
                    var permissionList = permissions.Split(',').Select(int.Parse).ToList();
                    permissionList.AddRange(PermissionHelper.GetDefault());
                    permissions = permissionList.Distinct().Where(x => !roleInfo.PermissionsList.Contains(x)).Join(",");
                    if (!permissions.IsNullOrEmpty() && accountInfo.Permissions != permissions)
                    {
                        accountInfo.SelfPermissions = permissions;
                        logParam += $",新特殊权限列表: {accountInfo.SelfPermissions}";
                    }
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }
            else
            {
                accountInfo.SelfPermissions = "";
                logParam += $",新特殊权限列表: {accountInfo.SelfPermissions}";
            }

            //ProductionRole
            var isProcessor = param.GetValue("isProcessor");
            if (!isProcessor.IsNullOrEmpty() && accountInfo.ProductionRole != isProcessor)
            {
                try
                {
                    var oldProductionRoleList = new List<int>();
                    if (!accountInfo.ProductionRole.IsNullOrEmpty())
                    {
                        oldProductionRoleList = accountInfo.ProductionRole.Split(',').Select(int.Parse).ToList();
                    }

                    var isProcessorList = isProcessor.Split(',').Select(int.Parse).ToList();
                    isProcessor = isProcessorList.Join(",");
                    logParam += $",生产角色: {accountInfo.ProductionRole},新生产角色: {isProcessor}";
                    accountInfo.ProductionRole = isProcessor;
                    var maxProductionRoleList = new List<int>();
                    if (!accountInfo.MaxProductionRole.IsNullOrEmpty())
                    {
                        maxProductionRoleList = accountInfo.MaxProductionRole.Split(',').Select(int.Parse).ToList();
                    }
                    var all = new List<int>();
                    all.AddRange(oldProductionRoleList);
                    all.AddRange(isProcessorList);

                    foreach (var variable in all.Distinct())
                    {
                        int opType;
                        Permission permission;
                        ManagementServer managementServer;
                        string url;
                        string opData;
                        switch (variable)
                        {
                            case 0:
                                //上一次包含,本次不包含 = 删除
                                if (oldProductionRoleList.Contains(variable) && !isProcessorList.Contains(variable))
                                {
                                    //已存在 = 删除
                                    if (maxProductionRoleList.Contains(variable))
                                    {
                                        opType = 253;
                                        opData = new
                                        {
                                            id = accountInfo.Account
                                        }.ToJSON();
                                    }
                                    else
                                    {
                                        break;
                                    }
                                }
                                //上一次不包含,本次包含 = 添加
                                else if (!oldProductionRoleList.Contains(variable) && isProcessorList.Contains(variable))
                                {
                                    //已存在 = 更新
                                    if (maxProductionRoleList.Contains(variable))
                                    {
                                        opType = 250;
                                        opData = new
                                        {
                                            id = accountInfo.Account,
                                            MarkedDelete = false,
                                            ProcessorName = accountInfo.Name,
                                            accountInfo.Account
                                        }.ToJSON();
                                    }
                                    //不存在 = 添加
                                    else
                                    {
                                        opType = 251;
                                        opData = new
                                        {
                                            ProcessorName = accountInfo.Name,
                                            accountInfo.Account
                                        }.ToJSON();
                                    }
                                }
                                else
                                {
                                    break;
                                }
                                permission = PermissionHelper.Get(opType);
                                if (permission == null || permission.HostId == 0)
                                {
                                    break;
                                }

                                managementServer = ManagementServerHelper.Get(permission.HostId);
                                if (managementServer == null)
                                {
                                    break;
                                }

                                url = managementServer.Host + permission.Url;
                                HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                    (s, exception) =>
                                    {

                                    });

                                break;
                            case 1:
                                //上一次包含,本次不包含 = 删除
                                if (oldProductionRoleList.Contains(variable) && !isProcessorList.Contains(variable))
                                {
                                    //已存在 = 删除
                                    if (maxProductionRoleList.Contains(variable))
                                    {
                                        opType = 259;
                                        opData = new
                                        {
                                            id = accountInfo.Account
                                        }.ToJSON();
                                    }
                                    else
                                    {
                                        break;
                                    }
                                }
                                //上一次不包含,本次包含 = 添加
                                else if (!oldProductionRoleList.Contains(variable) && isProcessorList.Contains(variable))
                                {
                                    //已存在 = 更新
                                    if (maxProductionRoleList.Contains(variable))
                                    {
                                        opType = 256;
                                        opData = new
                                        {
                                            id = accountInfo.Account,
                                            MarkedDelete = false,
                                            SurveyorName = accountInfo.Name,
                                            accountInfo.Account
                                        }.ToJSON();
                                    }
                                    //不存在 = 添加
                                    else
                                    {
                                        opType = 257;
                                        opData = new
                                        {
                                            SurveyorName = accountInfo.Name,
                                            accountInfo.Account
                                        }.ToJSON();
                                    }
                                }
                                else
                                {
                                    break;
                                }
                                permission = PermissionHelper.Get(opType);
                                if (permission == null || permission.HostId == 0)
                                {
                                    break;
                                }

                                managementServer = ManagementServerHelper.Get(permission.HostId);
                                if (managementServer == null)
                                {
                                    break;
                                }

                                url = managementServer.Host + permission.Url;
                                HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                    (s, exception) =>
                                    {

                                    });

                                break;
                            default:
                                break;
                        }
                    }

                    maxProductionRoleList.AddRange(isProcessorList);
                    accountInfo.MaxProductionRole = maxProductionRoleList.Distinct().Join(",");
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }
            else if (accountInfo.ProductionRole != isProcessor)
            {
                logParam += $",生产角色: {accountInfo.ProductionRole},新生产角色: {isProcessor}";
                accountInfo.ProductionRole = "";
            }

            if (fName)
            {
                var maxProductionRoleList = new List<int>();
                if (!accountInfo.MaxProductionRole.IsNullOrEmpty())
                {
                    maxProductionRoleList = accountInfo.MaxProductionRole.Split(',').Select(int.Parse).ToList();
                }
                var productionRoleList = new List<int>();
                if (!accountInfo.ProductionRole.IsNullOrEmpty())
                {
                    productionRoleList = accountInfo.ProductionRole.Split(',').Select(int.Parse).ToList();
                }

                foreach (var variable in maxProductionRoleList)
                {
                    int opType;
                    Permission permission;
                    ManagementServer managementServer;
                    string url;
                    string opData;
                    switch (variable)
                    {
                        case 0:
                            //已存在 = 更新
                            if (maxProductionRoleList.Contains(variable))
                            {
                                opType = 250;
                                opData = new
                                {
                                    id = accountInfo.Account,
                                    MarkedDelete = !productionRoleList.Contains(variable),
                                    ProcessorName = accountInfo.Name,
                                    accountInfo.Account
                                }.ToJSON();
                            }
                            else
                            {
                                break;
                            }
                            permission = PermissionHelper.Get(opType);
                            if (permission == null || permission.HostId == 0)
                            {
                                break;
                            }

                            managementServer = ManagementServerHelper.Get(permission.HostId);
                            if (managementServer == null)
                            {
                                break;
                            }

                            url = managementServer.Host + permission.Url;
                            HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                (s, exception) =>
                                {

                                });

                            break;
                        case 1:
                            //已存在 = 更新
                            if (maxProductionRoleList.Contains(variable))
                            {
                                opType = 256;
                                opData = new
                                {
                                    id = accountInfo.Account,
                                    MarkedDelete = !productionRoleList.Contains(variable),
                                    SurveyorName = accountInfo.Name,
                                    accountInfo.Account
                                }.ToJSON();
                            }
                            else
                            {
                                break;
                            }

                            permission = PermissionHelper.Get(opType);
                            if (permission == null || permission.HostId == 0)
                            {
                                break;
                            }

                            managementServer = ManagementServerHelper.Get(permission.HostId);
                            if (managementServer == null)
                            {
                                break;
                            }

                            url = managementServer.Host + permission.Url;
                            HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                (s, exception) =>
                                {

                                });

                            break;
                        default:
                            break;
                    }
                }
            }

            var deviceIds = param.GetValue("deviceIds");
            if (!deviceIds.IsNullOrEmpty() && accountInfo.DeviceIds != deviceIds)
            {
                try
                {
                    deviceIds = deviceIds.Split(',').Select(int.Parse).Distinct().Join(",");
                    accountInfo.DeviceIds = deviceIds;
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }
            else
            {
                accountInfo.DeviceIds = "";
            }
            AccountHelper.UpdateAccountInfo(accountInfo);

            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam, accountInfo.Id);
            return Result.GenError<Result>(Error.Success);
        }

        [HttpGet("EmailType")]
        public DataResult EmailType()
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
            result.datas.AddRange(EmailHelper.GetTypes());;
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }
    }
}