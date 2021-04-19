using System;
using Newtonsoft.Json;
using ServiceStack;
using System.Collections.Generic;
using System.Linq;
using ModelBase.Models.BaseModel;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class AccountInfo : CommonBase
    {
        /// <summary>
        /// 员工工号
        /// </summary>
        public string Number { get; set; }
        /// <summary>
        /// 账号
        /// </summary>
        public string Account { get; set; }
        /// <summary>
        /// 密码
        /// </summary>
        [JsonIgnore]
        public string Password { get; set; }
        /// <summary>
        /// 姓名
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// 角色
        /// </summary>
        public string Role { get; set; }
        public string RoleName { get; set; }
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
        /// <summary>
        /// 手机号
        /// </summary>
        public string Phone { get; set; }
        /// <summary>
        /// 邮件通知类型
        /// </summary>
        public string EmailType { get; set; }
        /// <summary>
        /// 邮件
        /// </summary>
        public string EmailAddress { get; set; }
        /// <summary>
        /// 是否弃用
        /// </summary>
        [Obsolete("弃用，改为MarkedDelete")]
        public bool IsDeleted { get; set; }
        /// <summary>
        /// 权限ID
        /// </summary>
        [JsonIgnore]
        public string SelfPermissions { get; set; }
        /// <summary>
        /// 所有机台
        /// </summary>
        public bool AllDevice { get; set; }
        /// <summary>
        /// 机台号
        /// </summary>
        public string DeviceIds { get; set; }
        /// <summary>
        /// 0生产员
        /// </summary>
        public string ProductionRole { get; set; }
        /// <summary>
        /// 0生产员
        /// </summary>
        [JsonIgnore]
        public string MaxProductionRole { get; set; }
        /// <summary>
        /// 权限组id
        /// </summary>
        public string Permissions { get; set; }
        /// <summary>
        /// 权限组id
        /// </summary>
        [JsonIgnore]
        public IEnumerable<int> PermissionsList => Permissions.IsNullOrEmpty() ? new List<int>() : Permissions.Split(',').Select(int.Parse).Distinct();
        [JsonIgnore]
        public IEnumerable<int> DeviceIdsList => DeviceIds.IsNullOrEmpty() ? new List<int>() : DeviceIds.Split(',').Select(int.Parse).Distinct();
        /// <summary>
        /// 是否为系统默认账号
        /// </summary>
        [JsonIgnore]
        public bool Default { get; set; }
        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }
        /// <summary>
        /// 备注
        /// </summary>
        public bool IsErp { get; set; }
        /// <summary>
        /// 上次登录时间
        /// </summary>
        public DateTime LoginTime { get; set; }
        /// <summary>
        /// 上次登出时间
        /// </summary>
        public DateTime LogoutTime { get; set; }
        /// <summary>
        /// 备注
        /// </summary>
        public int LoginCount { get; set; }
    }
}
