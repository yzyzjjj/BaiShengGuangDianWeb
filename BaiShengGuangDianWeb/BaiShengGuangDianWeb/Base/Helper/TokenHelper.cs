
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
                //new Claim("permissions", accountInfo.Permissions),
                new Claim("prole", accountInfo.ProductionRole)
            };
            var credentials = new SigningCredentials(SecurityKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// 验证身份 验证签名的有效性,
        /// </summary>
        /// <param name="token"></param>
        /// <param name="needUpdate">是否更新 0  1  token  2  per  3 all</param>
        /// 例如：payLoad["aud"]?.ToString() == "roberAuddience";
        /// 例如：验证是否过期 等
        /// <returns></returns>
        public static bool Validate(string token, string per, out int needUpdate)
        {
            needUpdate = 0;
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
            var left = long.Parse(payLoad["exp"].ToString()) - DateTime.UtcNow.ToUnixTime();
            if (left > 0)
            {
                try
                {
                    AccountHelper.CurrentUser = AccountHelper.GetAccountInfo(int.Parse(payLoad["id"].ToString()));
                    if (left < 30 * 60)
                    {
                        needUpdate += 1;
                    }
                    else
                    {
                        if (AccountHelper.CurrentUser.Name != payLoad["name"].ToString() ||
                            AccountHelper.CurrentUser.RoleName != payLoad["role"].ToString() ||
                            AccountHelper.CurrentUser.EmailAddress != payLoad["email"].ToString() ||
                            AccountHelper.CurrentUser.Permissions != per ||
                            AccountHelper.CurrentUser.ProductionRole != payLoad["prole"].ToString())
                        {
                            needUpdate += 1;
                        }
                    }
                    if (AccountHelper.CurrentUser.Name != payLoad["name"].ToString() ||
                        AccountHelper.CurrentUser.RoleName != payLoad["role"].ToString() ||
                        AccountHelper.CurrentUser.EmailAddress != payLoad["email"].ToString() ||
                        AccountHelper.CurrentUser.Permissions != per ||
                        AccountHelper.CurrentUser.ProductionRole != payLoad["prole"].ToString())
                    {
                        needUpdate += 2;
                    }

                    return true;
                }
                catch (Exception)
                {
                    needUpdate = 3;
                }
            }
            return false;
        }
    }
}
