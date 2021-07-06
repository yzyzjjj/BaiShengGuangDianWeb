using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.Setting
{
    public class SettingController : Controller
    {
        public IActionResult Permissions()
        {
            return View();
        }
        public IActionResult ApiTesting()
        {
            return View();
        }
        public IActionResult Chat()
        {
            return View();
        }
    }
}