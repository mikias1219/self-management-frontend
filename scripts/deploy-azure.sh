#!/usr/bin/env bash
#
# LifeOS Frontend - Azure Deployment Script (Frontend-only repo)
# Deploys only the frontend to task-managamnet-frontend
#
set -euo pipefail

RESOURCE_GROUP="task-managamnet-rg"
ACR_NAME="taskmanagamnetacr"
FRONTEND_APP="task-managamnet-frontend"

COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
IMAGE_TAG="${COMMIT_SHA}"

echo "🚀 Deploying Frontend to Azure"
echo "   Resource Group : ${RESOURCE_GROUP}"
echo "   Registry       : ${ACR_NAME}"
echo "   Tag            : ${IMAGE_TAG}"
echo ""

echo "🔐 Logging into Azure Container Registry..."
az acr login --name "${ACR_NAME}"

echo ""
echo "📦 Building frontend image..."
docker build -t "${ACR_NAME}.azurecr.io/task-managamnet/frontend:${IMAGE_TAG}" \
             -t "${ACR_NAME}.azurecr.io/task-managamnet/frontend:latest" .

echo "⬆️  Pushing frontend image..."
docker push "${ACR_NAME}.azurecr.io/task-managamnet/frontend:${IMAGE_TAG}"
docker push "${ACR_NAME}.azurecr.io/task-managamnet/frontend:latest"

echo ""
echo "🔄 Updating task-managamnet-frontend container app..."
az containerapp update \
  --name "${FRONTEND_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --image "${ACR_NAME}.azurecr.io/task-managamnet/frontend:${IMAGE_TAG}" \
  --target-port 3000 \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv

echo ""
echo "✅ Frontend deployment complete!"
echo "   URL: https://${FRONTEND_APP}.ambitiousmushroom-6a766356.centralus.azurecontainerapps.io"
