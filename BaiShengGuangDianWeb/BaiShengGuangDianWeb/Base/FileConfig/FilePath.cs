using System.Collections.Generic;
using System.IO;

namespace BaiShengGuangDianWeb.Base.FileConfig
{
    public class FilePath
    {
        public static string RootPath;
        private static readonly Dictionary<FileEnum, string> fileDictionary = new Dictionary<FileEnum, string>();

        public static Dictionary<FileEnum, string> GetFileDictionary()
        {
            return fileDictionary;
        }

        public static void AddConfig(FileEnum fileEnum, string path)
        {
            if (!GetFileDictionary().ContainsKey(fileEnum))
            {
                GetFileDictionary().Add(fileEnum, path);
            }
        }

        public static string GetFileDictionary(FileEnum fileEnum)
        {
            return GetFileDictionary().ContainsKey(fileEnum) ? GetFileDictionary()[fileEnum] : "";
        }

        public static string GetFullPath(FileEnum fileEnum)
        {
            return Path.Combine(RootPath, GetFileDictionary(fileEnum));
        }
        public static string GetFullPath(string filePath)
        {
            return Path.Combine(RootPath, filePath);
        }
        public static string GetFullPath(FileEnum fileEnum, string fileName)
        {
            return Path.Combine(GetFullPath(fileEnum), fileName);
        }
        public static string GetHalfPath(FileEnum fileEnum, string fileName)
        {
            return Path.Combine(GetFileDictionary(fileEnum), fileName);
        }
    }
}
