const axios = require('axios');
const path = require('path');
const fs = require('fs');

class GCPStorageService {
  constructor(projectId = 'bolg-agent', bucketName = 'bolg-agent-media') {
    this.projectId = projectId || process.env.GOOGLE_PROJECT_ID || 'bolg-agent';
    this.bucketName = bucketName || process.env.GCS_BUCKET_NAME || 'bolg-agent-media';
    this.region = process.env.GOOGLE_CLOUD_LOCATION || 'asia-southeast1';
  }

  async getAccessToken() {
    const VertexAIService = require('../ai/vertexAIService');
    const vertex = new VertexAIService(this.projectId);
    return await vertex.getAccessToken();
  }

  /**
   * Check if GCS bucket exists or retrieve bucket metadata
   */
  async getBucketMetadata() {
    const token = await this.getAccessToken();
    if (!token) return { exists: false, error: 'No GCP access token' };

    try {
      const res = await axios.get(
        `https://storage.googleapis.com/storage/v1/b/${this.bucketName}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Goog-User-Project': this.projectId
          },
          timeout: 8000
        }
      );
      return { exists: true, data: res.data };
    } catch (err) {
      if (err.response?.status === 404) {
        return { exists: false, message: `Bucket ${this.bucketName} not found` };
      }
      return { exists: false, error: err.response?.data?.error?.message || err.message };
    }
  }

  /**
   * Upload an asset or blog media to Google Cloud Storage
   */
  async uploadFile(filename, contentBuffer, contentType = 'image/jpeg') {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Google Cloud access token not available for GCS upload');
    }

    try {
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${this.bucketName}/o?uploadType=media&name=${encodeURIComponent(filename)}`;
      const res = await axios.post(uploadUrl, contentBuffer, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': contentType,
          'X-Goog-User-Project': this.projectId
        },
        timeout: 30000
      });

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
      return {
        success: true,
        filename,
        publicUrl,
        size: res.data.size,
        bucket: this.bucketName,
        md5Hash: res.data.md5Hash
      };
    } catch (err) {
      console.warn('[GCPStorageService] Upload note:', err.response?.data?.error?.message || err.message);
      return {
        success: false,
        error: err.response?.data?.error?.message || err.message,
        fallbackLocalUrl: `/uploads/${filename}`
      };
    }
  }
}

module.exports = new GCPStorageService();
