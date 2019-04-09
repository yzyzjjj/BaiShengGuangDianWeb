using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.DeviceManagement
{
    public class DeviceManagementController : Controller
    {
        /// <summary>
        /// 设备管理
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 设备详情
        /// </summary>
        /// <returns></returns>
        public IActionResult Detail()
        {
            return View();
        }

        /// <summary>
        /// 设备控制
        /// </summary>
        /// <returns></returns>
        public IActionResult Control()
        {
            return View();
        }
        /// <summary>
        /// 设备型号库管理
        /// </summary>
        /// <returns></returns>
        public IActionResult DeviceModel()
        {
            return View();
        }

        /// <summary>
        /// 场地库管理
        /// </summary>
        /// <returns></returns>
        public IActionResult Site()
        {
            return View();
        }

        /// <summary>
        /// 固件库管理
        /// </summary>
        /// <returns></returns>
        public IActionResult FirmwareLibrary()
        {
            return View();
        }

        /// <summary>
        /// 硬件库管理
        /// </summary>
        /// <returns></returns>
        public IActionResult HardwareLibrary()
        {
            return View();
        }

        /// <summary>
        /// 设备类型库管理
        /// </summary>
        /// <returns></returns>
        public IActionResult DeviceCategory()
        {
            return View();
        }

        /// <summary>
        /// 流程库管理
        /// </summary>
        /// <returns></returns>
        public IActionResult ProcessLibrary()
        {
            return View();
        }
    }
}