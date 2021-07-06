using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ModelBase.Models.Result;

namespace BaiShengGuangDianWeb.Models.RequestBody
{
    public class LoginBody
    {
        public string Account;
        public string Password;
        public string Number;
        public string RememberMe;
    }
    public class LoginResult : DataResult
    {
        public string token { get; set; }
    }
}
