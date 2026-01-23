# Symone Gateway - Cloud Run Deployment Script (Windows/PowerShell)
# Project: leafy-star-483709-g1

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "SYMONE GATEWAY - CLOUD RUN DEPLOYMENT"
Write-Host "========================================"
Write-Host ""

# Configuration
$PROJECT_ID = "leafy-star-483709-g1"
$REGION = "us-central1"
$SERVICE_NAME = "symone-gateway"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Step 1: Set GCP project
Write-Host "1. Setting GCP project..."
gcloud config set project $PROJECT_ID
Write-Host "   ✅ Project set"
Write-Host ""

# Step 2: Enable required APIs
Write-Host "2. Enabling Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID
Write-Host "   ✅ APIs enabled"
Write-Host ""

# Step 3: Build and push Docker image
Write-Host "3. Building Docker image (this may take 2-3 minutes)..."
gcloud builds submit --tag $IMAGE_NAME --project=$PROJECT_ID
Write-Host "   ✅ Image built and pushed"
Write-Host ""

# Step 4: Create secrets from .env
Write-Host "4. Creating secrets..."

# Load .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        Set-Variable -Name $key -Value $value -Scope Script
    }
}

# Create secrets
@{
    "SUPABASE_URL" = $SUPABASE_URL
    "SUPABASE_SERVICE_ROLE_KEY" = $SUPABASE_SERVICE_ROLE_KEY
    "SLACK_BOT_TOKEN" = $SLACK_BOT_TOKEN
    "N8N_API_KEY" = $N8N_API_KEY
} | ForEach-Object {
    $_.GetEnumerator() | ForEach-Object {
        $secretName = $_.Key
        $secretValue = $_.Value
        
        # Try to create, if exists, update
        try {
            echo $secretValue | gcloud secrets create $secretName `
                --data-file=- `
                --project=$PROJECT_ID 2>$null
        } catch {
            echo $secretValue | gcloud secrets versions add $secretName `
                --data-file=- `
                --project=$PROJECT_ID
        }
    }
}
Write-Host "   ✅ Secrets created"
Write-Host ""

# Step 5: Deploy to Cloud Run
Write-Host "5. Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --project $PROJECT_ID `
    --allow-unauthenticated `
    --set-env-vars="N8N_API_URL=$N8N_API_URL" `
    --set-secrets="SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,SLACK_BOT_TOKEN=SLACK_BOT_TOKEN:latest,N8N_API_KEY=N8N_API_KEY:latest" `
    --memory 512Mi `
    --cpu 1 `
    --timeout 300 `
    --max-instances 10

Write-Host ""
Write-Host "========================================"
Write-Host "🚀 DEPLOYMENT COMPLETE!"
Write-Host "========================================"
Write-Host ""

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME `
    --platform managed `
    --region $REGION `
    --project $PROJECT_ID `
    --format 'value(status.url)'

Write-Host "Your Symone Gateway is live at:"
Write-Host $SERVICE_URL
Write-Host ""
Write-Host "API Documentation: $SERVICE_URL/docs"
Write-Host "Health Check: $SERVICE_URL/health"
Write-Host "Metrics: $SERVICE_URL/metrics"
Write-Host ""
Write-Host "========================================"
