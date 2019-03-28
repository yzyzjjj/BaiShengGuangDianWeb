using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.RequestBody;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.ServerConfig.Enum;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.Account
{
    [Route("Account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        [HttpPost("Login")]
        [AllowAnonymous]
        public Result Login()
        {
            var param = Request.GetRequestParams();
            var loginBody = new LoginBody
            {
                Account = param.GetValue("Account"),
                Password = param.GetValue("Password")
            };

            var accountInfo = AccountHelper.GetAccountInfo(loginBody.Account);
            if (accountInfo == null)
            {
                return Result.GenError<CommonResult>(Error.AccountNotExist);
            }

            var pwd = AccountHelper.GenAccountPwd(accountInfo.Id, loginBody.Password);
            if (accountInfo.Password != pwd)
            {
                return Result.GenError<CommonResult>(Error.PasswordError);
            }

            var token = TokenHelper.CreateJwtToken(accountInfo);
            CookieHelper.SetCookie("token", token, Response);
            return Result.GenError<CommonResult>(Error.Success);
        }

        [HttpPost("Logout")]
        public Result Logout()
        {
            CookieHelper.DelCookie("token", Response);
            return Result.GenError<Result>(Error.Success);
        }

        [HttpGet("Permission")]
        public CommonResult Permission()
        {
            var accountInfo = AccountHelper.GetAccountInfo(AccountHelper.CurrentUser.Account);
            if (accountInfo == null)
            {
                return Result.GenError<CommonResult>(Error.AccountNotExist);
            }

            var result = new CommonResult { data = accountInfo.Permissions };
            return result;
        }

        [HttpGet("Permissions")]
        public DataResult Permissions()
        {
            var result = new DataResult();
            result.datas.AddRange(ServerConfig.WebDb.Query<dynamic>("SELECT Id, `Name` FROM `permissions` WHERE IsDelete = 0;"));
            return result;
        }

        [HttpGet("Pages")]
        public DataResult Pages()
        {
            var accountInfo = AccountHelper.GetAccountInfo(AccountHelper.CurrentUser.Account);
            if (accountInfo == null)
            {
                return Result.GenError<DataResult>(Error.AccountNotExist);
            }

            var result = new DataResult();
            result.datas.AddRange(ServerConfig.WebDb.Query<Models.Account.Page>("SELECT Id, `Name`, Url, Parent, `Order`, `Icon` FROM `permissions` " +
                                                                    "WHERE IsDelete = 0 AND IsPage = 1 AND IsMenu = 1 AND FIND_IN_SET(Id, @Permissions);", new
                                                                    {
                                                                        Permissions = accountInfo.Permissions + ","
                                                                    }));
            return result;
        }
    }
}