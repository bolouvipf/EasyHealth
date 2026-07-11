# Generate the EasyHealth landing-page hero image via Hugging Face FLUX.1-schnell.
# Run this on a machine WITH internet access.
# The token is read from the HF_TOKEN environment variable so it is never
# written into this file or committed to the repository.
#
# Usage (PowerShell):
#   $env:HF_TOKEN = "hf_xxxxxxxxx"
#   pwsh scripts/generate-hero.ps1
#
# After running, the image is saved to frontend/public/doctor-hero.png and is
# served automatically by Vite at "/doctor-hero.png".

$ErrorActionPreference = "Stop"

if (-not $env:HF_TOKEN) {
  Write-Error "Define `$env:HF_TOKEN with your Hugging Face token first."
  exit 1
}

$model = "black-forest-labs/FLUX.1-schnell"
$url = "https://api-inference.huggingface.co/models/$model"

$prompt = "Flat vector illustration, healthcare theme, a friendly Black African doctor in a white coat holding a smartphone, scanning a QR code on a patient phone, soft green and teal palette, rounded minimal shapes, clean light background, reassuring calm atmosphere, modern medical app, no text, no letters"

$outDir = Join-Path $PSScriptRoot "..\frontend\public"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
$outFile = Join-Path $outDir "doctor-hero.png"

$body = @{ inputs = $prompt } | ConvertTo-Json -Compress

Write-Host "Generating hero image..."
$resp = Invoke-RestMethod -Uri $url -Method Post `
  -Headers @{ Authorization = "Bearer $env:HF_TOKEN"; "Content-Type" = "application/json" } `
  -Body $body `
  -OutFile $outFile

if (Test-Path $outFile) {
  Write-Host "Saved -> $outFile ($([math]::Round((Get-Item $outFile).Length / 1KB, 1)) KB)"
} else {
  Write-Error "Generation failed: no file produced."
  exit 1
}
