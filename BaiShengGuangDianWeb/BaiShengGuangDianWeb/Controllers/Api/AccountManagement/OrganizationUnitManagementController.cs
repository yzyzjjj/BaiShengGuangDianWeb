using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Models.Account;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using ServiceStack;
using System.Collections.Generic;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.AccountManagement
{
    /// <summary>
    /// 组织架构管理
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Route("OrganizationUnitManagement")]
    [ApiController]
    public class OrganizationUnitManagementController : ControllerBase
    {
        /// <summary>
        /// 获取组织架构
        /// </summary>
        /// <returns></returns>
        [HttpGet("List")]
        public DataResult List()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<DataResult>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<DataResult>(Error.NoAuth);
            }

            var result = new DataResult();
            result.datas.AddRange(OrganizationUnitHelper.GetOrganizationUnit());
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        /// <summary>
        /// 添加组织结构
        /// parentId  
        /// </summary>
        /// <returns></returns>
        [HttpPost("Add")]
        public Result Add()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var parentIdStr = param.GetValue("parentId");
            var name = param.GetValue("name");
            if (!int.TryParse(parentIdStr, out var parentId))
            {
                return Result.GenError<Result>(Error.ParamError);
            }
            if (name.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            OrganizationUnit parent = null;
            if (parentId != 0)
            {
                parent = OrganizationUnitHelper.GetOrganizationUnit(parentId);
                if (parent == null)
                {
                    return Result.GenError<Result>(Error.ParentNotExist);
                }
            }

            var underOrganizationUnits = OrganizationUnitHelper.GetUnderOrganizationUnits(parentId);
            if (underOrganizationUnits.Any(x => x.Name == name))
            {
                return Result.GenError<Result>(Error.OrganizationUnitIsExist);
            }

            var organizationUnit = new OrganizationUnit
            {
                ParentId = parentId,
                CodeLink = parent != null ? parent.CodeLink : "",
                Name = name
            };
            OrganizationUnitHelper.AddOrganizationUnit(organizationUnit);
            var logParam = $"组织名:{name}";
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam);
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 删除组织结构
        /// </summary>
        /// <returns></returns>
        [HttpPost("Delete")]
        public Result Delete()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var idStr = param.GetValue("id");
            if (!int.TryParse(idStr, out var id))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var organizationUnit = OrganizationUnitHelper.GetOrganizationUnit(id);
            if (organizationUnit == null)
            {
                return Result.GenError<Result>(Error.OrganizationUnitNotExist);
            }

            OrganizationUnitHelper.DeleteOrganizationUnit(organizationUnit);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, $"组织ID:{organizationUnit.Id},组织名:{organizationUnit.Name}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 更新组织结构
        /// </summary>
        /// <returns></returns>
        [HttpPost("Update")]
        public Result Update()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var idStr = param.GetValue("id");
            if (!int.TryParse(idStr, out var id))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var organizationUnit = OrganizationUnitHelper.GetOrganizationUnit(id);
            if (organizationUnit == null)
            {
                return Result.GenError<Result>(Error.OrganizationUnitNotExist);
            }
            var nameStr = param.GetValue("name");
            var oldName = organizationUnit.Name;
            if (nameStr.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var underOrganizationUnits = OrganizationUnitHelper.GetUnderOrganizationUnits(organizationUnit.ParentId);
            if (underOrganizationUnits.Any(x => x.Name == nameStr))
            {
                return Result.GenError<Result>(Error.OrganizationUnitIsExist);
            }

            organizationUnit.Name = nameStr;

            OrganizationUnitHelper.UpdateOrganizationUnit(organizationUnit);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, $"组织ID:{organizationUnit.Id},组织名:{oldName},新组织名:{organizationUnit.Name}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 移动组织结构
        /// </summary>
        /// <returns></returns>
        [HttpPost("Move")]
        public Result Move()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var parentIdStr = param.GetValue("parentId");
            if (!int.TryParse(parentIdStr, out var parentId))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var parent = OrganizationUnitHelper.GetOrganizationUnit(parentId);
            if (parent == null)
            {
                return Result.GenError<Result>(Error.OrganizationUnitNotExist);
            }
            var childIdStr = param.GetValue("childId");
            if (!int.TryParse(childIdStr, out var childId))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var child = OrganizationUnitHelper.GetOrganizationUnit(childId);
            if (child == null)
            {
                return Result.GenError<Result>(Error.OrganizationUnitNotExist);
            }

            OrganizationUnitHelper.MoveOrganizationUnit(parent, child);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value,
                $"上级组织ID:{parent.Id},组织名:{parent.Name},下级组织ID:{child.Id},组织名:{child.Name}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 获取组织成员
        /// parentId  
        /// </summary>
        /// <returns></returns>
        [HttpGet("MemberList")]
        public DataResult MemberList()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<DataResult>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<DataResult>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var organizationUnitIdIdStr = param.GetValue("organizationUnitId");
            if (!int.TryParse(organizationUnitIdIdStr, out var organizationUnitId))
            {
                return Result.GenError<DataResult>(Error.ParamError);
            }

            var organizationUnit = OrganizationUnitHelper.GetOrganizationUnit(organizationUnitId);
            if (organizationUnit == null)
            {
                return Result.GenError<DataResult>(Error.OrganizationUnitNotExist);
            }

            var result = new DataResult();
            result.datas.AddRange(OrganizationUnitHelper.MemberList(organizationUnit));
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        /// <summary>
        /// 添加组织成员
        /// parentId  
        /// </summary>
        /// <returns></returns>
        [HttpPost("AddMember")]
        public Result AddMember()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var organizationUnitIdIdStr = param.GetValue("organizationUnitId");
            if (!int.TryParse(organizationUnitIdIdStr, out var organizationUnitId))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var organizationUnit = OrganizationUnitHelper.GetOrganizationUnit(organizationUnitId);
            if (organizationUnit == null)
            {
                return Result.GenError<Result>(Error.OrganizationUnitNotExist);
            }
            var memberIdStr = param.GetValue("memberId");
            var memberIdList = memberIdStr.Split(',').Select(int.Parse);
            var addMemberList = AccountHelper.GetAccountInfos(memberIdList);
            if (!addMemberList.Any() || addMemberList.Count() != memberIdList.Count())
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }

            var memberList = OrganizationUnitHelper.MemberList(organizationUnit);
            if (memberList.Any(x => addMemberList.Any(y => y.Id == x.AccountId)))
            {
                return Result.GenError<Result>(Error.MemberIsExist);
            }

            OrganizationUnitHelper.AddMembers(organizationUnit, addMemberList);
            var logParam = addMemberList.Select(member => $"组织ID:{organizationUnit.Id},组织名:{organizationUnit.Name},成员ID:{member.Id},成员名:{member.Name}").Join(",");
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam);
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 删除组织成员
        /// parentId  
        /// </summary>
        /// <returns></returns>
        [HttpPost("DeleteMember")]
        public Result DeleteMember()
        {
            var accountInfo = AccountHelper.CurrentUser;
            if (accountInfo == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            if (!PermissionHelper.CheckPermission(Request.Path.Value))
            {
                return Result.GenError<Result>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var organizationUnitIdIdStr = param.GetValue("organizationUnitId");
            if (!int.TryParse(organizationUnitIdIdStr, out var organizationUnitId))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var organizationUnit = OrganizationUnitHelper.GetOrganizationUnit(organizationUnitId);
            if (organizationUnit == null)
            {
                return Result.GenError<Result>(Error.OrganizationUnitNotExist);
            }
            var memberIdStr = param.GetValue("memberId");
            if (!int.TryParse(memberIdStr, out var memberId))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var member = AccountHelper.GetAccountInfo(memberId);
            if (member == null)
            {
                return Result.GenError<Result>(Error.AccountNotExist);
            }
            OrganizationUnitHelper.DeleteMember(organizationUnit, member);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value,
                $"组织ID:{organizationUnit.Id},组织名:{organizationUnit.Name},成员ID:{member.Id},成员名:{member.Name}", member.Id);
            return Result.GenError<Result>(Error.Success);
        }
    }
}