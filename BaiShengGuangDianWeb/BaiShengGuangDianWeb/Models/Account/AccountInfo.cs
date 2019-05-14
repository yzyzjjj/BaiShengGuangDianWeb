using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

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
        public int Role { get; set; }
        public string RoleName { get; set; }
        public string EmailAddress { get; set; }
        [JsonIgnore]
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
