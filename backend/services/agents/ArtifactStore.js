/**
 * Immutable Artifact Store
 * 
 * Enforces strict immutability for inter-agent communication:
 * - Every agent output is saved as an immutable, versioned artifact with a unique ID and content hash.
 * - Downstream agents receive strictly frozen (read-only) snapshots.
 * - Modifications require creating a new artifact version (e.g., v1 -> v2) rather than mutating in place.
 */

const crypto = require('crypto');

function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

class ArtifactStore {
  constructor() {
    this.artifacts = new Map();
    this.jobIndex = new Map();
  }

  /**
   * Stores a new immutable artifact
   */
  createArtifact({ jobId, agentId, artifactType, data, schemaVersion = '1.0', parentArtifactId = null }) {
    if (!jobId || !agentId || !artifactType) {
      throw new Error('jobId, agentId, and artifactType are required to create an artifact.');
    }

    let version = 1;
    if (parentArtifactId && this.artifacts.has(parentArtifactId)) {
      const parent = this.artifacts.get(parentArtifactId);
      version = (parent.version || 1) + 1;
    }

    const uniqueSuffix = crypto.randomBytes(3).toString('hex');
    const artifactId = `art_${agentId.toLowerCase().replace(/agent$/, '')}_v${version}_${uniqueSuffix}`;

    const rawSerialized = JSON.stringify(data || {});
    const contentHash = crypto.createHash('sha256').update(rawSerialized).digest('hex');

    // Create deep frozen immutable snapshot
    const frozenData = deepFreeze(JSON.parse(rawSerialized));

    const artifact = {
      id: artifactId,
      jobId,
      agentId,
      artifactType,
      version: `v${version}`,
      schemaVersion,
      parentArtifactId,
      contentHash,
      createdAt: new Date().toISOString(),
      data: frozenData
    };

    Object.freeze(artifact);

    this.artifacts.set(artifactId, artifact);

    if (!this.jobIndex.has(jobId)) {
      this.jobIndex.set(jobId, []);
    }
    this.jobIndex.get(jobId).push(artifactId);

    return artifact;
  }

  /**
   * Retrieves an immutable artifact by ID
   */
  getArtifact(artifactId) {
    if (!this.artifacts.has(artifactId)) {
      return null;
    }
    return this.artifacts.get(artifactId);
  }

  /**
   * Retrieves all immutable artifacts for a job
   */
  getJobArtifacts(jobId) {
    const ids = this.jobIndex.get(jobId) || [];
    return ids.map(id => this.artifacts.get(id)).filter(Boolean);
  }

  /**
   * Creates a new version of an existing artifact
   */
  createVersion(parentArtifactId, newAgentId, newData, artifactType = null) {
    const parent = this.getArtifact(parentArtifactId);
    if (!parent) {
      throw new Error(`Parent artifact ${parentArtifactId} not found.`);
    }

    return this.createArtifact({
      jobId: parent.jobId,
      agentId: newAgentId,
      artifactType: artifactType || parent.artifactType,
      data: newData,
      parentArtifactId: parent.id,
      schemaVersion: parent.schemaVersion
    });
  }

  /**
   * Returns store diagnostic statistics
   */
  getStats() {
    return {
      totalArtifacts: this.artifacts.size,
      totalJobs: this.jobIndex.size
    };
  }
}

module.exports = new ArtifactStore();
