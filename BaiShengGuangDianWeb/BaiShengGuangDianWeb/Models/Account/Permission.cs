using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class Permission
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public bool IsPage { get; set; }
        public bool IsMenu { get; set; }
        public int Parent { get; set; }
        public int Order { get; set; }
        public string Icon { get; set; }
        public bool IsDelete { get; set; }

    }
}
