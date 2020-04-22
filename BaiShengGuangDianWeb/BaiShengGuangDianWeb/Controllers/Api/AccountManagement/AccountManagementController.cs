﻿using BaiShengGuangDianWeb.Base.Helper;
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
                result.datas.AddRange(AccountHelper.GetAccountInfoAll());
            }
            else
            {
                result.datas.Add(AccountHelper.GetAccountInfo(id, true));
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
            var phone = param.GetValue("phone");
            var roleStr = param.GetValue("role");
            var permissions = param.GetValue("permissions");
            var isProcessor = param.GetValue("isProcessor");
            var allDeviceStr = param.GetValue("allDevice");
            var deviceIds = param.GetValue("deviceIds");
            var emailType = param.GetValue("emailType");
            if (account.IsNullOrEmpty() || account.IsNullOrEmpty() || name.IsNullOrEmpty() || roleStr.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }
            var accountInfo = AccountHelper.GetAccountInfo(account, true);
            if (accountInfo != null)
            {
                return Result.GenError<Result>(Error.AccountIsExist);
            }

            if (AccountHelper.GetAccountInfoByNameAll(name) != null)
            {
                return Result.GenError<Result>(Error.NameIsExist);
            }

            var roleList = roleStr.Split(",").GroupBy(x => x).Where(x => int.TryParse(x.Key, out var _)).Select(y => int.Parse(y.Key)).OrderBy(x => x);
            if (!roleList.Any())
            {
                return Result.GenError<Result>(Error.RoleNotSelect);
            }
            var roleInfos = RoleHelper.GetRoleInfos(roleList);
            if (roleInfos == null || !roleInfos.Any() || roleInfos.Count() != roleList.Count())
            {
                return Result.GenError<Result>(Error.RoleNotExist);
            }

            phone = phone.IsNullOrEmpty() ? "" : phone;
            if (!phone.IsNullOrEmpty() && !phone.IsPhone())
            {
                return Result.GenError<Result>(Error.PhoneError);
            }

            if (!permissions.IsNullOrEmpty())
            {
                try
                {
                    var rolePermissionsList = roleInfos.SelectMany(x => x.PermissionsList).Distinct();
                    var permissionList = permissions.Split(',').Select(int.Parse).ToList();
                    //permissionList.AddRange(PermissionHelper.GetDefault());
                    permissions = permissionList.Distinct().Where(x => !rolePermissionsList.Contains(x)).Join(",");
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }

            var allDevice = !allDeviceStr.IsNullOrEmpty() && allDeviceStr == "1";
            if (!allDevice && !deviceIds.IsNullOrEmpty())
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
            else
            {
                deviceIds = "";
            }

            var logParam = $"账号:{account},名字:{name},角色:{roleInfos.SelectMany(x => x.Name).Join(",")},手机号:{phone},邮箱:{email},邮件类型:{emailType},特殊权限列表:{permissions}";
            if (!isProcessor.IsNullOrEmpty())
            {
                try
                {
                    var isProcessorList = isProcessor.Split(',').Select(int.Parse).ToList();
                    logParam += $",生产角色:{isProcessor}";
                    isProcessor = isProcessorList.Join(",");
                    var opTypeList = new Dictionary<int, int>
                    {
                        {0, 251},
                        {1, 257},
                    };
                    foreach (var variable in isProcessorList)
                    {
                        if (opTypeList.ContainsKey(variable))
                        {
                            var opType = opTypeList[variable];
                            var permission = PermissionHelper.Get(opType);
                            if (permission == null || permission.HostId == 0)
                            {
                                continue;
                            }

                            var managementServer = ManagementServerHelper.Get(permission.HostId);
                            if (managementServer == null)
                            {
                                continue;
                            }

                            var opData = new
                            {
                                Account = account,
                                SurveyorName = name,
                                ProcessorName = name,
                            }.ToJSON();
                            var url = managementServer.Host + permission.Url;
                            HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                (s, exception) =>
                                {

                                });
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
                Password = AccountHelper.GenAccountPwdByOriginalPwd(account, password),
                Name = name,
                RoleList = roleList,
                Phone = phone,
                EmailType = emailType,
                EmailAddress = email,
                SelfPermissions = permissions ?? "",
                AllDevice = allDevice,
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
                accountInfo = AccountHelper.GetAccountInfo(id, true);
            }
            else
            {
                accountInfo = AccountHelper.GetAccountInfo(accountStr, true);
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
            int opType;
            Permission permission;
            if (!accountInfo.ProductionRole.IsNullOrEmpty())
            {
                var isProcessor = accountInfo.ProductionRole;
                try
                {
                    var isProcessorList = isProcessor.Split(',').Select(int.Parse).ToList();
                    logParam += $",生产角色:{isProcessor}";
                    var opTypeList = new Dictionary<int, int>
                    {
                        {0, 253},
                        {1, 259},
                    };
                    foreach (var variable in isProcessorList)
                    {
                        if (opTypeList.ContainsKey(variable))
                        {
                            opType = opTypeList[variable];
                            permission = PermissionHelper.Get(opType);
                            if (permission == null || permission.HostId == 0)
                            {
                                continue;
                            }

                            var managementServer = ManagementServerHelper.Get(permission.HostId);
                            if (managementServer == null)
                            {
                                continue;
                            }

                            var opData = new
                            {
                                accountInfo.Account,
                            }.ToJSON();
                            var url = managementServer.Host + permission.Url;
                            HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                (s, exception) =>
                                {

                                });
                        }
                    }
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }

            opType = 431;
            permission = PermissionHelper.Get(opType);
            if (permission != null && permission.HostId != 0)
            {
                var managementServer = ManagementServerHelper.Get(permission.HostId);
                if (managementServer != null)
                {
                    var opData = new[]
                    {
                        new
                        {
                            accountInfo.Account,
                            WebOp = 2
                        }
                    }.ToJSON();
                    var url = managementServer.Host + permission.Url;
                    HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                        (s, exception) =>
                        {

                        });
                }
            }

            OrganizationUnitHelper.DeleteMemberByAccountId(accountInfo.Id);
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
                accountInfo = AccountHelper.GetAccountInfo(id, true);
            }
            else
            {
                accountInfo = AccountHelper.GetAccountInfo(accountStr, true);
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
                var pwd = AccountHelper.GenAccountPwdByOriginalPwd(accountInfo.Account, password);
                if (accountInfo.Password != pwd)
                {
                    logParam = $",密码:{accountInfo.Password},新密码明文/密文:{password}/{pwd}";
                    accountInfo.Password = pwd;
                }
            }

            //Phone
            var phone = param.GetValue("phone");
            phone = phone.IsNullOrEmpty() ? "" : phone;
            if (accountInfo.Phone != phone)
            {
                if (!phone.IsNullOrEmpty() && !phone.IsPhone())
                {
                    return Result.GenError<Result>(Error.PhoneError);
                }
                logParam = $",邮箱:{accountInfo.Phone},新邮箱:{phone}";
                accountInfo.Phone = phone;
            }


            //EmailAddress
            var email = param.GetValue("email");
            email = email.IsNullOrEmpty() ? "" : email;
            if (accountInfo.EmailAddress != email)
            {
                logParam = $",邮箱:{accountInfo.EmailAddress},新邮箱:{email}";
                accountInfo.EmailAddress = email;
            }

            //EmailAddress
            var emailType = param.GetValue("emailType");
            emailType = emailType.IsNullOrEmpty() ? "" : emailType;
            if (accountInfo.EmailType != emailType)
            {
                logParam = $",邮件类型:{accountInfo.EmailType},新邮件类型:{emailType}";
                accountInfo.EmailType = emailType;
                fName = true;
            }

            //Role
            var roleStr = param.GetValue("role");
            roleStr = roleStr.IsNullOrEmpty() ? "" : roleStr;
            var roleList = roleStr.Split(",").GroupBy(x => x).Where(x => int.TryParse(x.Key, out var _)).Select(y => int.Parse(y.Key)).OrderBy(x => x);
            if (!roleList.Any())
            {
                return Result.GenError<Result>(Error.RoleNotSelect);
            }

            if (!accountInfo.RoleList.SequenceEqual(roleList))
            {
                var roleInfos = RoleHelper.GetRoleInfos(roleList, true);
                if (roleInfos == null || !roleInfos.Any() || roleInfos.Count() != roleList.Count())
                {
                    return Result.GenError<Result>(Error.RoleNotExist);
                }
                logParam = $",角色ID:{accountInfo.Role},角色名:{accountInfo.RoleName},新角色ID:{roleInfos.Select(x => x.Id).Join(",")},新角色名:{roleInfos.Select(x => x.Name).Join(",")}";
                accountInfo.RoleList = roleList;
            }

            //Permissions
            var permissions = param.GetValue("permissions");
            if (!permissions.IsNullOrEmpty() && accountInfo.SelfPermissions != permissions)
            {
                try
                {
                    var roleInfos = RoleHelper.GetRoleInfos(accountInfo.RoleList);
                    var rolePermissionsList = roleInfos.SelectMany(x => x.PermissionsList).Distinct();
                    var permissionList = permissions.Split(',').Select(int.Parse).ToList();
                    //permissionList.AddRange(PermissionHelper.GetDefault());
                    permissions = permissionList.Distinct().Where(x => !rolePermissionsList.Contains(x)).Join(",");
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
            int opType;
            Permission permission;
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

                    var opTypeList = new Dictionary<int, Tuple<int, int, int>>
                    {
                        {0, new Tuple<int,int,int>(253, 250, 251)},
                        {1, new Tuple<int,int,int>(259, 256, 257)},
                    };

                    foreach (var variable in all.Distinct())
                    {
                        if (opTypeList.ContainsKey(variable))
                        {
                            var op = opTypeList[variable];
                            //上一次包含,本次不包含 = 删除
                            string opData;
                            if (oldProductionRoleList.Contains(variable) && !isProcessorList.Contains(variable))
                            {
                                //已存在 = 删除
                                if (maxProductionRoleList.Contains(variable))
                                {
                                    opType = op.Item1;
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
                                    opType = op.Item2;
                                    opData = new
                                    {
                                        id = accountInfo.Account,
                                        MarkedDelete = false,
                                        ProcessorName = accountInfo.Name,
                                        SurveyorName = accountInfo.Name,
                                        accountInfo.Account
                                    }.ToJSON();
                                }
                                //不存在 = 添加
                                else
                                {
                                    opType = op.Item3;
                                    opData = new
                                    {
                                        ProcessorName = accountInfo.Name,
                                        SurveyorName = accountInfo.Name,
                                        accountInfo.Account
                                    }.ToJSON();
                                }
                            }
                            else
                            {
                                continue;
                            }
                            permission = PermissionHelper.Get(opType);
                            if (permission == null || permission.HostId == 0)
                            {
                                continue;
                            }

                            var managementServer = ManagementServerHelper.Get(permission.HostId);
                            if (managementServer == null)
                            {
                                continue;
                            }

                            var url = managementServer.Host + permission.Url;
                            HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                                (s, exception) =>
                                {

                                });
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

            var allDeviceStr = param.GetValue("allDevice");
            var allDevice = !allDeviceStr.IsNullOrEmpty() && allDeviceStr == "1";
            var deviceIds = param.GetValue("deviceIds");
            accountInfo.AllDevice = allDevice;
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

            opType = 431;
            permission = PermissionHelper.Get(opType);
            if (permission != null && permission.HostId != 0)
            {
                var managementServer = ManagementServerHelper.Get(permission.HostId);
                if (managementServer != null)
                {
                    var opData = new[]
                    {
                        new
                        {
                            accountInfo.Name,
                            accountInfo.Phone,
                            accountInfo.Account,
                            WebOp = 1
                        }
                    }.ToJSON();
                    var url = managementServer.Host + permission.Url;
                    HttpServer.ResultAsync(AccountHelper.CurrentUser.Account, url, permission.Verb, opData,
                        (s, exception) =>
                        {

                        });
                }
            }
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
            result.datas.AddRange(EmailHelper.GetTypes()); ;
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }
    }
}