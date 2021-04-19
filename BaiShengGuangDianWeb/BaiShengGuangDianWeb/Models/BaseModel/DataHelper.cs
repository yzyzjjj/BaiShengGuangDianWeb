using BaiShengGuangDianWeb.Base.Server;
using ModelBase.Models.BaseModel;

namespace BaiShengGuangDianWeb.Models.BaseModel
{
    public class DataHelper : DataBaseHelper
    {
        public DataHelper()
        {
            DB = ServerConfig.WebDb;
        }
    }
}
