using Newtonsoft.Json;
using ServiceStack;
using System.Collections.Generic;
using System.Linq;
using ModelBase.Base.Utils;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class AccountInfo
    {
        /// <summary>
        /// 账号Id
        /// </summary>
        public int Id { get; set; }
        public string Account { get; set; }
        [JsonIgnore]
        public string Password { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        private IEnumerable<int> _roleList { get; set; }
        public IEnumerable<int> RoleList
        {
            get => _roleList ?? (_roleList = !Role.IsNullOrEmpty() ? Role.Split(",").Select(int.Parse) : new List<int>());
            set
            {
                _roleList = value;
                Role = _roleList.Join(",");
            }
        }

        public string RoleName { get; set; }
        public string EmailType { get; set; }
        public string EmailAddress { get; set; }
        public bool IsDeleted { get; set; }
        [JsonIgnore]
        public string SelfPermissions { get; set; }
        public string Permissions { get; set; }
        [JsonIgnore]
        public IEnumerable<int> PermissionsList => Permissions.Split(',').Select(int.Parse).Distinct();
        public string DeviceIds { get; set; }
        [JsonIgnore]
        public IEnumerable<int> DeviceIdsList => DeviceIds.Split(',').Select(int.Parse).Distinct();
        [JsonIgnore]
        public bool Default { get; set; }
        public string ProductionRole { get; set; }
        [JsonIgnore]
        public string MaxProductionRole { get; set; }
    }
}
