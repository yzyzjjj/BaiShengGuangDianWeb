using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ModelBase.Base.Utils;

namespace BaiShengGuangDianWeb.Base.Chat
{
    public class ChatHub : Hub
    {
        //private static int _t = 0;
        //SendMsg用于前端调用
        public Task SendMsg(ChatMessage info)
        {
            //在客户端实现此处的方法
            var cid = Context.ConnectionId;
            JObject msg;
            int id;
            switch (info.ChatEnum)
            {
                case ChatEnum.Connect:
                    if (int.TryParse(info.Message.ToString(), out id))
                        ChatHelper.AddConnectionId(id, cid);
                    else
                        info.ChatEnum = ChatEnum.Back;
                    info.Message = info.ChatEnum + (info.ChatEnum == ChatEnum.Back ? $" Fail,{cid}" : $" Success,{cid}");
                    break;
                case ChatEnum.Logout:
                    if (int.TryParse(info.Message.ToString(), out id))
                        ChatHelper.RemoveConnectionId(id, cid);
                    else
                        info.ChatEnum = ChatEnum.Back;
                    info.Message = info.ChatEnum + (info.ChatEnum == ChatEnum.Back ? " Fail" : " Success");
                    break;
                case ChatEnum.Test:
                    return Clients.All.SendAsync(info.ChatEnum.ToString(), info.Message.ToString());
                case ChatEnum.RefreshId:
                    msg = JObject.Parse(info.Message.ToString());
                    ChatHelper.RemoveConnectionId(msg["Id"].ToObject<int>(), msg["CId"].ToObject<string>());
                    info.Message = $"{info.ChatEnum.ToString()} Success,{cid}";
                    break;
                case ChatEnum.FaultDevice:
                    msg = JObject.Parse(info.Message.ToString());
                    var mailList = new List<string>();
                    var admin = msg["Admin"].ToObject<string>();
                    var acc = AccountInfoHelper.GetAccountInfo(admin);
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
                    info.ChatEnum = ChatEnum.Back;
                    info.Message = info.ChatEnum + " Success";
                    break;
            }
            return Clients.Caller.SendAsync(info.ChatEnum.ToString(), info.Message);
            //return Clients.Client(cid).SendAsync(info.ChatEnum.ToString(), info.Message);
            // 通知所有用户，有新用户连接
            //return Clients.AllExcept(cid).SendAsync(info.ChatEnum.ToString(), info.Message);
        }
    }
}
