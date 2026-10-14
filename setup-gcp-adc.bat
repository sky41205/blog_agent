@echo off
TITLE Google Cloud ADC & Vertex AI Configuration (bolg-agent)
COLOR 0A

echo =========================================================================
echo   CONFIGURING GOOGLE CLOUD ADC ^& VERTEX AI FOR bolg-agent
echo =========================================================================
echo.

echo [1/4] Setting active project to bolg-agent...
call gcloud config set project bolg-agent

echo.
echo [2/4] Enabling Vertex AI API (aiplatform.googleapis.com)...
call gcloud services enable aiplatform.googleapis.com

echo.
echo [3/4] Authenticating Application Default Credentials (ADC)...
call gcloud auth application-default login

echo.
echo [4/4] Setting ADC quota project to bolg-agent (Credit consumption)...
call gcloud auth application-default set-quota-project bolg-agent

echo.
echo =========================================================================
echo   GOOGLE CLOUD ADC CONFIGURED SUCCESSFULLY FOR bolg-agent!
echo =========================================================================
pause
