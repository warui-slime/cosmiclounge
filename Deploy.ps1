$Env:DOCKER_BUILDKIT = "0"
$Env:DOCKER_DEFAULT_PLATFORM = "linux/amd64"
aws ecr get-login-password --region us-east-2 |
  docker login --username AWS --password-stdin 376917974265.dkr.ecr.us-east-2.amazonaws.com
Write-Host "Deploying with Serverless Framework..."
serverless deploy
