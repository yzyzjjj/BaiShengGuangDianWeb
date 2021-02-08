using System.Collections.Generic;

namespace BaiShengGuangDianWeb.Base.FileConfig
{
    public class FileExt
    {
        private static readonly Dictionary<FileEnum, List<string>> fileExt = new Dictionary<FileEnum, List<string>>
        {
            {FileEnum.FirmwareLibrary, new List<string>{"bin"}},
            {FileEnum.ApplicationLibrary, new List<string>{"bin"}},
            {FileEnum.SpotCheck, new List<string>{"bmp", "jpg", "jpeg", "png", "gif"}},
            {FileEnum.Material, new List<string>{"bmp", "jpg", "jpeg", "png", "gif"}},
            {FileEnum._6s, new List<string>{"bmp", "jpg", "jpeg", "png", "gif"}},
            {FileEnum.Manufacture, new List<string>{"bmp", "jpg", "jpeg", "png", "gif"}},
            {FileEnum.FaultDevice, new List<string>{"bmp", "jpg", "jpeg", "png", "gif"}},
            {FileEnum.Script, new List<string>{"npc"}},
            {FileEnum.Device, new List<string>{"bmp", "jpg", "jpeg", "png", "gif"}},
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
