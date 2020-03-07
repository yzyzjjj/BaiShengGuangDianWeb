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
            //如果用户方位的Action带有AllowAnonymousAttribute，则不进行授权验证
            if (context.ActionDescriptor is ControllerActionDescriptor controllerActionDescriptor)
            {
                if (controllerActionDescriptor.MethodInfo.GetCustomAttributes(true).Any(x => x.GetType() == typeof(AllowAnonymousAttribute)))
                {
                    return;
                }
            }

            var token = CookieHelper.GetCookie("token", context.HttpContext.Request);
            var per = CookieHelper.GetCookie("per", context.HttpContext.Request);
            if (per.IsNullOrEmpty() || token.IsNullOrEmpty() || !TokenHelper.Validate(token, per, out var needUpdate))
            {
                CookieHelper.DelCookie("token", context.HttpContext.Response);
                CookieHelper.DelCookie("per", context.HttpContext.Response);
                //未通过验证则跳转到无权限提示页
                context.Result = new RedirectToActionResult("Login", "Account", null);
                return;
            }

            if (needUpdate != 0)
            {
                switch (needUpdate)
                {
                    case 1:
                        CookieHelper.SetCookie("token", TokenHelper.CreateJwtToken(AccountHelper.CurrentUser), context.HttpContext.Response); break;
                    case 2:
                        CookieHelper.SetCookie("per", AccountHelper.CurrentUser.PermissionsList.Join(), context.HttpContext.Response); break;
                    case 3:
                        CookieHelper.SetCookie("token", TokenHelper.CreateJwtToken(AccountHelper.CurrentUser), context.HttpContext.Response);
                        CookieHelper.SetCookie("per", AccountHelper.CurrentUser.PermissionsList.Join(), context.HttpContext.Response); break;
                }
            }
            base.OnActionExecuting(context);
        }
    }
}
