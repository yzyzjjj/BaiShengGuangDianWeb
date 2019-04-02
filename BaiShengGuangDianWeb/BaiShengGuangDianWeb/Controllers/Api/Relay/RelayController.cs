using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.HttpServer;
using ModelBase.Base.Logger;
using ModelBase.Base.ServerConfig.Enum;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using Newtonsoft.Json.Linq;
using System;

namespace BaiShengGuangDianWeb.Controllers.Api.Relay
{
    [Route("Relay")]
    [ApiController]
    public class RelayController : ControllerBase
    {
        [HttpPost("Post")]
        public object Post()
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
            var opTypeStr = param.GetValue("opType");
            var opData = param.GetValue("opData", "");
            if (!int.TryParse(opTypeStr, out int opType))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var permission = PermissionHelper.Get(opType);
            if (permission == null || permission.HostId == 0)
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var managementServer = ManagementServerHelper.Get(permission.HostId);
            if (managementServer == null)
            {
                return Result.GenError<Result>(Error.ApiHostError);
            }

            var url = managementServer.Host + permission.Url;
            var result = HttpServer.Result(url, permission.Verb, opData);
            if (result == "fail")
            {
                return Result.GenError<Result>(Error.Fail);
            }

            try
            {
                return JObject.Parse(result);
            }
            catch (Exception e)
            {
                Log.ErrorFormat($"RelayController Error：{result}");
                return Result.GenError<Result>(Error.Fail);
            }
        }

    }
}