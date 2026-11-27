@echo off
rem Starts tools/dev.mjs with Node's full path, for launchers (like the Claude app's preview) whose PATH has no node.
rem Usage: tools\dev.cmd [port]
cd /d "%~dp0.."
"C:\Program Files\nodejs\node.exe" tools\dev.mjs %*
