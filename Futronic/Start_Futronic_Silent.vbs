' Run FtrScanHttpServer.exe in background silently without console window
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strCurrentDir = fso.GetParentFolderName(WScript.ScriptFullName)
strExePath = Chr(34) & strCurrentDir & "\FtrScanHttpServer.exe" & Chr(34)

WshShell.CurrentDirectory = strCurrentDir
WshShell.Run strExePath, 0, False
