﻿using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class RoleHelper
    {

        /// <summary>
        /// 获取所有角色信息
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<RoleInfo> GetRoleInfo()
        {
            var sql = "SELECT * FROM `roles` WHERE IsDeleted = 0;";
            return ServerConfig.WebDb.Query<RoleInfo>(sql);
        }

        /// <summary>
        /// 根据id获取角色信息
        /// </summary>
        /// <param name="id"></param>
        /// <param name="isAll"></param>
        /// <returns></returns>
        public static RoleInfo GetRoleInfo(int id, bool isAll = false)
        {
            var sql = !isAll ? "SELECT * FROM `roles` WHERE IsDeleted = 0 AND Id = @id;" : "SELECT * FROM `roles` WHERE Id = @id;";
            return ServerConfig.WebDb.Query<RoleInfo>(sql, new { id }).FirstOrDefault();
        }
        /// <summary>
        /// 根据ids获取角色信息
        /// </summary>
        /// <param name="ids"></param>
        /// <param name="isAll"></param>
        /// <returns></returns>
        public static IEnumerable<RoleInfo> GetRoleInfos(IEnumerable<int> ids, bool isAll = false)
        {
            var sql = $"SELECT * FROM `roles` WHERE {(isAll ? "" : " IsDeleted = 0 AND")} Id IN @ids;";
            return ServerConfig.WebDb.Query<RoleInfo>(sql, new { ids });
        }

        /// <summary>
        /// 根据name获取角色信息
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static RoleInfo GetRoleInfoByName(string name)
        {
            var sql = "SELECT * FROM `roles` WHERE IsDeleted = 0 AND Name = @name;";
            return ServerConfig.WebDb.Query<RoleInfo>(sql, new { name }).FirstOrDefault();
        }

        /// <summary>
        /// 添加角色信息
        /// </summary>
        /// <param name="roleInfo"></param>
        /// <returns></returns>
        public static void AddRoleInfo(RoleInfo roleInfo)
        {
            var sql = "INSERT INTO roles (`Name`, `IsDeleted`, `Permissions`) VALUES (@Name, @IsDeleted, @Permissions);";
            ServerConfig.WebDb.Execute(sql, roleInfo);
        }

        /// <summary>
        /// 删除角色信息
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static void DeleteRoleInfo(int id)
        {
            var sql = "UPDATE roles SET `IsDeleted` = 1 WHERE Id = @id";
            ServerConfig.WebDb.Execute(sql, new { id });
        }

        /// <summary>
        /// 修改角色信息
        /// </summary>
        /// <param name="roleInfo"></param>
        /// <returns></returns>
        public static void UpdateRoleInfo(RoleInfo roleInfo)
        {
            var sql = "UPDATE roles SET `Name` = @Name, `IsDeleted` = @IsDeleted, `Permissions` = @Permissions WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, roleInfo);
        }

        /// <summary>
        /// 获取角色使用次数
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static int GetUseRoleCount(int id)
        {
            var cnt =
                ServerConfig.WebDb.Query<int>("SELECT COUNT(1) FROM `accounts` WHERE Role = @id AND `IsDeleted` = 0;", new { id }).FirstOrDefault();
            return cnt;
        }
    }
}
