 
function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function tokenize(text = "") {
  return normalizeText(text)
    .split(/\s+/)
    .filter(word => word.length >= 2);
}


/**
 * Calculate keyword relevance between
 * search queries and product metadata/document.
 */
function keywordScore(product, searchQueries) {

  const p = product.metadata || {};

  const searchableText = normalizeText(`
    ${p.name || ""}
    ${p.name_hi || ""}
    ${p.short_description || ""}
    ${p.short_description_hi || ""}
    ${p.emotional_tags || ""}
    ${product.document || ""}
  `);

  const productTokens = new Set(tokenize(searchableText));

  let score = 0;

  for (const query of searchQueries) {

    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) continue;

    // Exact phrase match
    if (searchableText.includes(normalizedQuery)) {
      score += 5;
    }

    // Individual keyword match
    const queryTokens = tokenize(query);

    for (const token of queryTokens) {

      if (productTokens.has(token)) {
        score += 1;
      }

    }
  }

  return score;
}


/**
 * Add semantic ranking from Chroma results.
 *
 * Lower Chroma distance = better result.
 *
 * We convert rank into a reciprocal score.
 */
function semanticRankScore(product) {

  if (!product.semanticRanks || product.semanticRanks.length === 0) {
    return 0;
  }

  let score = 0;

  for (const rank of product.semanticRanks) {

    // rank 0 = first result
    score += 1 / (rank + 1);
  }

  return score;
}


/**
 * Normalize values between 0 and 1.
 */
function normalizeScores(products, field) {

  const values = products.map(p => p[field]);

  const max = Math.max(...values);
  const min = Math.min(...values);

  if (max === min) {

    products.forEach(p => {
      p[`${field}Normalized`] = max > 0 ? 1 : 0;
    });

    return;
  }

  products.forEach(p => {

    p[`${field}Normalized`] =
      (p[field] - min) / (max - min);

  });
}


/**
 * Hybrid Search + Reranking
 */
function rerankResults(products, searchQueries) {

  for (const product of products) {

    product.keywordScore =
      keywordScore(product, searchQueries);

    product.semanticScore =
      semanticRankScore(product);

  }

  // Normalize both scores
  normalizeScores(products, "keywordScore");
  normalizeScores(products, "semanticScore");


  /**
   * Final score
   *
   * Semantic = 60%
   * Keyword  = 40%
   */
  for (const product of products) {

    product.finalScore =
      (product.semanticScoreNormalized * 0.60) +
      (product.keywordScoreNormalized * 0.40);

  }


  // Highest score first
  products.sort(
    (a, b) => b.finalScore - a.finalScore
  );

  return products;
}


module.exports = {
  rerankResults
};