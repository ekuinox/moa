param(
    [Parameter(Mandatory = $true)]
    [string] $FilePath
)

$ErrorActionPreference = "Stop"

function Require-Env {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name
    )

    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Environment variable '$Name' is required for Windows code signing."
    }

    return $value
}

$endpoint = Require-Env "MOA_WINDOWS_SIGNING_ENDPOINT"
$accountName = Require-Env "MOA_WINDOWS_SIGNING_ACCOUNT_NAME"
$certificateProfileName = Require-Env "MOA_WINDOWS_SIGNING_CERTIFICATE_PROFILE_NAME"

Require-Env "AZURE_TENANT_ID" | Out-Null
Require-Env "AZURE_CLIENT_ID" | Out-Null
Require-Env "AZURE_CLIENT_SECRET" | Out-Null

if (-not (Test-Path -LiteralPath $FilePath)) {
    throw "Signing target does not exist: $FilePath"
}

trusted-signing-cli `
    -e $endpoint `
    -a $accountName `
    -c $certificateProfileName `
    -d "moa" `
    $FilePath
