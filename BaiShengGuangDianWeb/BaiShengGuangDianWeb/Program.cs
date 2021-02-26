using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using ModelBase.Base.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace BaiShengGuangDianWeb
{
    public class Program
    {
        public static void Main(string[] args)
        {
#if DEBUG
            var r = new List<dynamic>();
            //var p = @"F:\NPC\私人\王辉\BaiShengGuangDianWeb\BaiShengGuangDianWeb\BaiShengGuangDianWeb\wwwroot\mjs\";
            var path = AppDomain.CurrentDomain.BaseDirectory.Split("bin")[0];
            var p = Path.Combine(path, @"wwwroot\lib\utils\");
            var files = Directory.GetFiles(p).Where(x => !x.Contains(".min.js"));
            foreach (var file in files)
            {
                var names = file.Replace(p, "").Split(".");
                if (names.Length == 2)
                {
                    var name = names[0];
                    r.Add(new
                    {
                        outputFileName = $"wwwroot/lib/utils/{name}.min.js",
                        inputFiles = new[]{
                                $"wwwroot/lib/utils/{name}.js",
                            }
                    });
                    if (name == "const")
                    {
                        //File.WriteAllText(file, File.ReadAllText(file).Replace("development = false", "development = true"));
                    }
                }
            }

            p = Path.Combine(path, @"wwwroot\mjs\");
            var dic = Directory.EnumerateDirectories(p);
            foreach (var d in dic)
            {
                var dl = d.Split("\\").Last();
                files = Directory.GetFiles(d);
                var minFiles = files.Where(x => x.Contains(".min.js"));
                if (minFiles.Any())
                {
                    Console.WriteLine(minFiles.ToJSON());
                }
                foreach (var file in files)
                {
                    var name = file.Replace(d + "\\", "").Split(".")[0];
                    r.Add(new
                    {
                        outputFileName = $"wwwroot/mminjs/{dl}/{name}.min.js",
                        inputFiles = new[]{
                                $"wwwroot/mjs/{dl}/{name}.js",
                            }
                    });
                }
            }

            var s = r.ToJSON()
                .Replace("[", "[\n")
                .Replace("{", "{\n")
                .Replace("},", "},\r\n")
                .Replace("\",", "\",\r\n")
                .Replace("]", "]\n");
            p = Path.Combine(path, @"bundleconfig.json");
            //File.WriteAllText(@"F:\NPC\私人\王辉\BaiShengGuangDianWeb\BaiShengGuangDianWeb\BaiShengGuangDianWeb\bundleconfig.json", s);
            File.WriteAllText(p, s);
#else
            //var p = @"F:\NPC\私人\王辉\BaiShengGuangDianWeb\BaiShengGuangDianWeb\BaiShengGuangDianWeb\wwwroot\mjs\";
            var path = AppDomain.CurrentDomain.BaseDirectory.Split("bin")[0];
            var p = Path.Combine(path, @"wwwroot\lib\utils\");
            var files = Directory.GetFiles(p).Where(x => !x.Contains(".min.js"));
            foreach (var file in files)
            {
                var names = file.Replace(p, "").Split(".");
                if (names.Length == 2)
                {
                    var name = names[0];
                    if (name == "const")
                    {
                        File.WriteAllText(file, File.ReadAllText(file).Replace("development = true", "development = false"));
                    }
                }
            }
#endif
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();
    }
}
