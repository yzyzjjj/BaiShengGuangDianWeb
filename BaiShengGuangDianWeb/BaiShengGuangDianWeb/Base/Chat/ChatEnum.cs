using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Base.Chat
{
    public enum ChatEnum
    {
        Default,
        /// <summary>
        /// 连接
        /// </summary>
        Connect,
        /// <summary>
        /// 故障设备
        /// </summary>
        FaultDevice,
        /// <summary>
        /// 登出
        /// </summary>
        Logout,
    }
}
