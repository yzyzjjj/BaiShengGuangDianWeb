using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.DeviceSpotCheck
{
    public class DeviceSpotCheckController : Controller
    {
        /// <summary>
        /// 设备点检
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }
        /// <summary>
        /// 设备点检记录
        /// </summary>
        /// <returns></returns>
        public IActionResult SpotCheckLog()
        {
            return View();
        }
        /// <summary>
        /// 设备点检配置
        /// </summary>
        /// <returns></returns>
        public IActionResult DeviceSpotCheck()
        {
            return View();
        }
        /// <summary>
        /// 点检计划设置
        /// </summary>
        /// <returns></returns>
        public IActionResult SpotCheckPlan()
        {
            return View();
        }
    }
}