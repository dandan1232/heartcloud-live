const words = [
  "Love", "Heart", "AI", "Future", "Robot", "Happy", "Dream", "Hope", "Peace", "Joy",
  "Star", "Sun", "Moon", "Sky", "Sea", "Tree", "Flower", "Music", "Art", "Code",
  "Data", "Cloud", "World", "Life", "Soul", "Fire", "Wind", "Rain", "Snow", "Light",
  "Time", "Space", "Mind", "Power", "Grace", "Faith", "Trust", "Courage", "Wisdom", "Truth",
  "Beauty", "Magic", "Wonder", "Smile", "Laugh", "Dance", "Sing", "Play", "Build", "Create"
];

async function submitWord(word) {
  const response = await fetch('http://localhost:3001/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word })
  });
  return response.json();
}

async function runTest() {
  console.log("开始测试，提交50个不同的单词...\n");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    try {
      const result = await submitWord(word);
      if (result.success) {
        successCount++;
        console.log(`[${i + 1}/50] ✓ ${word}`);
      } else {
        failCount++;
        console.log(`[${i + 1}/50] ✗ ${word} - 失败`);
      }
    } catch (error) {
      failCount++;
      console.log(`[${i + 1}/50] ✗ ${word} - 错误: ${error.message}`);
    }
  }

  console.log("\n测试完成！");
  console.log(`成功: ${successCount} 个单词`);
  console.log(`失败: ${failCount} 个单词`);
  console.log("\n请查看大屏页面 http://localhost:5173/screen 的词云效果。");
}

runTest();
