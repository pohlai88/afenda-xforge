# Links monorepo .cursor/skills and .agents/skills into packages/design-system
# so Cursor discovers them when the workspace root is packages/design-system.
#
# Usage (from repo root):
#   pwsh tools/sync-cursor-skills-workspace.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$PkgRoot = Join-Path $RepoRoot "packages\design-system"

function Ensure-Junction {
    param(
        [string]$LinkPath,
        [string]$TargetPath
    )

    if (-not (Test-Path $TargetPath)) {
        throw "Target missing: $TargetPath"
    }

    $parent = Split-Path -Parent $LinkPath
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }

    if (Test-Path $LinkPath) {
        $item = Get-Item $LinkPath -Force
        if ($item.LinkType -eq "Junction" -and $item.Target -contains $TargetPath) {
            Write-Host "OK  $LinkPath"
            return
        }
        throw "Path exists and is not the expected junction: $LinkPath"
    }

    cmd /c mklink /J "$LinkPath" "$TargetPath" | Out-Null
    Write-Host "LINK $LinkPath -> $TargetPath"
}

Ensure-Junction (Join-Path $PkgRoot ".cursor\skills") (Join-Path $RepoRoot ".cursor\skills")
Ensure-Junction (Join-Path $PkgRoot ".agents\skills") (Join-Path $RepoRoot ".agents\skills")

Write-Host ""
Write-Host "Done. Reload Cursor (Developer: Reload Window), then check:"
Write-Host "  Settings > Rules > Agent Decides > skills: craft, ui-craft, afenda-ui-craft"
Write-Host "  In chat: type @craft (not /ui-craft:craft)"
