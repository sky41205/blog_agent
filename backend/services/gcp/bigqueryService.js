const axios = require('axios');

class BigQueryService {
  constructor(projectId = 'bolg-agent', datasetId = 'bolg_agent_analytics') {
    this.projectId = projectId || process.env.GOOGLE_PROJECT_ID || 'bolg-agent';
    this.datasetId = datasetId || process.env.BIGQUERY_DATASET || 'bolg_agent_analytics';
  }

  async getAccessToken() {
    const VertexAIService = require('../ai/vertexAIService');
    const vertex = new VertexAIService(this.projectId);
    return await vertex.getAccessToken();
  }

  /**
   * List or inspect datasets in bolg-agent
   */
  async listDatasets() {
    const token = await this.getAccessToken();
    if (!token) return { success: false, error: 'No GCP access token' };

    try {
      const res = await axios.get(
        `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/datasets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 8000
        }
      );
      return {
        success: true,
        datasets: res.data.datasets || []
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error?.message || err.message
      };
    }
  }

  /**
   * Stream blog generation or analytics event into BigQuery
   */
  async streamEvent(tableId, rowData) {
    const token = await this.getAccessToken();
    if (!token) return { success: false, error: 'No GCP access token' };

    try {
      const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/datasets/${this.datasetId}/tables/${tableId}/insertAll`;
      const res = await axios.post(
        url,
        {
          kind: 'bigquery#tableDataInsertAllRequest',
          rows: [
            {
              insertId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              json: {
                ...rowData,
                timestamp: new Date().toISOString()
              }
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        success: !res.data.insertErrors,
        insertErrors: res.data.insertErrors || []
      };
    } catch (err) {
      // If dataset/table doesn't exist yet, return soft warning
      return {
        success: false,
        warning: `BigQuery streaming note: ${err.response?.data?.error?.message || err.message}`
      };
    }
  }
}

module.exports = new BigQueryService();
