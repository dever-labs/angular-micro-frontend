# Build broker library first, then build all apps.
# @czprz/broker is referenced via "file:../angular-libs/dist/broker" in each app's package.json.
# Run `npm install --legacy-peer-deps` in each app to update the symlink after a broker rebuild.

Set-Location angular-libs
npm install --legacy-peer-deps
ng build broker --configuration production

Set-Location ..
foreach ($dir in @("angular-menu", "angular-overview", "angular-toolbar", "angular-shell")) {
    Write-Host "Building $dir..."
    Set-Location $dir
    npm install --legacy-peer-deps
    ng build --configuration production
    Set-Location ..
}

Write-Host "Build complete."
