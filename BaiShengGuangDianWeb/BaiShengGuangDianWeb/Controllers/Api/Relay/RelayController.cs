using BaiShengGuangDianWeb.Base.FileConfig;
using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.HttpServer;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ServiceStack;
using System;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.Relay
{
    [Microsoft.AspNetCore.Mvc.Route("Relay")]
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
            //if (!PermissionHelper.CheckPermission(Request.Path.Value))
            //{
            //    return Result.GenError<Result>(Error.NoAuth);
            //}

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
            url = "http://192.168.1.184:62101" + permission.Url;
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
                OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, opType, logParam.ToJSON());
                if (opType != 100 || AccountHelper.CurrentUser.AllDevice)
                {
                    return JObject.Parse(result);
                }

                var ret = new DataResult();
                if (!AccountHelper.CurrentUser.DeviceIds.IsNullOrEmpty())
                {
                    var dataResult = JsonConvert.DeserializeObject<DataResult>(result);
                    foreach (var data in dataResult.datas)
                    {
                        var id = (JObject.Parse(data.ToString()))["Id"].ToObject<int>();
                        if (AccountHelper.CurrentUser.DeviceIdsList.Contains(id))
                        {
                            ret.datas.Add(data);
                        }
                    }
                }

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