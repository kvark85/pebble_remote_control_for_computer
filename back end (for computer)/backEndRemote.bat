@echo off &setlocal EnableExtensions DisableDelayedExpansion
 
:: Change the working directory to the directory of the batch file.
:: If the first passed argument was ~e~ (that is, the batch file was called from the VBScript)
::  then shift the parameters by one and continue at label :elevated
cd /d "%~dp0"&if "%~1"=="~e~" (shift&goto :elevated)
 
:: Assign the passed arguments to variable param.
set "param=%*"
 
:: NET SESSION fails if the batch code doesn't run with elevated permissions.
::  Assign variable __verb to "open" if the batch file runs elevated or to "runas" if it doesn't run elevated
>nul 2>&1 net session &&(set "__verb=open")||(set "__verb=runas")
 
:: Assign the name of the VBScript to variable vbs.
:: Assign the full name of the batch file to variable me.
:: Enable delayed variable expansion.
set "vbs=%temp%\uac.vbs"&set "me=%~f0"&setlocal enabledelayedexpansion
 
:: If arguments were passed, prepare them to be passed from within the VBScript by doubling the quotation marks.
if defined param set "param=!param:"=""!"
 
:: Write the VBScript. The ShellExecute method will run the batch file in a cmd.exe process where ~e~ will be passed as
::  first argument followed by the original arguments (saved in param). The UAC will be invoked if __verb was set to "runas".
::  Elsewise the UAC will not be invoked. For further information about the ShellExecute method see:
::  https://msdn.microsoft.com/en-us/library/windows/desktop/gg537745(v=vs.85).aspx
>"!vbs!" echo CreateObject("Shell.Application").ShellExecute "!comspec!", "/c """"!me!"" ~e~ !param!""", "", "%__verb%", 0
 
:: Run the VBScript in a cscript.exe process.
:: Delete the VBScript file.
:: Quit the batch execution.
cscript //nologo "!vbs!"&del "!vbs!"&goto :eof
 
 
:elevated
::~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
:: Do your elevated stuff here...

cd c:\ddd\pebble_rembble_control_for_computer\back end (for computer)
node backEndRemote.js
