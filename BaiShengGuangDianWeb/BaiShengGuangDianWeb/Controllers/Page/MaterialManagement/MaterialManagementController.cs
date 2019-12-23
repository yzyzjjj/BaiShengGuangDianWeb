using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.MaterialManagement
{
    public class MaterialManagementController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        /// <summary>
        /// 货品管理
        /// </summary>
        /// <returns></returns>
        public IActionResult Product()
        {
            return View();
        }
        /// <summary>
        /// 类别
        /// </summary>
        /// <returns></returns>
        public IActionResult Category()
        {
            return View();
        }
        /// <summary>
        ///  名称
        /// </summary>
        /// <returns></returns>
        public IActionResult Name()
        {
            return View();
        }
        /// <summary>
        /// 供应商
        /// </summary>
        /// <returns></returns>
        public IActionResult Supplier()
        {
            return View();
        }
        /// <summary>
        /// 规格
        /// </summary>
        /// <returns></returns>
        public IActionResult Specification()
        {
            return View();
        }
        /// <summary>
        /// 位置
        /// </summary>
        /// <returns></returns>
        public IActionResult Site()
        {
            return View();
        }
    }
}