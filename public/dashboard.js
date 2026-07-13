(function () {
  const dataEl = document.getElementById("chart-data");
  if (!dataEl || typeof Chart === "undefined") {
    return;
  }

  let payload;
  try {
    payload = JSON.parse(dataEl.textContent || "{}");
  } catch {
    return;
  }

  const labels = (payload.labels || []).map(function (ms) {
    return new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  const gridColor = "rgba(232, 240, 234, 0.08)";
  const tickColor = "#9aada2";

  const sharedOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: tickColor,
          font: { family: "'IBM Plex Mono', monospace", size: 11 },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: tickColor,
          maxRotation: 0,
          autoSkipPadding: 16,
          font: { family: "'IBM Plex Mono', monospace", size: 10 },
        },
        grid: { color: gridColor },
      },
      y: {
        ticks: {
          color: tickColor,
          font: { family: "'IBM Plex Mono', monospace", size: 10 },
        },
        grid: { color: gridColor },
      },
    },
  };

  const powerCanvas = document.getElementById("power-chart");
  if (powerCanvas) {
    new Chart(powerCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "CPU package",
            data: payload.power?.cpu_package_w || [],
            borderColor: "#c8f560",
            backgroundColor: "transparent",
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Arc card",
            data: payload.power?.arc_card_w || [],
            borderColor: "#5ec8ff",
            backgroundColor: "transparent",
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "AMD iGPU",
            data: payload.power?.amd_igpu_w || [],
            borderColor: "#ff8f6b",
            backgroundColor: "transparent",
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: sharedOptions,
    });
  }

  const tempCanvas = document.getElementById("temp-chart");
  if (tempCanvas) {
    new Chart(tempCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "RAM 0",
            data: payload.temps?.ram0_temp_c || [],
            borderColor: "#c8f560",
            backgroundColor: "transparent",
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "RAM 1",
            data: payload.temps?.ram1_temp_c || [],
            borderColor: "#5ec8ff",
            backgroundColor: "transparent",
            tension: 0.25,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: sharedOptions,
    });
  }
})();
