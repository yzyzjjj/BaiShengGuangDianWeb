using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Models.RequestBody;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.HttpServer;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using ServiceStack;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.Account
{
    /// <summary>
    /// 登陆/权限相关
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Route("Account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        [HttpPost("Login")]
        [AllowAnonymous]
        public Result Login()
        {
            var special = true;
            var param = Request.GetRequestParams();
            var loginBody = new LoginBody
            {
                Account = param.GetValue("account"),
                Password = param.GetValue("password")
            };
            var accountInfo = AccountHelper.GetAccountInfo(loginBody.Account);
            if (!special)
            {
                if (accountInfo == null)
                {
                    return Result.GenError<Result>(Error.AccountNotExist);
                }

                var pwd = AccountHelper.GenAccountPwdByOne(accountInfo.Account, loginBody.Password);
                if (accountInfo.Password != pwd)
                {
                    return Result.GenError<Result>(Error.PasswordError);
                }
            }
            else
            {
                //0 成功  1 账号不存在 2 密码错误
                var url = "http://192.168.1.100/indexlogins.php";
                if (accountInfo == null)
                {
                    return Result.GenError<Result>(Error.AccountNotExist);
                }

                var pwd = AccountHelper.GenAccountPwdByOne(accountInfo.Account, loginBody.Password);
                if (accountInfo.Password != pwd)
                {
                    var res = HttpServer.Post(url, new Dictionary<string, string>
                    {
                        {"dlname", loginBody.Account},
                        {"password", loginBody.Password},
                    });
                    if (res.Contains("0"))
                    {
                        accountInfo.Password = pwd;
                        AccountHelper.UpdateAccountInfo(accountInfo);
                        accountInfo = AccountHelper.GetAccountInfo(loginBody.Account);
                    }
                    else
                    {
                        return Result.GenError<Result>(Error.PasswordError);
                    }
                }
            }

            var token = TokenHelper.CreateJwtToken(accountInfo);
            CookieHelper.SetCookie("token", token, Response);
            OperateLogHelper.Log(Request, accountInfo.Id, Request.Path.Value, $"账号{accountInfo.Account}登录系统");
            return Result.GenError<Result>(Error.Success);
        }

        [HttpPost("Logout")]
        public Result Logout()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            CookieHelper.DelCookie("token", Response);
            OperateLogHelper.Log(Request, accountInfo.Id, Request.Path.Value, $"账号{accountInfo.Account}登出系统");
            return Result.GenError<Result>(Error.Success);
        }

        [HttpGet("Permission")]
        public CommonResult Permission()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<CommonResult>(Error.AccountNotExist);
            }

            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<CommonResult>(Error.NoAuth);
            }
            var result = new CommonResult { data = accountInfo.Permissions };
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        [HttpGet("Permissions")]
        public DataResult Permissions()
        {
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<DataResult>(Error.NoAuth);
            }
            var result = new DataResult();
            result.datas.AddRange(PermissionHelper.PermissionsList.Values.Where(x => x.Type != 0).Select(x => new { x.Id, x.Name, x.IsPage, x.Type, x.Label, x.Order, x.Parent }));
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        [HttpGet("OtherPermissions")]
        public DataResult OtherPermissions()
        {
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<DataResult>(Error.NoAuth);
            }
            var param = Request.GetRequestParams();
            var roleStr = param.GetValue("role");
            if (!int.TryParse(roleStr, out var role))
            {
                return Result.GenError<DataResult>(Error.ParamError);
            }

            var roleInfo = RoleHelper.GetRoleInfo(role);
            if (roleInfo == null)
            {
                return Result.GenError<DataResult>(Error.RoleNotExist);
            }

            var result = new DataResult();
            result.datas.AddRange(PermissionHelper.PermissionsList.Values.Where(x => x.Type != 0 && !roleInfo.PermissionsList.Contains(x.Id)).Select(x => new { x.Id, x.Name, x.IsPage, x.Type, x.Label, x.Order, x.Parent }));
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        [HttpGet("Pages")]
        public DataResult Pages()
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
            result.datas.AddRange(PermissionHelper.PermissionsList.Values
                .Where(x => !x.IsDelete && x.IsPage && x.IsMenu && accountInfo.PermissionsList.Any(y => y == x.Id)).Select(x => new { x.Id, x.Name, x.Url, x.Icon, x.Order, x.Parent }));
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        [HttpPost("DeletePermission")]
        public Result DeletePermission()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<CommonResult>(Error.AccountNotExist);
            }
            var param = Request.GetRequestParams();
            var permission = param.GetValue("permission");

            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<CommonResult>(Error.NoAuth);
            }

            if (!permission.IsNullOrEmpty())
            {
                var permissionList = permission.Split(",").Select(int.Parse).Distinct();
                PermissionHelper.Delete(permissionList);
                PermissionHelper.LoadConfig();
            }

            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return Result.GenError<Result>(Error.Success);
        }

    }
}