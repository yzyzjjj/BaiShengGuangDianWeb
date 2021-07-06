@echo off
cd %cd%
tasklist /v %cd%
@start "%cd%" cmd /k "dotnet BaiShengGuangDianWeb.dll"
