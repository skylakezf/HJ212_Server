function updateChartWindow(parsedData, hiddenPollutants) {
  const chartData = {
    labels: parsedData.labels,
    datasets: []
  };

  // 遍历污染物数据，构建每个污染物的图表数据
  Object.keys(parsedData.pollutantsData).forEach(pollutantName => {
    if (!hiddenPollutants.includes(pollutantName)) {
      const data = parsedData.pollutantsData[pollutantName];
      chartData.datasets.push({
        label: pollutantName,
        data: data.avgValues, // 使用平均值作为数据
        borderColor: getRandomColor(),
        fill: false
      });
    }
  });

  // 更新已存在的图表数据
  if (window.pollutantChartInstance) {
    window.pollutantChartInstance.data = chartData;
    window.pollutantChartInstance.update();
  } else {
    // 如果图表实例不存在，则创建一个新的实例
    const ctx = document.getElementById('pollutantChart').getContext('2d');
    window.pollutantChartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            labels: parsedData.labels
          }
        }
      }
    });
  }
}
