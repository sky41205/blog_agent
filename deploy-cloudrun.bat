@echo off
TITLE Deploy Autonomous Blogger to Google Cloud Run (bolg-agent)
COLOR 0B

echo =========================================================================
echo   GOOGLE CLOUD PLATFORM DEPLOYMENT — PROJECT: bolg-agent
echo   Billed to Google Cloud Credits under Billing Account 01BDC6-EB392B-26E85B
echo =========================================================================
echo.

:: 1. Verify Project
echo [1/4] Verifying Google Cloud Project Configuration...
call gcloud config set project bolg-agent
call gcloud config set compute/region asia-southeast1

:: 2. Ensure Artifact Registry exists
echo.
echo [2/4] Verifying Artifact Registry Repository...
call gcloud artifacts repositories describe blogger-services --location=asia-southeast1 2>nul
if %errorlevel% neq 0 (
    echo [*] Creating Artifact Registry repository 'blogger-services'...
    call gcloud artifacts repositories create blogger-services --repository-format=docker --location=asia-southeast1 --description="Blogger Containers"
) else (
    echo [OK] Artifact Registry repository exists.
)

:: 3. Submit Cloud Build
echo.
echo [3/4] Triggering Cloud Build for microservices (Vertex AI + Cloud Run)...
echo [*] Submitting build to project bolg-agent using cloudbuild.yaml...
call gcloud builds submit --config=cloudbuild.yaml .

:: 4. Completion
echo.
echo [4/4] Cloud Run Services deployed successfully!
echo =========================================================================
echo   Live Cloud Run Service URLs:
call gcloud run services list --project=bolg-agent --region=asia-southeast1
echo =========================================================================
pause
