import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

const colorList = [
  "#ff2d55",
  "#ff3b30",
  "#ff4fd8",
  "#ff66b3",
  "#ff1493",
  "#ff6b00",
  "#ff9500",
  "#ffcc00",
  "#ff7a00",
  "#ff5e57"
];

function createHeartMaskImage(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const points = [];

  for (let t = 0; t < Math.PI * 2; t += 0.01) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({ x, y });
  }

  const bounds = points.reduce((acc, point) => ({
    minX: Math.min(acc.minX, point.x),
    maxX: Math.max(acc.maxX, point.x),
    minY: Math.min(acc.minY, point.y),
    maxY: Math.max(acc.maxY, point.y)
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  });

  const heartWidth = bounds.maxX - bounds.minX;
  const heartHeight = bounds.maxY - bounds.minY;
  const scale = Math.min(width * 0.96 / heartWidth, height * 0.96 / heartHeight);
  const offsetX = (width - heartWidth * scale) / 2 - bounds.minX * scale;
  const offsetY = (height - heartHeight * scale) / 2 - bounds.minY * scale;

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();

  points.forEach((point, index) => {
    const drawX = offsetX + point.x * scale;
    const drawY = offsetY + point.y * scale;

    if (index === 0) {
      ctx.moveTo(drawX, drawY);
    } else {
      ctx.lineTo(drawX, drawY);
    }
  });

  ctx.closePath();
  ctx.fillStyle = '#000';
  ctx.fill();

  return canvas;
}

function HeartWordCloud({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const maskImageRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);

      const w = chartRef.current.clientWidth || 800;
      const h = chartRef.current.clientHeight || 600;
      maskImageRef.current = createHeartMaskImage(w, h);

      const handleResize = () => {
        chartInstance.current?.resize();
        if (chartRef.current) {
          const w = chartRef.current.clientWidth;
          const h = chartRef.current.clientHeight;
          maskImageRef.current = createHeartMaskImage(w, h);
          if (chartInstance.current && data && data.length > 0) {
            updateChart(data);
          }
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, []);

  function updateChart(chartData) {
    if (!chartInstance.current || !maskImageRef.current) return;

    const option = {
      series: [{
        type: 'wordCloud',
        maskImage: maskImageRef.current,
        left: 'center',
        top: 'center',
        width: '96%',
        height: '96%',
        sizeRange: [14, 56],
        rotationRange: [-10, 10],
        rotationStep: 15,
        gridSize: 4,
        padding: 3,
        drawOutOfBound: false,
        shrinkToFit: true,
        keepAspect: true,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return colorList[Math.floor(Math.random() * colorList.length)];
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: '#333'
          }
        },
        data: chartData
      }]
    };

    chartInstance.current.setOption(option, true);
  }

  useEffect(() => {
    if (chartInstance.current && data && data.length > 0) {
      updateChart(data);
    } else if (chartInstance.current) {
      chartInstance.current.clear();
    }
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px'
      }}
    />
  );
}

export default HeartWordCloud;
