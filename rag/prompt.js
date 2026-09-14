/*function buildContext(results) {
  return results
    .map((item, index) => {
      return `
SOURCE ${index + 1}

Mind Heal No: ${item.metadata?.mind_heal_no || ""}
Product Name: ${item.metadata?.name || ""}

${item.document || ""}
`;
    })
    .join("\n-------------------------\n");
}

module.exports = {
  buildContext,
}; 

*/
function buildContext(results) {
  return results
    .map((item, index) => {
      const m = item.metadata || {};

      return `
SOURCE ${index + 1}

Mind Heal No: ${m.mind_heal_no || ""}
Product Name: ${m.name || ""}
Hindi Name: ${m.name_hi || ""}

Short Description:
${m.short_description || ""}

Hindi Short Description:
${m.short_description_hi || ""}

Emotional Tags:
${m.emotional_tags || ""}
`;
    })
    .join("\n-------------------------\n");
}

module.exports = {
  buildContext,
};