@echo off
cd %cd%
taskkill /FI "WINDOWTITLE eq %cd%*"
