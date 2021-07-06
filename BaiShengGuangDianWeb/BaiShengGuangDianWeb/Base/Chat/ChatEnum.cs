using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Base.Chat
{
    public enum ChatEnum
    {
        Unknown,
        /// <summary>
        /// 回复
        /// </summary>
        Back,
        /// <summary>
        /// 连接
        /// </summary>
        Connect,
        /// <summary>
        /// 登出
        /// </summary>
        Logout,
        /// <summary>
        /// 测试
        /// </summary>
        Test,
        /// <summary>
        /// 故障设备
        /// </summary>
        FaultDevice,
        /// <summary>
        /// 更新连接Id
        /// </summary>
        RefreshId,
    }
}
