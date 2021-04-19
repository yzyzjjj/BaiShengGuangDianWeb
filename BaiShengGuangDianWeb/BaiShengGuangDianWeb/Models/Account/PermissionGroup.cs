using System.Collections.Generic;
using System.Linq;
using ModelBase.Models.BaseModel;
using Newtonsoft.Json;
using ServiceStack;

namespace BaiShengGuangDianWeb.Models.Account
{
    ///// <summary>
    /////1-99 页面相关  
    /////100 - 199 设备管理
    /////200 - 299 流程卡管理
    /////300 - 399 工艺管理
    /////400 - 499 维修管理
    /////500 - 599 数据统计
    /////600 - 599 设备点检
    /////700 - 799 计划管理
    /////800 - 899 物料管理
    /////900 - 999 6s管理
    ///// </summary>
    //public class Permission
    //{
    //    public int Id { get; set; }
    //    public string Name { get; set; }
    //    public string Url { get; set; }
    //    public bool IsPage { get; set; }
    //    public int Order { get; set; }
    //    public bool IsDelete { get; set; }
    //    public int HostId { get; set; }
    //    public string Verb { get; set; }
    //    public int Type { get; set; }
    //    public string Label { get; set; }
    //}

    /// <summary>
    ///1-99 页面相关  
    ///100 - 199 设备管理
    ///200 - 299 流程卡管理
    ///300 - 399 工艺管理
    ///400 - 499 维修管理
    ///500 - 599 数据统计
    ///600 - 599 设备点检
    ///700 - 799 计划管理
    ///800 - 899 物料管理
    ///900 - 999 6s管理
    /// </summary>
    public class PermissionGroup : CommonBase
    {
        /// <summary>
        /// 父级菜单
        /// </summary>
        public int Parent { get; set; }
        /// <summary>
        /// 菜单等级
        /// </summary>
        public int Level { get; set; }
        /// <summary>
        /// 自带权限Id
        /// </summary>
        public int Self { get; set; }
        /// <summary>
        /// 权限列表
        /// </summary>
        public string List { get; set; }
        [JsonIgnore]
        public IEnumerable<int> PList => List.IsNullOrEmpty() ? new List<int>() : List.Split(',').Select(int.Parse).Distinct();
        /// <summary>
        /// 功能名
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// 请求url
        /// </summary>
        public string Url { get; set; }
        /// <summary>
        /// 顺序
        /// </summary>
        public int Order { get; set; }
        /// <summary>
        /// 1 工作台；2 维修管理；3 系统管理 ；4 设备管理；5 设备点检；6 流程卡管理；7 工艺管理；8 生产管理； 9 计划管理； 10 物料管理； 11 6s检查； 12 数据统计 13 权限管理 14 预警管理
        /// </summary>
        public int Type { get; set; }
        /// <summary>
        /// 功能组，对应Type
        /// </summary>
        public string Label { get; set; }
        /// <summary>
        /// 是否是页面
        /// </summary>
        public bool IsPage { get; set; }
        /// <summary>
        /// 是否是菜单
        /// </summary>
        public bool IsMenu { get; set; }
        /// <summary>
        /// 图标
        /// </summary>
        public string Icon { get; set; }
    }
}
