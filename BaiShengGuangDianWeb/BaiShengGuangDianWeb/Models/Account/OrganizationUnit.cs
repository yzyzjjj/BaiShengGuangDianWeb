using Newtonsoft.Json;

namespace BaiShengGuangDianWeb.Models.Account
{
    public class OrganizationUnit
    {
        public int Id { get; set; }
        public int ParentId { get; set; }
        public string Code { get; set; }
        [JsonIgnore]
        public string CodeLink { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public bool IsDeleted { get; set; }
        public int MemberCount { get; set; }
    }
}
