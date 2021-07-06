using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.Utils;
using ServiceStack;

namespace BaiShengGuangDianWeb.Controllers.Page.Account
{
    public class AccountController : Controller
    {
        [AllowAnonymous]
        public IActionResult Login()
        {
            ViewData["n"] = CookieHelper.GetCookie("n", Request);
            ViewData["p"] = CookieHelper.GetCookie("p", Request);
            ViewData["r"] = !CookieHelper.GetCookie("n", Request).IsNullOrEmpty();
            return View();
        }
        public IActionResult ResetPassword()
        {
            return View();
        }
    }
}