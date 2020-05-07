using BaiShengGuangDianWeb.Base.Chat;
using BaiShengGuangDianWeb.Base.FileConfig;
using BaiShengGuangDianWeb.Base.Filter;
using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Base.Server;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ModelBase.Base.Filter;
using ModelBase.Base.Logger;
using System.IO;

namespace BaiShengGuangDianWeb
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => false;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(options =>
                    {
                        //忽略循环引用
                        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                        ////不使用驼峰样式的key
                        //options.SerializerSettings.ContractResolver = new DefaultContractResolver();
                        //设置时间格式
                        options.SerializerSettings.DateFormatString = "yyyy-MM-dd HH:mm:ss";
                    }
                );


            //注册过滤器
            services.AddMvc(options =>
            {
                options.Filters.Add<TokenFilterAttribute>();
                options.Filters.Add<HttpGlobalExceptionFilter>();
            });
            services.AddSignalR();

            //添加jwt验证：
            TokenHelper.Init(Configuration);

            ServerConfig.Init(Configuration);

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            //添加MIME
            var provider = new FileExtensionContentTypeProvider
            {
                Mappings =
                {
                    [".bin"] = "application/octet-stream",
                    [".npc"] = "application/octet-stream",
                }
            };
            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider
            });
            app.UseCookiePolicy();
            app.UseSignalR(routes =>
            {
                routes.MapHub<ChatHub>("/chatHub");
            });
            app.UseMvcWithDefaultRoute();

            FilePath.RootPath = env.WebRootPath;
            foreach (var pair in FilePath.GetFileDictionary())
            {
                var filePath = Path.Combine(FilePath.RootPath, pair.Value);
                if (!File.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }
            }

            Log.Info("Server Start");
        }
    }
}
