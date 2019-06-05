﻿using System.Collections.Generic;

namespace BaiShengGuangDianWeb.Base.FileConfig
{
    public class FileExt
    {
        private static readonly Dictionary<FileEnum, List<string>> fileExt = new Dictionary<FileEnum, List<string>>
        {
            {FileEnum.FirmwareLibrary, new List<string>{"bin"}},
            {FileEnum.ApplicationLibrary, new List<string>{"bin"}},
        };

        public static Dictionary<FileEnum, List<string>> GetFileExt()
        {
            return fileExt;
        }

        public static List<string> GetFileExt(FileEnum fileEnum)
        {
            return GetFileExt().ContainsKey(fileEnum) ? GetFileExt()[fileEnum] : new List<string>();
        }

    }
}