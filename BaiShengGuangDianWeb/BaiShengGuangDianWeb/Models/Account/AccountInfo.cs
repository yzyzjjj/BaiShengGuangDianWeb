using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

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
        public string EmailAddress { get; set; }
        [JsonIgnore]
        public bool IsDeleted { get; set; }
        [JsonIgnore]
        public string SelfPermissions { get; set; }
        public string Permissions { get; set; }
    }
}
