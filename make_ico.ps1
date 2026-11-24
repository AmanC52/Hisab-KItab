Add-Type -AssemblyName System.Drawing

$pngPath = Join-Path $PSScriptRoot "icon.png"
$icoPath = Join-Path $PSScriptRoot "icon.ico"

$src = [System.Drawing.Bitmap]::FromFile($pngPath)
$hIcon = $src.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$src.Dispose()

Write-Host "Created icon.ico successfully!"
