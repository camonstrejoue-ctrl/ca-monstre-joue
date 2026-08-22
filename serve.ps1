param(
  [string]$Root = $PSScriptRoot,
  [int]$Port = 8752
)

$listener = New-Object System.Net.HttpListener
# "+" écoute sur toutes les interfaces (localhost ET l'IP Wi-Fi/LAN du PC), pour
# pouvoir tester depuis un téléphone sur le même réseau. Si Windows refuse (droits
# insuffisants pour une liaison générique), on retombe sur localhost uniquement.
try {
  $listener.Prefixes.Add("http://+:$Port/")
  $listener.Start()
} catch {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$Port/")
  $listener.Start()
  Write-Host "Acces reseau (LAN) indisponible (droits insuffisants) - localhost uniquement." -ForegroundColor Yellow
}
$lanIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress)
Write-Host "Serving $Root on http://localhost:$Port/"
if ($lanIp) { Write-Host "Accessible aussi depuis le reseau local sur http://${lanIp}:$Port/" }

$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="application/javascript";
  ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg";
  ".json"="application/json"; ".ico"="image/x-icon"; ".webp"="image/webp"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $req = $context.Request
  $res = $context.Response
  try {
    $res.Headers.Add("Access-Control-Allow-Origin", "*")
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $Root ($path.TrimStart("/"))
    # GitHub Pages sert index.html pour une requete de dossier (ex. /jeu/finspan/) ;
    # on reproduit ce comportement ici pour tester les pages generees en local.
    if ((Test-Path $filePath -PathType Container) -and (Test-Path (Join-Path $filePath "index.html") -PathType Leaf)) {
      $filePath = Join-Path $filePath "index.html"
    }
    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $ct = $mime[$ext]
      if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $res.ContentType = $ct
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    $res.StatusCode = 500
  } finally {
    $res.OutputStream.Close()
  }
}
