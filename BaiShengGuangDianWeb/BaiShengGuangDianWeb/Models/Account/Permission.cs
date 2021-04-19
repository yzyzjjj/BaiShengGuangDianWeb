using ModelBase.Models.BaseModel;

namespace BaiShengGuangDianWeb.Models.Account
{
    /// <summary>
    /// Id
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
    public class Permission : CommonBase
    {
        /// <summary>
        /// 
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// 请求url
        /// </summary>
        public string Url { get; set; }
        ///// <summary>
        ///// 是否是页面
        ///// </summary>
        //public bool IsPage { get; set; }
        /// <summary>
        /// 顺序
        /// </summary>
        public int Order { get; set; }
        /// <summary>
        /// 请求url
        /// </summary>
        public int HostId { get; set; }
        /// <summary>
        /// 请求方式
        /// </summary>
        public string Verb { get; set; }
        /// <summary>
        /// 0  默认权限；1  工作台；2 组织管理；3 设备管理；4 流程卡管理；5 工艺管理；6 维修管理 7 数据统计 8 设备点检 9 计划管理 10 物料管理 11 6s管理 12 生产管理  13  预警管理  20 智慧工厂 99 设置
        /// </summary>
        public int Type { get; set; }
        /// <summary>
        /// 功能组，对应Type
        /// </summary>
        public string Label { get; set; }
    }
}
