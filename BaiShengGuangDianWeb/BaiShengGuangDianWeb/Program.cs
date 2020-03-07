using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using ModelBase.Base.Utils;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace BaiShengGuangDianWeb
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //    var r = new List<dynamic>
            //    {
            //        new {
            //            outputFileName="wwwroot/lib/utils/const.min.js",
            //            inputFiles=new[]
            //            {
            //                "wwwroot/lib/utils/const.js"
            //            }
            //        },
            //        new {
            //            outputFileName= "wwwroot/lib/utils/util.min.js",
            //            inputFiles=new[]
            //            {
            //                "wwwroot/lib/utils/util.js"
            //            }
            //        },
            //        new  {
            //            outputFileName=  "wwwroot/lib/utils/date.min.js",
            //            inputFiles=new[]
            //            {
            //                "wwwroot/lib/utils/date.js"
            //            }
            //        },
            //        new  {
            //            outputFileName=  "wwwroot/lib/utils/tpl.min.js",
            //            inputFiles=new[]
            //            {
            //                "wwwroot/lib/utils/tpl.js"
            //            }
            //        }
            //    };
            //    var p = @"F:\NPC\私人\王辉\BaiShengGuangDianWeb\BaiShengGuangDianWeb\BaiShengGuangDianWeb\wwwroot\mjs\";
            //    var dic = Directory.EnumerateDirectories(p);
            //    foreach (var d in dic)
            //    {
            //        var dl = d.Split("\\").Last();
            //        var files = Directory.GetFiles(d);
            //        foreach (var file in files)
            //        {
            //            var name = file.Replace(d + "\\", "").Split(".")[0];
            //            r.Add(new
            //            {
            //                outputFileName = $"wwwroot/mminjs/{dl}/{name}.min.js",
            //                inputFiles = new[]{
            //                    $"wwwroot/mjs/{dl}/{name}.js",
            //                }
            //            });
            //        }
            //    }

            //    var s = r.ToJSON()
            //        .Replace("[", "[\n")
            //        .Replace("{", "{\n")
            //        .Replace("},", "},\r\n")
            //        .Replace("\",", "\",\r\n")
            //        .Replace("]", "]\n");
            //    File.WriteAllText(@"F:\NPC\私人\王辉\BaiShengGuangDianWeb\BaiShengGuangDianWeb\BaiShengGuangDianWeb\bundleconfig.json", s);
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
