/**
 * Content Intelligence Decision Engine
 * Combines ML models + AI evaluations to rank content opportunities
 */

class DecisionEngine {
  /**
   * Calculates composite TOPIC_PRIORITY_SCORE (0-100)
   * Formula weights:
   * - 30% ML Trend Score
   * - 25% ML Relevance Score (converted to 0-100)
   * - 20% SEO Opportunity Score
   * - 15% Predicted Performance Score
   * - 10% Historical Category Multiplier
   */
  calculateTopicPriority(trendScore, relevanceProb, seoOpportunity, predictedPerf, categoryHistMultiplier = 1.0) {
    const normTrend = Math.max(0, Math.min(100, trendScore || 70));
    const normRelevance = Math.max(0, Math.min(100, (relevanceProb || 0.8) * 100));
    const normSeo = Math.max(0, Math.min(100, seoOpportunity || 80));
    const normPerf = Math.max(0, Math.min(100, predictedPerf || 75));

    const rawScore = (
      (normTrend * 0.30) +
      (normRelevance * 0.25) +
      (normSeo * 0.20) +
      (normPerf * 0.15) +
      (Math.min(100, categoryHistMultiplier * 80) * 0.10)
    );

    const priorityScore = Math.round(Math.max(10, Math.min(99, rawScore)));

    let recommendationAction = 'Monitor';
    let urgency = 'Medium';

    if (priorityScore >= 85) {
      recommendationAction = 'Generate Immediately (High Opportunity)';
      urgency = 'Immediate';
    } else if (priorityScore >= 70) {
      recommendationAction = 'Queue for Weekly Pipeline';
      urgency = 'High';
    } else if (priorityScore >= 55) {
      recommendationAction = 'Secondary Draft Candidate';
      urgency = 'Medium';
    } else {
      recommendationAction = 'Deprioritize / Niche Mismatch';
      urgency = 'Low';
    }

    const explanation = `Priority score of ${priorityScore}/100 is driven by strong trend velocity (${normTrend}/100), high audience relevance (${normRelevance.toFixed(0)}%), and solid organic search upside (${normSeo}/100).`;

    return {
      topicPriorityScore: priorityScore,
      recommendationAction,
      urgency,
      explanation,
      breakdown: {
        trendWeight: Math.round(normTrend * 0.30),
        relevanceWeight: Math.round(normRelevance * 0.25),
        seoWeight: Math.round(normSeo * 0.20),
        performanceWeight: Math.round(normPerf * 0.15),
        historicalCategoryBonus: Math.round(Math.min(100, categoryHistMultiplier * 80) * 0.10)
      }
    };
  }

  /**
   * Final decision gate before publishing
   */
  evaluatePublishingReadiness(qualityScore, duplicateRisk, seoScore, predictedPerformance) {
    const isQualityPassed = qualityScore >= 75;
    const isDuplicateSafe = duplicateRisk < 0.85;
    const isSeoOptimized = seoScore >= 75;

    const canAutoPublish = isQualityPassed && isDuplicateSafe && isSeoOptimized;

    return {
      canAutoPublish,
      qualityScore,
      duplicateRisk,
      seoScore,
      predictedPerformance,
      verdict: canAutoPublish
        ? 'APPROVED_FOR_PUBLISHING'
        : 'FLAGGED_FOR_HUMAN_REVIEW',
      reasons: [
        isQualityPassed ? 'Quality metrics meet standards' : 'Quality score below 75 threshold',
        isDuplicateSafe ? 'No duplicate content detected' : `High duplicate risk (${(duplicateRisk * 100).toFixed(1)}%)`,
        isSeoOptimized ? 'SEO optimization verified' : 'SEO score needs improvement'
      ]
    };
  }
}

module.exports = new DecisionEngine();
