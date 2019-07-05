﻿using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using ModelBase.Base.Utils;
using ServiceStack;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Filter
{
    /// <summary>
    /// token过滤器
    /// </summary>
    public class TokenFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            //如果用户方位的Action带有AllowAnonymousAttribute，则不进行授权验证
            if (context.ActionDescriptor is ControllerActionDescriptor controllerActionDescriptor)
            {
                if (controllerActionDescriptor.MethodInfo.GetCustomAttributes(true).Any(x => x.GetType() == typeof(AllowAnonymousAttribute)))
                {
                    return;
                }
            }

            var token = CookieHelper.GetCookie("token", context.HttpContext.Request);
            var needUpdate = false;
            if (token.IsNullOrEmpty() || !TokenHelper.Validate(token, out needUpdate))
            {
                CookieHelper.DelCookie("token", context.HttpContext.Response);
                //未通过验证则跳转到无权限提示页
                context.Result = new RedirectToActionResult("Login", "Account", null);
                return;
            }

            if (needUpdate)
            {
                var newToken = TokenHelper.CreateJwtToken(AccountHelper.CurrentUser);
                CookieHelper.SetCookie("token", newToken, context.HttpContext.Response);
            }
            base.OnActionExecuting(context);
        }
    }
}
