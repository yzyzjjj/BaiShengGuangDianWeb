using BaiShengGuangDianWeb.Base.Server;
using BaiShengGuangDianWeb.Models.Account;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Base.Helper
{
    public class OrganizationUnitHelper
    {
        /// <summary>
        /// 根据id获取组织结构
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static IEnumerable<OrganizationUnit> GetOrganizationUnit()
        {
            var sql = "SELECT *, IFNULL(b.cnt, 0) MemberCount FROM `organization_units` a LEFT JOIN ( SELECT OrganizationUnitId, COUNT(1) cnt " +
                      "FROM `account_organization_units` WHERE IsDeleted = 0 GROUP BY OrganizationUnitId ) b ON a.Id = b.OrganizationUnitId WHERE IsDeleted = 0;";
            var infos = ServerConfig.WebDb.Query<OrganizationUnit>(sql);
            return infos;
        }

        /// <summary>
        /// 根据id获取组织结构
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static OrganizationUnit GetOrganizationUnit(int id)
        {
            var sql = "SELECT * FROM `organization_units` WHERE IsDeleted = 0 AND Id = @id;";
            var info = ServerConfig.WebDb.Query<OrganizationUnit>(sql, new { id }).FirstOrDefault();
            return info;
        }

        /// <summary>
        /// 根据code获取组织结构
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>
        public static OrganizationUnit GetOrganizationUnitByCode(string code)
        {
            var sql = "SELECT * FROM `organization_units` WHERE IsDeleted = 0 AND Code = @code;";
            var info = ServerConfig.WebDb.Query<OrganizationUnit>(sql, new { code }).FirstOrDefault();
            return info;
        }

        /// <summary>
        /// 根据id获取下级组织结构
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static IEnumerable<OrganizationUnit> GetUnderOrganizationUnits(int id)
        {
            var sql = "SELECT * FROM `organization_units` WHERE IsDeleted = 0 AND ParentId = @id;";
            var info = ServerConfig.WebDb.Query<OrganizationUnit>(sql, new { id });
            return info;
        }
        /// <summary>
        /// 添加组织结构
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <returns></returns>
        public static void AddOrganizationUnit(OrganizationUnit organizationUnit)
        {
            var sql = "INSERT INTO organization_units (`ParentId`, `Code`, `CodeLink`, `Name`) VALUES (@ParentId, @Code, @CodeLink, @Name);SELECT LAST_INSERT_ID();";
            var id = ServerConfig.WebDb.Query<int>(sql, organizationUnit).FirstOrDefault();
            sql = "UPDATE organization_units SET `Code` = @Code, `CodeLink` = @CodeLink WHERE `Id` = @Id;";
            organizationUnit.Id = id;
            organizationUnit.Code = (10000 + id).ToString();
            organizationUnit.CodeLink = $"{organizationUnit.CodeLink},{organizationUnit.Code}";
            ServerConfig.WebDb.Execute(sql, organizationUnit);
        }

        /// <summary>
        /// 删除组织结构
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <returns></returns>
        public static void DeleteOrganizationUnit(OrganizationUnit organizationUnit)
        {
            var sql = "UPDATE organization_units SET `IsDeleted` = 1 WHERE `CodeLink` LIKE @CodeLink";
            ServerConfig.WebDb.Execute(sql, new { CodeLink = organizationUnit.CodeLink + "%" });
        }

        /// <summary>
        /// 更新组织结构
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <returns></returns>
        public static void UpdateOrganizationUnit(OrganizationUnit organizationUnit)
        {
            var sql = "UPDATE organization_units SET `Name` = @Name WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, organizationUnit);
        }

        /// <summary>
        /// 移动组织结构
        /// </summary>
        /// <param name="parent"></param>
        /// <param name="children"></param>
        /// <returns></returns>
        public static void MoveOrganizationUnit(OrganizationUnit parent, OrganizationUnit children)
        {
            var oldCodeLink = children.CodeLink;
            var newCodeLink = $"{parent.CodeLink},{children.Id}";
            children.ParentId = parent.Id;
            children.CodeLink = newCodeLink;
            var sql = "UPDATE organization_units SET `CodeLink` = @newCodeLink WHERE `CodeLink` = @oldCodeLink;";
            ServerConfig.WebDb.Execute(sql, new { newCodeLink, oldCodeLink });

            sql = "UPDATE organization_units SET `ParentId` = @ParentId, `Code` = @Code, `CodeLink` = @CodeLink WHERE `Id` = @Id;";
            ServerConfig.WebDb.Execute(sql, children);
        }

        /// <summary>
        /// 获取组织成员
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <returns></returns>
        public static IEnumerable<dynamic> MemberList(OrganizationUnit organizationUnit)
        {
            var sql = "SELECT b.Id, a.AccountId, b.`Name`, b.RoleName FROM `account_organization_units` a JOIN ( SELECT a.*, b.`Name` RoleName FROM `accounts` a JOIN `roles` b ON a.Role = b.Id WHERE a.IsDeleted = 0 AND b.IsDeleted = 0 ) b ON a.AccountId = b.Id WHERE a.IsDeleted = 0 AND b.IsDeleted = 0 AND a.OrganizationUnitId = @Id;";
            return ServerConfig.WebDb.Query<dynamic>(sql, new { organizationUnit.Id });
        }

        /// <summary>
        /// 添加组织成员
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <param name="accountInfo"></param>
        /// <returns></returns>
        public static void AddMember(OrganizationUnit organizationUnit, AccountInfo accountInfo)
        {
            var sql = "INSERT INTO account_organization_units (`AccountId`, `OrganizationUnitId`) VALUES (@AccountId, @OrganizationUnitId);";
            ServerConfig.WebDb.Execute(sql, new { AccountId = accountInfo.Id, OrganizationUnitId = organizationUnit.Id });
        }

        /// <summary>
        /// 批量添加组织成员
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <param name="accountInfos"></param>
        /// <returns></returns>
        public static void AddMembers(OrganizationUnit organizationUnit, IEnumerable<AccountInfo> accountInfos)
        {
            var sql = "INSERT INTO account_organization_units (`AccountId`, `OrganizationUnitId`) VALUES (@AccountId, @OrganizationUnitId);";
            ServerConfig.WebDb.Execute(sql, accountInfos.Select(x => new { AccountId = x.Id, OrganizationUnitId = organizationUnit.Id }));
        }

        /// <summary>
        /// 删除组织成员
        /// </summary>
        /// <param name="id">自增Id</param>
        /// <returns></returns>
        public static void DeleteMember(int id)
        {
            var sql = "UPDATE account_organization_units SET `IsDeleted` = 1 WHERE `Id` = @id;";
            ServerConfig.WebDb.Execute(sql, new { id });
        }

        /// <summary>
        /// 删除组织成员
        /// </summary>
        /// <param name="AccountId"></param>
        /// <returns></returns>
        public static void DeleteMemberByAccountId(int AccountId)
        {
            var sql = "UPDATE account_organization_units SET `IsDeleted` = 1 WHERE `AccountId` = @AccountId;";
            ServerConfig.WebDb.Execute(sql, new { AccountId });
        }

        /// <summary>
        /// 删除组织成员
        /// </summary>
        /// <param name="organizationUnit"></param>
        /// <param name="accountInfo"></param>
        /// <returns></returns>
        public static void DeleteMember(OrganizationUnit organizationUnit, AccountInfo accountInfo)
        {
            var sql = "UPDATE account_organization_units SET `IsDeleted` = 1 WHERE AccountId = @AccountId AND OrganizationUnitId = @OrganizationUnitId;";
            ServerConfig.WebDb.Execute(sql, new { AccountId = accountInfo.Id, OrganizationUnitId = organizationUnit.Id });
        }
    }
}
