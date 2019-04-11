using BaiShengGuangDianWeb.Base.Helper;
using BaiShengGuangDianWeb.Models.Account;
using Microsoft.AspNetCore.Mvc;
using ModelBase.Base.EnumConfig;
using ModelBase.Base.Utils;
using ModelBase.Models.Result;
using ServiceStack;
using System;
using System.Linq;

namespace BaiShengGuangDianWeb.Controllers.Api.AccountManagement
{
    /// <summary>
    /// 角色管理
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Route("RoleManagement")]
    [ApiController]
    public class RoleManagementController : ControllerBase
    {
        /// <summary>
        /// 获取角色列表
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
            result.datas.AddRange(RoleHelper.GetRoleInfo());
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value);
            return result;
        }

        /// <summary>
        /// 添加角色
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
                return Result.GenError<DataResult>(Error.NoAuth);
            }

            var param = Request.GetRequestParams();
            var name = param.GetValue("name");
            var permissions = param.GetValue("permissions");
            if (name.IsNullOrEmpty() || permissions.IsNullOrEmpty())
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            RoleInfo roleInfo;
            try
            {
                var permissionList = permissions.Split(',').Select(int.Parse).ToList();
                permissionList.AddRange(PermissionHelper.GetDefault());
                roleInfo = new RoleInfo
                {
                    Name = name,
                    Permissions = permissionList.Distinct().ToJSON()
                };
            }
            catch (Exception)
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            RoleHelper.AddRoleInfo(roleInfo);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, $"角色名:{roleInfo.Name},权限列表:{roleInfo.Permissions}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 删除角色
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
                return Result.GenError<DataResult>(Error.NoAuth);
            }
            
            var param = Request.GetRequestParams();
            var idStr = param.GetValue("id");
            if (!int.TryParse(idStr, out var id))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var roleInfo = RoleHelper.GetRoleInfo(id);
            if (roleInfo == null)
            {
                return Result.GenError<Result>(Error.RoleNotExist);
            }

            if (roleInfo.Default)
            {
                return Result.GenError<Result>(Error.RoleNotOperate);
            }
            RoleHelper.DeleteRoleInfo(id);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, $"角色ID:{roleInfo.Id},角色名:{roleInfo.Name}");
            return Result.GenError<Result>(Error.Success);
        }

        /// <summary>
        /// 更新角色
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
                return Result.GenError<DataResult>(Error.NoAuth);
            }


            var param = Request.GetRequestParams();
            var idStr = param.GetValue("id");
            if (!int.TryParse(idStr, out var id))
            {
                return Result.GenError<Result>(Error.ParamError);
            }

            var roleInfo = RoleHelper.GetRoleInfo(id);
            if (roleInfo == null)
            {
                return Result.GenError<Result>(Error.RoleNotExist);
            }

            if (roleInfo.Default)
            {
                return Result.GenError<Result>(Error.RoleNotOperate);
            }
            var logParam = $"角色ID:{roleInfo.Id}";
            var name = param.GetValue("name");
            if (!name.IsNullOrEmpty())
            {
                logParam = $",角色名:{roleInfo.Name},新角色名:{name}";
                roleInfo.Name = name;
            }
            var permissions = param.GetValue("permissions");
            if (!permissions.IsNullOrEmpty())
            {
                try
                {
                    var permissionList = permissions.Split(',').Select(int.Parse).ToList();
                    permissionList.AddRange(PermissionHelper.GetDefault());
                    roleInfo.Permissions = permissionList.Distinct().ToJSON();
                    logParam += $",新权限列表: {roleInfo.Permissions}";
                }
                catch (Exception)
                {
                    return Result.GenError<Result>(Error.ParamError);
                }
            }

            RoleHelper.UpdateRoleInfo(roleInfo);
            OperateLogHelper.Log(Request, AccountHelper.CurrentUser.Id, Request.Path.Value, logParam);
            return Result.GenError<Result>(Error.Success);
        }
    }
}