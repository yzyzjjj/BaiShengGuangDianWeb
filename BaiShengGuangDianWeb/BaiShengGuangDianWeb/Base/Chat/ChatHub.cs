using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Base.Chat
{
    public class ChatHub : Hub
    {
        //SendMsg用于前端调用
        public Task SendMsg(ChatMessage info)
        {
            //在客户端实现此处的方法
            var cid = Context.ConnectionId;
            JObject msg;
            switch (info.ChatEnum)
            {
                case ChatEnum.Connect:
                    msg = JObject.Parse(info.Message.ToString());
                    ChatHelper.AddConnectionId(msg["Id"].ToObject<int>(), cid);
                    break;
                case ChatEnum.Logout:
                    msg = JObject.Parse(info.Message.ToString());
                    ChatHelper.RemoveConnectionId(msg["Id"].ToObject<int>(), cid);
                    break;
                case ChatEnum.FaultDevice:
                    msg = JObject.Parse(info.Message.ToString());
                    var mailList = new List<string>();
                    var admin = msg["Admin"].ToObject<string>();
                    var acc = AccountHelper.GetAccountInfo(admin);
                    if (acc != null)
                    {
                        mailList.Add(acc.EmailAddress);
                        var connectionInfos = ChatHelper.GetSingleConnectionId(acc.Id);
                        var groupName = acc.Id.ToString();
                        foreach (var connectionInfo in connectionInfos)
                        {
                            Groups.AddToGroupAsync(connectionInfo.ConnectionId, groupName);
                        }

                        Clients.Group(groupName).SendAsync(info.ChatEnum.ToString(), info.Message);
                    }

                    EmailHelper.Send($"{msg["Code"].ToObject<string>()} 故障提醒!!!",
                        $"<span style=\"color: red\">{msg["Code"].ToObject<string>()}</span>出现故障, 上报时间:{DateTime.Now}", mailList, 1);
                    break;
            }

            info.Message = "success";
            return Clients.Client(cid).SendAsync(ChatEnum.Default.ToString(), info.Message);
        }

    }
}
