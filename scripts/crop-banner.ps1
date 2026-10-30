Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\T1din\.gemini\antigravity\brain\99e0dd9c-c3b3-478e-9966-7f43b55b4685\.user_uploaded\media_1793358275849_74f073c1.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

$splitX = 365
for ($x = 320; $x -lt 400; $x++) {
    $c = $bmp.GetPixel($x, 200)
    if ($c.R -gt 250 -and $c.G -gt 250 -and $c.B -gt 250) {
        $splitX = $x
        Write-Output "Found split at $x"
        break
    }
}

# Crop left artwork (0 to splitX)
$rect = New-Object System.Drawing.Rectangle(0, 0, $splitX, $bmp.Height)
$cropBmp = $bmp.Clone($rect, $bmp.PixelFormat)

$outDir = "d:\code\tainguyen-edit\frontend\public\images"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force
}
$outPath = Join-Path $outDir "premium-banner.png"
$cropBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved crop to $outPath ($($cropBmp.Width)x$($cropBmp.Height))"

$cropBmp.Dispose()
$bmp.Dispose()
