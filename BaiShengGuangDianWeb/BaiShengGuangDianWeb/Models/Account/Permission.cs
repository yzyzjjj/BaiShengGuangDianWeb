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
    public class Permission
    {
        public int Id { get; set; }
        public int Parent { get; set; }
        public int Level { get; set; }
        public int Self { get; set; }
        public string List { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public bool IsPage { get; set; }
        public int Order { get; set; }
        public bool IsDelete { get; set; }
        public int HostId { get; set; }
        public string Verb { get; set; }
        public int Type { get; set; }
        public string Label { get; set; }
        public string Icon { get; set; }
    }
}
