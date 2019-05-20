using BaiShengGuangDianWeb.Base.FileConfig;
using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using ServiceStack;
using System;
using System.IO;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.Upload
{
    [Microsoft.AspNetCore.Mvc.Route("Upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
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
            var type = param.GetValue("type");
            try
            {
                if (!EnumHelper.TryParseStr(type, out FileEnum fileEnum))
                {
                    return Result.GenError<Result>(Error.ParamError);
                }

                var fileExts = FileExt.GetFileExt(fileEnum);
                var files = Request.Form.Files;
                if (files.Count == 0)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }

                var fullPath = FilePath.GetFullPath(fileEnum);
                if (files.Count > 1)
                {
                    return Result.GenError<Result>(Error.FileSingle);
                }

                var formFile = files[0];
                if (formFile.Length > 0)
                {
                    var exts = formFile.FileName.Split(".");
                    var ext = exts.Last();
                    if (!ext.IsNullOrEmpty() && !fileExts.Contains(ext))
                    {
                        return Result.GenError<Result>(Error.FileExtError);
                    }

                    var fileName = "";
                    switch (fileEnum)
                    {
                        case FileEnum.FirmwareLibrary: fileName = "NPC"; break;
                        default: Result.GenError<Result>(Error.Fail); break;
                    }
                    fileName = $"{fileName}_{DateTime.Now.ToStrFile()}.{ext}";
                    var newFileName = $"{fileName}_back{DateTime.Now.ToStrFile()}.{ext}";
                    var newFullPath = Path.Combine(fullPath, newFileName);
                    var filePath = Path.Combine(fullPath, fileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Move(filePath, newFullPath);
                    }

                    using (var stream = new FileStream(filePath, FileMode.OpenOrCreate))
                    {
                        var s = formFile.CopyToAsync(stream).GetResult();
                    }
                    var result = new CommonResult { data = fileName };
                    return result;
                }
            }
            catch (Exception)
            {
                Log.ErrorFormat("上传文件失败,类型:{0}", type);
            }
            return Result.GenError<Result>(Error.Fail);
        }
    }
}