using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using System;
using System.IO;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.Upload
{
    [Route("Upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private IHostingEnvironment _hostingEnvironment;

        public UploadController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;

        }
        [HttpPost("Post")]
        public object UploadPost()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            try
            {
                var files = Request.Form.Files;

                long size = files.Sum(f => f.Length);

                string webRootPath = _hostingEnvironment.WebRootPath;

                string contentRootPath = _hostingEnvironment.ContentRootPath;

                foreach (var formFile in files)

                {

                    if (formFile.Length > 0)
                    {

                        //string fileExt = GetFileExt(formFile.FileName); //文件扩展名，不含“.”

                        //long fileSize = formFile.Length; //获得文件大小，以字节为单位

                        //string newFileName = System.Guid.NewGuid().ToString() + "." + fileExt; //随机生成新的文件名

                        //var filePath = webRootPath + "/upload/" + newFileName;

                        //using (var stream = new FileStream(filePath, FileMode.Create))
                        //{
                        //    await formFile.CopyToAsync(stream);
                        //}

                    }

                }
            }
            catch (Exception ex)
            {
                return Result.GenError<Result>(Error.Fail);
            }
            return Result.GenError<Result>(Error.Success);
        }
    }
}