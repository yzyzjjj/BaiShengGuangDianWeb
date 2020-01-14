using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class RoleInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Default { get; set; }
        public bool IsDeleted { get; set; }
        public string Permissions { get; set; }
        public IEnumerable<int> PermissionsList => Permissions.Split(',').Select(int.Parse).Distinct();

    }
}
