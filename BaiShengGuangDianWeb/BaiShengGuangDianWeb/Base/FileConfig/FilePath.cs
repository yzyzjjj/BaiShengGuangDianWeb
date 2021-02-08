using System.Collections.Generic;
using System.IO;

namespace BaiShengGuangDianWeb.Base.FileConfig
{
    public class FilePath
    {
        const string BaseDic = "File";
        public static string RootPath;
        public static string GetDirFullPath(string fileDir)
        {
            return Path.Combine(RootPath, BaseDic, fileDir);
        }
        public static string GetFullPath(string fileDir, string fileName)
        {
            return Path.Combine(fileDir, fileName);
        }
        /// <summary>
        /// 相对路径
        /// </summary>
        /// <param name="dir"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static string GetRelativePath(string dir, string fileName)
        {
            return "/" + Path.Combine(BaseDic, dir, fileName).Replace("\\", "/");
        }
        //private static readonly Dictionary<FileEnum, string> fileDictionary = new Dictionary<FileEnum, string>();

        //public static Dictionary<FileEnum, string> GetFileDictionary()
        //{
        //    return fileDictionary;
        //}

        //public static void AddConfig(FileEnum fileEnum, string path)
        //{
        //    if (!GetFileDictionary().ContainsKey(fileEnum))
        //    {
        //        GetFileDictionary().Add(fileEnum, path);
        //    }
        //}

        //public static string GetFileDictionary(FileEnum fileEnum)
        //{
        //    return GetFileDictionary().ContainsKey(fileEnum) ? GetFileDictionary()[fileEnum] : "";
        //}

        //public static string GetFullPath(FileEnum fileEnum)
        //{
        //    return Path.Combine(RootPath, GetFileDictionary(fileEnum));
        //}
        //public static string GetFullPath(string filePath)
        //{
        //    return Path.Combine(RootPath, filePath);
        //}
        //public static string GetFullPath(FileEnum fileEnum, string fileName)
        //{
        //    return Path.Combine(GetFullPath(fileEnum), fileName);
        //}
        //public static string GetHalfPath(FileEnum fileEnum, string fileName)
        //{
        //    return Path.Combine(GetFileDictionary(fileEnum), fileName);
        //}
        /// <summary>
        /// 相对路径
        /// </summary>
        /// <param name="fileEnum"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        //public static string GetRelativePath(FileEnum fileEnum, string fileName)
        //{
        //    return "/" + Path.Combine(GetFileDictionary(fileEnum), fileName).Replace("\\", "/");
        //}
    }
}
