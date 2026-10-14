#!/usr/bin/env bash
set -e

echo "========================================================================="
echo "  CONFIGURING GOOGLE CLOUD ADC & VERTEX AI FOR bolg-agent"
echo "========================================================================="

echo "[1/4] Setting active project to bolg-agent..."
gcloud config set project bolg-agent

echo "[2/4] Enabling Vertex AI API (aiplatform.googleapis.com)..."
gcloud services enable aiplatform.googleapis.com

echo "[3/4] Authenticating Application Default Credentials (ADC)..."
gcloud auth application-default login

echo "[4/4] Setting ADC quota project to bolg-agent..."
gcloud auth application-default set-quota-project bolg-agent

echo "========================================================================="
echo "  GOOGLE CLOUD ADC CONFIGURED SUCCESSFULLY FOR bolg-agent!"
echo "========================================================================="
