export function calculateWordFrequency(submissions) {
  const frequencyMap = new Map();

  submissions.forEach(submission => {
    const word = submission.word;
    if (frequencyMap.has(word)) {
      frequencyMap.set(word, frequencyMap.get(word) + 1);
    } else {
      frequencyMap.set(word, 1);
    }
  });

  return Array.from(frequencyMap.entries()).map(([name, value]) => ({
    name,
    value
  }));
}

export function validateWord(word) {
  if (!word || word.length === 0) {
    return { valid: false, message: '请输入中文词语' };
  }

  if (Array.from(word).length > 15) {
    return { valid: false, message: '仅支持中文，最多15个字。' };
  }

  if (!/^\p{Script=Han}+$/u.test(word)) {
    return { valid: false, message: '仅支持中文，最多15个字。' };
  }

  return { valid: true };
}

export function sanitizeChineseInput(value) {
  return Array.from(value)
    .filter(char => /\p{Script=Han}/u.test(char))
    .slice(0, 15)
    .join('');
}
