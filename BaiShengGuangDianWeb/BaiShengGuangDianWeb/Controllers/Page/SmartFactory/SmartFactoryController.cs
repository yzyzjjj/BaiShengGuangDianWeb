using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.Warning
{
    public class SmartFactoryController : Controller
    {
        /// <summary>
        /// 智慧工厂
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }
    }
}