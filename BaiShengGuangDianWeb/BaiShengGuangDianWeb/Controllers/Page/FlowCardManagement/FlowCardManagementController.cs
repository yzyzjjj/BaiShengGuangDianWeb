﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace BaiShengGuangDianWeb.Controllers.Page.FlowCardManagement
{
    public class FlowCardManagementController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}