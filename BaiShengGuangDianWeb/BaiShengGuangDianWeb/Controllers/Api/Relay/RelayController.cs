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
using BaiShengGuangDianWeb.Models.Account;

namespace BaiShengGuangDianWeb.Controllers.Api.Relay
{
    [Microsoft.AspNetCore.Mvc.Route("Relay")]
    [ApiController]
    public class RelayController : ControllerBase
    {
        [HttpPost("Post")]
        public object Post()
        {
            if (AccountInfoHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            Console.WriteLine(AccountInfoHelper.CurrentUser.Name);
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
            if (permission == null)
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            if (permission.Type != 0 && permission.HostId != 0 && !PermissionHelper.CheckPermission(AccountInfoHelper.CurrentUser.PermissionsList, opType))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }
            var managementServer = ManagementServerHelper.Get(permission.HostId);
            if (managementServer == null)
            {
                return Result.GenError<Result>(Error.ApiHostError);
            }

            var url = managementServer.Host + permission.Url;
#if  DEBUG
            url = "http://192.168.1.184:62101" + permission.Url;
            //url = "http://192.168.1.142:61103" + permission.Url;
#endif
            var result = HttpServer.Result(AccountInfoHelper.CurrentUser.Account, url, permission.Verb, opData);
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
                OperateLogHelper.Log(Request, AccountInfoHelper.CurrentUser.Id, opType, logParam.ToJSON());
                if (opType != 100 || AccountInfoHelper.CurrentUser.AllDevice)
                {
                    return JObject.Parse(result);
                }

                var ret = new DataResult();
                if (!AccountInfoHelper.CurrentUser.DeviceIds.IsNullOrEmpty())
                {
                    var dataResult = JsonConvert.DeserializeObject<DataResult>(result);
                    foreach (var data in dataResult.datas)
                    {
                        var id = (JObject.Parse(data.ToString()))["Id"].ToObject<int>();
                        if (AccountInfoHelper.CurrentUser.DeviceIdsList.Contains(id))
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