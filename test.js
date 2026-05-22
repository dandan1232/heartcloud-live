const words = [
  "爱", "心", "未来", "机器人", "快乐", "梦想", "希望", "和平", "喜悦", "星星",
  "太阳", "月亮", "天空", "大海", "树木", "花朵", "音乐", "艺术", "代码", "数据",
  "云朵", "世界", "生活", "灵魂", "火焰", "微风", "雨水", "白雪", "光芒", "时间",
  "空间", "思想", "力量", "优雅", "信任", "勇气", "智慧", "真理", "美丽", "奇妙",
  "惊喜", "微笑", "欢笑", "舞蹈", "歌唱", "玩耍", "建造", "创造", "课堂", "成长"
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
  console.log("开始测试，提交50个不同的中文词语...\n");

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
  console.log(`成功: ${successCount} 个中文词语`);
  console.log(`失败: ${failCount} 个中文词语`);
  console.log("\n请查看大屏页面 http://localhost:5173/screen 的词云效果。");
}

runTest();
