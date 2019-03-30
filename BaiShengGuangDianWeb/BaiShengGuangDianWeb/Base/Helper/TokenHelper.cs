
using BaiShengGuangDianWeb.Models.Account;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ModelBase.Base.Utils;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class TokenHelper
    {
        public static string Audience;
        public static string Issuer;
        public static SymmetricSecurityKey SecurityKey;
        public static string Secret;
        public static void Init(IConfiguration configuration)
        {
            var audienceConfig = configuration.GetSection("TokenParam");
            Audience = audienceConfig["Audience"];
            Issuer = audienceConfig["Issuer"];
            Secret = audienceConfig["Secret"];
            SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Secret)); //拿到SecurityKey
        }

        /// <summary>
        /// 创建jwt token 字符串
        /// </summary>
        /// <param name="accountInfo"></param>
        /// <returns></returns>
        public static string CreateJwtToken(AccountInfo accountInfo)
        {
            var claims = new[]
            {
                new Claim("id", accountInfo.Id.ToString()),
                new Claim("name", accountInfo.Name),
                new Claim("role", accountInfo.RoleName),
                new Claim("account", accountInfo.Account),
                new Claim("email", accountInfo.EmailAddress),
                new Claim("permissions", accountInfo.Permissions)
            };
            var creds = new SigningCredentials(SecurityKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// 验证身份 验证签名的有效性,
        /// </summary>
        /// <param name="token"></param>
        /// 例如：payLoad["aud"]?.ToString() == "roberAuddience";
        /// 例如：验证是否过期 等
        /// <returns></returns>
        public static bool Validate(string token)
        {
            var jwtArr = token.Split('.');
            var header = JsonConvert.DeserializeObject<Dictionary<string, object>>(Base64UrlEncoder.Decode(jwtArr[0]));
            var payLoad = JsonConvert.DeserializeObject<Dictionary<string, object>>(Base64UrlEncoder.Decode(jwtArr[1]));

            var hs256 = new HMACSHA256(Encoding.ASCII.GetBytes(Secret));
            //首先验证签名是否正确（必须的）
            var success = string.Equals(jwtArr[2], Base64UrlEncoder.Encode(hs256.ComputeHash(Encoding.UTF8.GetBytes(string.Concat(jwtArr[0], ".", jwtArr[1])))));
            if (!success)
            {
                return false;//签名不正确直接返回
            }
            //其次验证是否在有效期内（也应该必须）
            success = DateTime.UtcNow.ToUnixTime() < long.Parse(payLoad["exp"].ToString());
            if (success)
            {
                try
                {
                    //AccountHelper.CurrentUser = new AccountInfo
                    //{
                    //    Id = int.Parse(payLoad["id"].ToString()),
                    //    Name = (string)payLoad["name"],
                    //    Account = (string)payLoad["account"],
                    //    EmailAddress = (string)payLoad["email"],
                    //    Permissions = (string)payLoad["permissions"],
                    //};
                    AccountHelper.CurrentUser = AccountHelper.GetAccountInfo(int.Parse(payLoad["id"].ToString()));
                }
                catch (Exception e)
                {
                    return false;
                }
            }
            return success;
        }
    }
}
