const stopWords = new Set([
  'and', 'the', 'with', 'for', 'from', 'that', 'this', 'your', 'you',
  'are', 'our', 'will', 'have', 'has', 'into', 'using', 'their'
]);

function words(value) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
  );
}

export function scoreJob(job, resumeText) {
  if (!resumeText?.trim()) return null;
  const resumeWords = words(resumeText);
  const jobWords = words(`${job.title} ${job.description || ''}`);
  const matches = [...jobWords].filter((word) => resumeWords.has(word));
  const score = Math.min(98, Math.max(5, Math.round((matches.length / Math.max(jobWords.size, 1)) * 100)));
  return { score, matchedKeywords: matches.slice(0, 8) };
}
