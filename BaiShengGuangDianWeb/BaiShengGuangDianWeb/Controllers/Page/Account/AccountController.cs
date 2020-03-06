using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.Utils;

namespace BaiShengGuangDianWeb.Controllers.Page.Account
{
    public class AccountController : Controller
    {
        [AllowAnonymous]
        public IActionResult Login()
        {
            return View();
        }
        public IActionResult ResetPassword()
        {
            return View();
        }
    }
}