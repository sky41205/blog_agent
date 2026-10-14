#!/usr/bin/env bash
set -e

echo "========================================================================="
echo "  GOOGLE CLOUD PLATFORM DEPLOYMENT — PROJECT: bolg-agent"
echo "  Billed to Google Cloud Credits under Billing Account 01BDC6-EB392B-26E85B"
echo "========================================================================="

echo "[1/4] Configuring Google Cloud Project bolg-agent..."
gcloud config set project bolg-agent
gcloud config set compute/region asia-southeast1

echo "[2/4] Verifying Artifact Registry Repository..."
if ! gcloud artifacts repositories describe blogger-services --location=asia-southeast1 >/dev/null 2>&1; then
    echo "[*] Creating Artifact Registry repository 'blogger-services'..."
    gcloud artifacts repositories create blogger-services --repository-format=docker --location=asia-southeast1 --description="Blogger Containers"
fi

echo "[3/4] Triggering Cloud Build for microservices..."
gcloud builds submit --config=cloudbuild.yaml .

echo "[4/4] Cloud Run Services deployed successfully!"
gcloud run services list --project=bolg-agent --region=asia-southeast1
