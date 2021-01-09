using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.Warning
{
    public class WarningController : Controller
    {
        /// <summary>
        /// 预警记录
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Set()
        {
            return View();
        }
    }
}