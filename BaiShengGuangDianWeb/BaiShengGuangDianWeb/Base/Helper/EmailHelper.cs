using BaiShengGuangDianWeb.Base.Server;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using ModelBase.Models.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Base.Helper
{
    /// <summary>
    /// 邮件
    /// </summary>
    public class EmailHelper
    {
        public static IEnumerable<MailType> GetTypes()
        {
            return ServerConfig.WebDb.Query<MailType>("SELECT * FROM `email_type`;");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="subject">邮件标题</param>
        /// <param name="body">邮件内容</param>
        /// <param name="emailAddress">邮件列表</param>
        /// <param name="mailType">邮件类型</param>
        public static void Send(string subject, string body, List<string> emailAddress, int mailType)
        {
            var mailMessage = new MailMessage();
            emailAddress = emailAddress.Where(RegexString.IsEmail).ToList();
            emailAddress.AddRange(ServerConfig.WebDb.Query<string>("SELECT EmailAddress FROM `accounts` WHERE IsDeleted = 0 AND FIND_IN_SET(@EmailType, EmailType)", new
            {
                EmailType = mailType
            }).Where(RegexString.IsEmail));
            if (!emailAddress.Any())
            {
                return;
            }
            emailAddress.ForEach(e => mailMessage.To.Add(e));

            mailMessage.From = new MailAddress(ServerConfig.EmailAccount);
            mailMessage.Subject = subject;
            mailMessage.SubjectEncoding = Encoding.UTF8;

            mailMessage.Body = body;
            mailMessage.BodyEncoding = Encoding.UTF8;
            mailMessage.IsBodyHtml = true;

            Task.Run(() =>
            {
                using (var smtpClient = new SmtpClient())
                {
                    smtpClient.Host = "smtp.exmail.qq.com";
                    //smtpClient.Port = 25;
                    smtpClient.EnableSsl = true;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(ServerConfig.EmailAccount, ServerConfig.EmailPassword);
                    try
                    {
                        smtpClient.Send(mailMessage);
                    }
                    catch (Exception e)
                    {
                        Log.ErrorFormat("发送邮件失败:{0}", e);
                    }
                }
            });
        }
    }
}
