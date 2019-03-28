using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.ServerConfig.Enum;
using ModelBase.Models.Result;

namespace BaiShengGuangDianWeb.Controllers.Api.Relay
{
    [Route("Relay")]
    [ApiController]
    [Authorize]
    public class RelayController : ControllerBase
    {
        [HttpPost("post")]
        public object Post([FromBody] object param)
        {
            










            return Result.GenError<Result>(Error.Fail);
        }

    }
}