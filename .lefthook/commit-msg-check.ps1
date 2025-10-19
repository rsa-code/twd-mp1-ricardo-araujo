$commitMsgFile = $args[0]
$msg = Get-Content $commitMsgFile -Raw
if ($msg.Length -lt 10) {
    Write-Host "❌ Commit message must be at least 10 characters" -ForegroundColor Red
    Write-Host "💡 Consider using conventional commit format: type(scope): description" -ForegroundColor Yellow
    exit 1
}
exit 0
