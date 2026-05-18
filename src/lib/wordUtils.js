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
    return { valid: false, message: 'Please enter a word' };
  }

  if (word.length > 15) {
    return { valid: false, message: 'Only English letters, max 15 characters.' };
  }

  if (!/^[A-Za-z]+$/.test(word)) {
    return { valid: false, message: 'Only English letters, max 15 characters.' };
  }

  return { valid: true };
}
