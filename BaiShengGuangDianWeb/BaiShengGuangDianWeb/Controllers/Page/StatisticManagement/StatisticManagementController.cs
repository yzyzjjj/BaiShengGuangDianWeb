using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.StatisticManagement
{
    public class StatisticManagementController : Controller
    {
        /// <summary>
        /// 加工记录
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Trend()
        {
            return View();
        }

        public IActionResult Kanban()
        {
            return View();
        }
    }
}