$Env:DOCKER_BUILDKIT = "0"
$Env:DOCKER_DEFAULT_PLATFORM = "linux/amd64"

Write-Host "Deploying with Serverless Framework..."
serverless deploy