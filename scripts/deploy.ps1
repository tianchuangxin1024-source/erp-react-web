[CmdletBinding()]
param(
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9.-]*$')]
    [string] $ServerHost = '39.106.106.98',

    [ValidatePattern('^[A-Za-z_][A-Za-z0-9_-]*$')]
    [string] $ServerUser = 'root',

    [ValidateRange(1, 65535)]
    [int] $SshPort = 22,

    [ValidatePattern('^/[A-Za-z0-9_/-]+$')]
    [string] $RemoteDirectory = '/home/web',

    [ValidatePattern('^http://[A-Za-z0-9.-]+:[0-9]+$')]
    [string] $BackendOrigin = 'http://127.0.0.1:8080',

    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9.-]*$')]
    [string] $ServerName = '39.106.106.98',

    [ValidateRange(1, 65535)]
    [int] $ListenPort = 80,

    [ValidatePattern('^/[A-Za-z0-9_./-]+\.conf$')]
    [string] $NginxConfigPath = '/etc/nginx/conf.d/erp-react-web.conf',

    [string] $IdentityFile,
    [switch] $SkipInstall,
    [switch] $DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$projectRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Checked {
    param([string] $Command, [string[]] $CommandArguments)
    & $Command @CommandArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $Command"
    }
}

if ($RemoteDirectory -eq '/' -or $RemoteDirectory.EndsWith('/') -or $RemoteDirectory.Contains('..')) {
    throw 'RemoteDirectory must be an absolute application directory without parent segments or a trailing slash.'
}
if ($NginxConfigPath.Contains('..')) { throw 'NginxConfigPath cannot contain parent segments.' }
$upstream = [Uri] $BackendOrigin
if ($upstream.Port -lt 1 -or $upstream.Port -gt 65535) { throw 'Invalid backend port.' }
if ($ServerName.Contains('..') -or $ServerHost.Contains('..')) { throw 'Invalid host name.' }

$npmCommand = Get-Command npm.cmd, npm -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $npmCommand) { throw 'Install Node.js and npm before running this script.' }
$npm = $npmCommand.Source
foreach ($tool in @('tar', 'ssh', 'scp')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Required command missing: $tool" }
}

$identityArguments = @()
if ($IdentityFile) {
    $identity = (Resolve-Path -LiteralPath $IdentityFile).Path
    $identityArguments = @('-i', $identity)
}

Push-Location -LiteralPath $projectRoot
try {
    if (-not $SkipInstall) { Invoke-Checked $npm @('ci') }
    Invoke-Checked $npm @('run', 'build')
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'dist/index.html'))) { throw 'dist/index.html is missing.' }

    $releaseId = (Get-Date -Format 'yyyyMMddHHmmss') + '-' + ([Guid]::NewGuid().ToString('N').Substring(0, 8))
    $packageDirectory = Join-Path $projectRoot ".deploy/$releaseId"
    New-Item -ItemType Directory -Path $packageDirectory -Force | Out-Null
    $archive = Join-Path $packageDirectory 'site.tar.gz'
    $configFile = Join-Path $packageDirectory 'nginx.conf'
    $activationFile = Join-Path $packageDirectory 'activate.sh'
    $utf8 = [Text.UTF8Encoding]::new($false)
    $publicOrigin = "http://$ServerName"
    if ($ListenPort -ne 80) { $publicOrigin += ":$ListenPort" }

    $config = [IO.File]::ReadAllText((Join-Path $projectRoot 'deploy/nginx.conf.template'))
    $config = $config.Replace('@BACKEND_ORIGIN@', $BackendOrigin).
        Replace('@PUBLIC_ORIGIN@', $publicOrigin).
        Replace('@BACKEND_PORT@', $upstream.Port.ToString()).
        Replace('@SERVER_NAME@', $ServerName).
        Replace('@LISTEN_PORT@', $ListenPort.ToString()).
        Replace('@WEB_ROOT@', $RemoteDirectory)
    if ($config -match '@[A-Z_]+@') { throw 'Unresolved Nginx template placeholder.' }
    [IO.File]::WriteAllText($configFile, $config.Replace("`r`n", "`n").TrimStart([char]0xfeff), $utf8)
    $activation = [IO.File]::ReadAllText((Join-Path $projectRoot 'deploy/activate.sh'))
    [IO.File]::WriteAllText($activationFile, $activation.Replace("`r`n", "`n").TrimStart([char]0xfeff), $utf8)
    Invoke-Checked 'tar' @('-czf', $archive, '-C', (Join-Path $projectRoot 'dist'), '.')

    Write-Host "Release package: $packageDirectory"
    Write-Host "Destination: ${ServerUser}@${ServerHost}:$RemoteDirectory"
    Write-Host "Public origin: $publicOrigin"
    Write-Host "API upstream: $BackendOrigin"

    if ($DryRun) {
        Write-Host 'Dry run complete. Build, archive and Nginx configuration are ready locally.'
        return
    }

    $destination = "$ServerUser@$ServerHost"
    $sshArguments = @('-p', $SshPort.ToString(), '-o', 'ConnectTimeout=15') + $identityArguments
    $scpArguments = @('-P', $SshPort.ToString(), '-o', 'ConnectTimeout=15') + $identityArguments
    $incoming = "$RemoteDirectory/.incoming/$releaseId"

    Invoke-Checked 'ssh' ($sshArguments + @($destination, "mkdir -p $RemoteDirectory/.incoming"))
    Invoke-Checked 'scp' ($scpArguments + @($archive, "${destination}:$incoming.tar.gz"))
    Invoke-Checked 'scp' ($scpArguments + @($configFile, "${destination}:$incoming.conf"))
    Invoke-Checked 'scp' ($scpArguments + @($activationFile, "${destination}:$incoming.sh"))
    $activateCommand = "bash $incoming.sh $RemoteDirectory $releaseId $ServerName $ListenPort $NginxConfigPath"
    Invoke-Checked 'ssh' ($sshArguments + @($destination, $activateCommand))
    Write-Host "Deployment verified at $publicOrigin"
}
finally {
    Pop-Location
}
