using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.HttpServer;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;

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
            if (!int.TryParse(opTypeStr, out var opType))
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
            var result = HttpServer.Result(AccountHelper.CurrentUser.Account, url, permission.Verb, opData);
            if (result == "fail")
            {
                return Result.GenError<Result>(Error.Fail);
            }

            try
            {
                var logParam = new
                {
                    opName = permission.Name,
                    opData,
                };
                OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam.ToJSON());
                if (opType != 100)
                {
                    return JObject.Parse(result);
                }

                if (StringHelper.IsAnyNullOrWhiteSpace(AccountHelper.CurrentUser.DeviceIds))
                {
                    return JObject.Parse(result);
                }

                var ret = JsonConvert.DeserializeObject<DataResult>(result);
                var datas = new List<dynamic>();
                foreach (var data in ret.datas)
                {
                    var id = (JObject.Parse(data.ToString()))["Id"].ToObject<int>();
                    if (AccountHelper.CurrentUser.DeviceIdsList.Contains(id))
                    {
                        datas.Add(data);
                    }
                }

                ret.datas = datas;
                return ret;
            }
            catch (Exception e)
            {
                Log.ErrorFormat($"RelayController Error：{result},Message：{e.Message}");
                return Result.GenError<Result>(Error.Fail);
            }
        }

    }
}