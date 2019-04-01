using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.ServerConfig.Enum;
using ModelBase.Models.Result;

namespace BaiShengGuangDianWeb.Controllers.Api.Relay
{
    [Route("Relay")]
    [ApiController]
    public class RelayController : ControllerBase
    {
        [HttpPost("Post")]
        public object Post([FromBody] object param)
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            
                








            return Result.GenError<Result>(Error.Fail);
        }

    }
}