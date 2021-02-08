using BaiShengGuangDianWeb.Base.FileConfig;
using BaiShengGuangDianWeb.Base.Helper;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.Logger;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using Newtonsoft.Json;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace BaiShengGuangDianWeb.Controllers.Api.Upload
{
    [Microsoft.AspNetCore.Mvc.Route("[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        [HttpPost("File")]
        public object UploadPost()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            //if (!PermissionHelper.CheckPermission(Request.Path.Value))
            //{
            //    return Result.GenError<Result>(Error.NoAuth);
            //}

            var param = Request.GetRequestParams();
            var type = param.GetValue("type");
            try
            {
                var dir = param.GetValue("dir");
                var files = Request.Form.Files;
                if (files.Count == 0)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }

                if (files.Count > 1)
                {
                    return Result.GenError<Result>(Error.FileSingle);
                }

                var formFile = files[0];
                if (formFile.Length > 0)
                {
                    var dirFullPath = FilePath.GetDirFullPath(dir);
                    if (!System.IO.File.Exists(dirFullPath))
                    {
                        Directory.CreateDirectory(dirFullPath);
                    }

                    var t = DateTime.Now.ToStrFile();
                    var fileName = formFile.FileName;
                    var newFileName = $"{t}_{fileName}";
                    var fullPath = FilePath.GetFullPath(dirFullPath, newFileName);
                    var backName = $"back_{t}_{fileName}";
                    var backPath = FilePath.GetFullPath(dirFullPath, backName);
                    if (System.IO.File.Exists(fullPath))
                    {
                        System.IO.File.Move(fullPath, backPath);
                    }
                    using (var stream = new FileStream(fullPath, FileMode.OpenOrCreate))
                    {
                        formFile.CopyTo(stream);
                        stream.Flush();
                    }
                    var result = new ModelBase.Models.Result.FileResult { data = newFileName };
                    return result;
                }
            }
            catch (Exception e)
            {
                Log.Error($"上传文件失败,类型:{type},{e}");
            }
            return Result.GenError<Result>(Error.Fail);
        }

        [HttpPost("FileMultiple")]
        public object UploadFileMultiple()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            //if (!PermissionHelper.CheckPermission(Request.Path.Value))
            //{
            //    return Result.GenError<Result>(Error.NoAuth);
            //}

            var param = Request.GetRequestParams();
            var type = param.GetValue("type");
            try
            {
                var dir = param.GetValue("dir");
                var files = Request.Form.Files;
                if (files.Count == 0)
                {
                    return Result.GenError<Result>(Error.NoUploadFile);
                }
                var dirFullPath = FilePath.GetDirFullPath(dir);
                if (files.Any(x => x.Length > 0))
                {
                    if (!System.IO.File.Exists(dirFullPath))
                    {
                        Directory.CreateDirectory(dirFullPath);
                    }
                }
                var result = new FileResultMultiple();
                foreach (var formFile in files)
                {
                    if (formFile.Length > 0)
                    {
                        var fileName = formFile.FileName;
                        var t = DateTime.Now.ToStrFile();
                        var newFileName = $"{t}_{fileName}";
                        var fullPath = FilePath.GetFullPath(dirFullPath, newFileName);
                        var backName = $"back_{t}_{fileName}";
                        var backPath = FilePath.GetFullPath(dirFullPath, backName);
                        if (System.IO.File.Exists(fullPath))
                        {
                            System.IO.File.Move(fullPath, backPath);
                        }
                        using (var stream = new FileStream(fullPath, FileMode.OpenOrCreate))
                        {
                            formFile.CopyTo(stream);
                            stream.Flush();
                        }

                        result.data.Add(new UpFileInfo(fileName, newFileName));
                    }
                }

                return result;
            }
            catch (Exception e)
            {
                Log.Error($"上传文件失败,类型:{type},{e}");
            }
            return Result.GenError<Result>(Error.Fail);
        }

        [HttpPost("Path")]
        public object UploadPath()
        {
            if (AccountHelper.CurrentUser == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            //if (!PermissionHelper.CheckPermission(Request.Path.Value))
            //{
            //    return Result.GenError<Result>(Error.NoAuth);
            //}

            var param = Request.GetRequestParams();
            var type = param.GetValue("type");
            var dir = param.GetValue("dir");
            // ["", "", ""]
            var filesStr = param.GetValue("files");
            try
            {
                if (!EnumHelper.TryParseStr(type, out FileEnum fileEnum))
                {
                    return Result.GenError<Result>(Error.ParamError);
                }

                var files = JsonConvert.DeserializeObject<IEnumerable<string>>(filesStr);
                if (!files.Any())
                {
                    return Result.GenError<Result>(Error.NoUploadFile);
                }

                var result = new FileResultPath();
                result.data.AddRange(files.Select(x => new UpFilePath(x, FilePath.GetRelativePath(dir, x))));
                return result;
            }
            catch (Exception e)
            {
                Log.Error($"获取文件地址失败,类型:{type},{e}");
            }
            return Result.GenError<Result>(Error.Fail);
        }

        //[HttpPost("Path")]
        //public object UploadPath()
        //{
        //    if (AccountHelper.CurrentUser == null)
        //    {
        //        return Result.GenError<Result>(Error.AccountNotExist);
        //    }
        //    //if (!PermissionHelper.CheckPermission(Request.Path.Value))
        //    //{
        //    //    return Result.GenError<Result>(Error.NoAuth);
        //    //}

        //    var param = Request.GetRequestParams();
        //    var type = param.GetValue("type");
        //    // ["", "", ""]
        //    var filesStr = param.GetValue("files");
        //    try
        //    {
        //        if (!EnumHelper.TryParseStr(type, out FileEnum fileEnum))
        //        {
        //            return Result.GenError<Result>(Error.ParamError);
        //        }

        //        var files = JsonConvert.DeserializeObject<IEnumerable<string>>(filesStr);
        //        if (!files.Any())
        //        {
        //            return Result.GenError<Result>(Error.NoUploadFile);
        //        }

        //        var result = new FileResultPath();
        //        result.data.AddRange(files.Select(x => new UpFilePath(x, FilePath.GetRelativePath(fileEnum, x))));

        //        return result;
        //    }
        //    catch (Exception)
        //    {
        //        Log.ErrorFormat("获取文件地址失败,类型:{0}", type);
        //    }
        //    return Result.GenError<Result>(Error.Fail);
        //}

        //[HttpPost("File1")]
        //public object UploadPost1()
        //{
        //    if (AccountHelper.CurrentUser == null)
        //    {
        //        return Result.GenError<Result>(Error.AccountNotExist);
        //    }
        //    //if (!PermissionHelper.CheckPermission(Request.Path.Value))
        //    //{
        //    //    return Result.GenError<Result>(Error.NoAuth);
        //    //}

        //    var param = Request.GetRequestParams();
        //    var type = param.GetValue("type");
        //    try
        //    {
        //        if (!EnumHelper.TryParseStr(type, out FileEnum fileEnum))
        //        {
        //            return Result.GenError<Result>(Error.ParamError);
        //        }

        //        var fileExts = FileExt.GetFileExt(fileEnum);
        //        var files = Request.Form.Files;
        //        if (files.Count == 0)
        //        {
        //            return Result.GenError<Result>(Error.ParamError);
        //        }

        //        var fullPath = FilePath.GetFullPath(fileEnum);
        //        if (files.Count > 1)
        //        {
        //            return Result.GenError<Result>(Error.FileSingle);
        //        }


        //        var newFileName = string.Empty;
        //        switch (fileEnum)
        //        {
        //            case FileEnum.FirmwareLibrary: newFileName = "NPC"; break;
        //            case FileEnum.SpotCheck: break;
        //            case FileEnum.Material: break;
        //            default: Result.GenError<Result>(Error.Fail); break;
        //        }

        //        var formFile = files[0];
        //        if (formFile.Length > 0)
        //        {
        //            var exts = formFile.FileName.Split(".");
        //            var ext = exts.Last().ToLower();
        //            if (!ext.IsNullOrEmpty() && !fileExts.Contains(ext))
        //            {
        //                return Result.GenError<Result>(Error.FileExtError);
        //            }
        //            var fileName = exts.Take(exts.Length - 1).Join(".");
        //            newFileName = $"{DateTime.Now.ToStrFile()}_{(newFileName != string.Empty ? newFileName : fileName)}.{ext}";

        //            var newFullPath = Path.Combine(fullPath, newFileName);
        //            var backName = $"{newFileName}_back{DateTime.Now.ToStrFile()}.{ext}";
        //            var backPath = Path.Combine(fullPath, backName);
        //            if (System.IO.File.Exists(newFullPath))
        //            {
        //                System.IO.File.Move(newFullPath, backPath);
        //            }

        //            using (var stream = new FileStream(newFullPath, FileMode.OpenOrCreate))
        //            {
        //                formFile.CopyTo(stream);
        //                stream.Flush();
        //            }
        //            var result = new ModelBase.Models.Result.FileResult { data = newFileName };
        //            return result;
        //        }
        //    }
        //    catch (Exception)
        //    {
        //        Log.ErrorFormat("上传文件失败,类型:{0}", type);
        //    }
        //    return Result.GenError<Result>(Error.Fail);
        //}

        //[HttpPost("FileMultiple1")]
        //public object UploadFileMultiple1()
        //{
        //    if (AccountHelper.CurrentUser == null)
        //    {
        //        return Result.GenError<Result>(Error.AccountNotExist);
        //    }
        //    //if (!PermissionHelper.CheckPermission(Request.Path.Value))
        //    //{
        //    //    return Result.GenError<Result>(Error.NoAuth);
        //    //}

        //    var param = Request.GetRequestParams();
        //    var type = param.GetValue("type");
        //    try
        //    {
        //        if (!EnumHelper.TryParseStr(type, out FileEnum fileEnum))
        //        {
        //            return Result.GenError<Result>(Error.ParamError);
        //        }

        //        var fileExts = FileExt.GetFileExt(fileEnum);
        //        var files = Request.Form.Files;
        //        if (files.Count == 0)
        //        {
        //            return Result.GenError<Result>(Error.NoUploadFile);
        //        }

        //        var fullPath = FilePath.GetFullPath(fileEnum);

        //        var newFileName = string.Empty;
        //        switch (fileEnum)
        //        {
        //            case FileEnum.FirmwareLibrary: newFileName = "NPC"; break;
        //            case FileEnum.SpotCheck: break;
        //            case FileEnum.Material: break;
        //            default: Result.GenError<Result>(Error.Fail); break;
        //        }

        //        var result = new FileResultMultiple();
        //        for (var i = 0; i < files.Count; i++)
        //        {
        //            var formFile = files[i];
        //            if (formFile.Length > 0)
        //            {
        //                var exts = formFile.FileName.Split(".");
        //                var ext = exts.Last().ToLower();
        //                if (!ext.IsNullOrEmpty() && !fileExts.Contains(ext))
        //                {
        //                    return Result.GenError<Result>(Error.FileExtError);
        //                }

        //                var fileName = exts.Take(exts.Length - 1).Join(".");

        //                newFileName = $"{DateTime.Now.ToStrFile()}_{(newFileName != string.Empty ? newFileName : fileName)}.{ext}";
        //                var newFullPath = Path.Combine(fullPath, newFileName);
        //                var backName = $"{newFileName}_back{DateTime.Now.ToStrFile()}.{ext}";
        //                var backPath = Path.Combine(fullPath, backName);
        //                if (System.IO.File.Exists(newFullPath))
        //                {
        //                    System.IO.File.Move(newFullPath, backPath);
        //                }

        //                using (var stream = new FileStream(newFullPath, FileMode.OpenOrCreate))
        //                {
        //                    formFile.CopyTo(stream);
        //                    stream.Flush();
        //                }

        //                result.data.Add(new UpFileInfo(fileName, newFileName));
        //            }
        //        }

        //        return result;
        //    }
        //    catch (Exception)
        //    {
        //        Log.ErrorFormat("上传文件失败,类型:{0}", type);
        //    }
        //    return Result.GenError<Result>(Error.Fail);
        //}
    }
}