using ServiceStack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class FileHelper
    {
        public static string Get16StringFromFile(string filePath)
        {
            var fs = new FileStream(filePath, FileMode.Open);
            var br = new BinaryReader(fs);
            var byData = br.ReadBytes((int)fs.Length);
            var binary = byData.Select(x => Convert.ToString(x, 16)).Join(" ");
            return binary;
        }
    }
}
