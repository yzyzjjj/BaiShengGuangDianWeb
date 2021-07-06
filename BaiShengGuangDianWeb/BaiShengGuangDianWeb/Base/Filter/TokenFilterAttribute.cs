using BaiShengGuangDianWeb.Base.Helper;
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
            bool isApi = false;
            //如果用户方位的Action带有AllowAnonymousAttribute，则不进行授权验证
            if (context.ActionDescriptor is ControllerActionDescriptor controllerActionDescriptor)
            {
                if (controllerActionDescriptor.MethodInfo.GetCustomAttributes(true).Any(x => x.GetType() == typeof(AllowAnonymousAttribute)))
                {
                    return;
                }
                if (controllerActionDescriptor.MethodInfo.DeclaringType.GetCustomAttributes(true).Any(x => x.GetType() == typeof(ApiControllerAttribute)))
                {
                    isApi = true;
                }
                if (!isApi)
                {
                    CookieHelper.SetCookie("lastLocation", context.HttpContext.Request.Path, context.HttpContext.Response);
                }
            }

            var token = CookieHelper.GetCookie("token", context.HttpContext.Request);
            var per = CookieHelper.GetCookie("per", context.HttpContext.Request);
            //未通过验证则跳转到登录页
            if (per.IsNullOrEmpty() || token.IsNullOrEmpty() || !TokenHelper.Validate(token, per, out var needUpdate))
            {
                CookieHelper.DelCookie("token", context.HttpContext.Response);
                CookieHelper.DelCookie("per", context.HttpContext.Response);
                if (isApi)
                {
                    context.Result = new JsonResult("/Account/Login");
                }
                else
                {
                    context.Result = new RedirectToActionResult("Login", "Account", null);
                }
                return;
            }

            if (needUpdate != 0)
            {
                switch (needUpdate)
                {
                    case 1:
                        CookieHelper.SetCookie("token", TokenHelper.CreateJwtToken(AccountInfoHelper.CurrentUser), context.HttpContext.Response); break;
                    case 2:
                        CookieHelper.SetCookie("per", AccountInfoHelper.CurrentUser.PermissionsList.Join(), context.HttpContext.Response); break;
                    case 3:
                        CookieHelper.SetCookie("token", TokenHelper.CreateJwtToken(AccountInfoHelper.CurrentUser), context.HttpContext.Response);
                        CookieHelper.SetCookie("per", AccountInfoHelper.CurrentUser.PermissionsList.Join(), context.HttpContext.Response); break;
                }
            }
            base.OnActionExecuting(context);
        }
    }
}
