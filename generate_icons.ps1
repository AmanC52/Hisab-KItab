Add-Type -AssemblyName System.Drawing

function Draw-Icon {
    param(
        [int]$size,
        [string]$outputPath,
        [string]$type = "full" # "full", "round", or "foreground"
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    if ($type -eq "foreground") {
        # Transparent background for adaptive icon foreground
        $g.Clear([System.Drawing.Color]::Transparent)
        
        # Center symbol in safe area (about 60% of total size)
        $badgeSize = [int]($size * 0.58)
        $badgeX = [int](($size - $badgeSize) / 2)
        $badgeY = [int](($size - $badgeSize) / 2)

        # Draw a stylish rounded container for the ₹
        $rect = New-Object System.Drawing.Rectangle $badgeX, $badgeY, $badgeSize, $badgeSize
        $brushGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $rect,
            [System.Drawing.Color]::FromArgb(255, 37, 99, 235),  # Royal Blue
            [System.Drawing.Color]::FromArgb(255, 29, 78, 216),  # Darker Blue
            45.0
        )
        
        # Rounded path
        $radius = [int]($badgeSize * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $path.AddArc($badgeX, $badgeY, $d, $d, 180, 90)
        $path.AddArc($badgeX + $badgeSize - $d, $badgeY, $d, $d, 270, 90)
        $path.AddArc($badgeX + $badgeSize - $d, $badgeY + $badgeSize - $d, $d, $d, 0, 90)
        $path.AddArc($badgeX, $badgeY + $badgeSize - $d, $d, $d, 90, 90)
        $path.CloseFigure()

        $g.FillPath($brushGrad, $path)

        # Subtle inner border
        $penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), [float]($size * 0.015))
        $g.DrawPath($penBorder, $path)

        # Bottom ledger accents (Green = Credit, Red = Debit)
        $accentH = [int]($badgeSize * 0.08)
        $accentY = $badgeY + $badgeSize - $accentH - [int]($badgeSize * 0.06)
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))), $badgeX + [int]($badgeSize * 0.18), $accentY, [int]($badgeSize * 0.30), $accentH)
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))), $badgeX + [int]($badgeSize * 0.52), $accentY, [int]($badgeSize * 0.30), $accentH)

        # Draw Rupee Symbol (₹)
        $fontSize = [int]($badgeSize * 0.52)
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

        $textRect = New-Object System.Drawing.RectangleF $badgeX, ($badgeY - [int]($badgeSize * 0.04)), $badgeSize, $badgeSize
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.DrawString([char]0x20B9, $font, $textBrush, $textRect, $sf)

    } elseif ($type -eq "round") {
        # Circular icon
        $g.Clear([System.Drawing.Color]::Transparent)
        
        $rect = New-Object System.Drawing.Rectangle 1, 1, ($size - 2), ($size - 2)
        $brushGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $rect,
            [System.Drawing.Color]::FromArgb(255, 30, 58, 138),  # Deep Navy
            [System.Drawing.Color]::FromArgb(255, 37, 99, 235),  # Bright Blue
            45.0
        )
        $g.FillEllipse($brushGrad, $rect)

        # Border
        $penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 255, 255, 255), [float]($size * 0.03))
        $g.DrawEllipse($penBorder, $rect)

        # Accents
        $accentH = [int]($size * 0.06)
        $accentY = [int]($size * 0.78)
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))), [int]($size * 0.22), $accentY, [int]($size * 0.26), $accentH)
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))), [int]($size * 0.52), $accentY, [int]($size * 0.26), $accentH)

        # Rupee Symbol
        $fontSize = [int]($size * 0.50)
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

        $textRect = New-Object System.Drawing.RectangleF 0, (-[int]($size * 0.04)), $size, $size
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.DrawString([char]0x20B9, $font, $textBrush, $textRect, $sf)

    } else {
        # Standard icon with rounded corners (squircle)
        $g.Clear([System.Drawing.Color]::Transparent)

        $rect = New-Object System.Drawing.Rectangle 1, 1, ($size - 2), ($size - 2)
        $brushGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $rect,
            [System.Drawing.Color]::FromArgb(255, 26, 54, 138),  # Deep Navy Blue
            [System.Drawing.Color]::FromArgb(255, 37, 99, 235),  # Vibrant Royal Blue
            45.0
        )

        $radius = [int]($size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $path.AddArc(1, 1, $d, $d, 180, 90)
        $path.AddArc($size - 2 - $d, 1, $d, $d, 270, 90)
        $path.AddArc($size - 2 - $d, $size - 2 - $d, $d, $d, 0, 90)
        $path.AddArc(1, $size - 2 - $d, $d, $d, 90, 90)
        $path.CloseFigure()

        $g.FillPath($brushGrad, $path)

        # Border
        $penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 255, 255, 255), [float]($size * 0.025))
        $g.DrawPath($penBorder, $path)

        # Ledger stripes (Green = Credit / Income, Red = Debit / Expense)
        $accentH = [int]($size * 0.065)
        $accentY = [int]($size * 0.78)
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 197, 94))), [int]($size * 0.20), $accentY, [int]($size * 0.28), $accentH)
        $g.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))), [int]($size * 0.52), $accentY, [int]($size * 0.28), $accentH)

        # Rupee Symbol
        $fontSize = [int]($size * 0.50)
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

        $textRect = New-Object System.Drawing.RectangleF 0, (-[int]($size * 0.04)), $size, $size
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.DrawString([char]0x20B9, $font, $textBrush, $textRect, $sf)
    }

    # Ensure parent dir exists
    $dir = Split-Path $outputPath -Parent
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $outputPath ($($size)x$($size)) [$type]"
}

# Icon dimension mappings
$densities = @(
    @{ folder = "android/app/src/main/res/mipmap-mdpi";    app = 48;  fg = 108 },
    @{ folder = "android/app/src/main/res/mipmap-hdpi";    app = 72;  fg = 162 },
    @{ folder = "android/app/src/main/res/mipmap-xhdpi";   app = 96;  fg = 216 },
    @{ folder = "android/app/src/main/res/mipmap-xxhdpi";  app = 144; fg = 324 },
    @{ folder = "android/app/src/main/res/mipmap-xxxhdpi"; app = 192; fg = 432 }
)

foreach ($d in $densities) {
    Draw-Icon -size $d.app -outputPath "$($d.folder)/ic_launcher.png" -type "full"
    Draw-Icon -size $d.app -outputPath "$($d.folder)/ic_launcher_round.png" -type "round"
    Draw-Icon -size $d.fg  -outputPath "$($d.folder)/ic_launcher_foreground.png" -type "foreground"
}

# Master 512x512 icon for web assets & Play Store
Draw-Icon -size 512 -outputPath "www/icon.png" -type "full"
Draw-Icon -size 512 -outputPath "android/app/src/main/res/drawable/icon.png" -type "full"

Write-Host "All custom icons designed and generated successfully!"
