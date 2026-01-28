/**
 * Similarity Detection Utilities for Issue Management
 * Implements text similarity algorithms and issue comparison logic
 */

interface IssueSimilarity {
  issueId: string;
  title: string;
  similarityScore: number;
  category: string;
  hostelId: string;
  blockId: string;
  createdAt: Date;
}

/**
 * Calculate text similarity score (0-1) using word overlap
 * Higher score indicates more similar text
 */
export function calculateTextSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 && words2.length === 0) return 1;
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(w => set2.has(w)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate overall similarity score between two issues
 * Combines title similarity, category match, and location match
 */
export function calculateIssueSimilarity(
  title1: string,
  title2: string,
  category1: string,
  category2: string,
  hostelId1: string,
  hostelId2: string,
  blockId1: string,
  blockId2: string
): number {
  // Text similarity (60% weight)
  const textSimilarity = calculateTextSimilarity(title1, title2);
  const textScore = textSimilarity * 0.6;
  
  // Category match (20% weight)
  const categoryScore = category1 === category2 ? 0.2 : 0;
  
  // Location match (20% weight)
  const locationScore = (hostelId1 === hostelId2 && blockId1 === blockId2) ? 0.2 : 0;
  
  return textScore + categoryScore + locationScore;
}

/**
 * Sort issues by similarity score in descending order
 */
export function sortBySimilarity(issues: IssueSimilarity[]): IssueSimilarity[] {
  return issues.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Filter issues by similarity threshold
 */
export function filterBySimilarity(issues: IssueSimilarity[], threshold: number = 0.7): IssueSimilarity[] {
  return issues.filter(issue => issue.similarityScore >= threshold);
}

/**
 * Extract keywords from text for better matching
 */
export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
}