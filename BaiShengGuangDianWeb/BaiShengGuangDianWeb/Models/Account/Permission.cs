namespace BaiShengGuangDianWeb.Models.Account
{
    public class Permission
    {
        /// <summary>
        /// 1-99 页面相关;
        /// 100 - 199 设备管理;
        /// 200 - 299 流程卡管理;
        /// 300 - 399 工艺管理;
        /// 400 - 499 维修管理;
        /// </summary>
        public int Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public bool IsPage { get; set; }
        public bool IsMenu { get; set; }
        public int Parent { get; set; }
        public int Order { get; set; }
        public string Icon { get; set; }
        public bool IsDelete { get; set; }
        public int HostId { get; set; }
        public string Verb { get; set; }
        public int Type { get; set; }
        public string Label { get; set; }
    }

}
