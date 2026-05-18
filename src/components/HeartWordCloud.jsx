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

  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.45;

  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(centerX, centerY + size * 0.7);

  // 左半边
  ctx.bezierCurveTo(
    centerX - size * 0.7, centerY + size * 0.4,
    centerX - size * 0.7, centerY - topCurveHeight,
    centerX, centerY - topCurveHeight
  );

  // 右半边
  ctx.bezierCurveTo(
    centerX + size * 0.7, centerY - topCurveHeight,
    centerX + size * 0.7, centerY + size * 0.4,
    centerX, centerY + size * 0.7
  );

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
        width: '90%',
        height: '90%',
        sizeRange: [20, 90],
        rotationRange: [-15, 15],
        rotationStep: 15,
        gridSize: 8,
        drawOutOfBound: false,
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
