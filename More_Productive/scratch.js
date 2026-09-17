import { timeToMinutes } from './src/utils/storage.js';

function computeTaskLayout(tasks, hourHeight = 60) {
  if (!tasks || tasks.length === 0) return [];

  const parsed = tasks.map(task => {
    const startM = timeToMinutes(task.startTime);
    let endM = timeToMinutes(task.endTime);
    let isOvernight = false;

    if (endM <= startM) {
      isOvernight = true;
      endM = 24 * 60;
    }

    const durationMinutes = isOvernight
      ? (24 * 60 - startM) + timeToMinutes(task.endTime)
      : endM - startM;

    const top = (startM / 60) * hourHeight;
    const rawHeight = ((endM - startM) / 60) * hourHeight;
    const height = Math.max(28, rawHeight);

    return {
      task,
      startM,
      endM,
      isOvernight,
      durationMinutes,
      top,
      height,
      visualEndM: startM + (height / hourHeight) * 60
    };
  });

  parsed.sort((a, b) => a.startM - b.startM || b.durationMinutes - a.durationMinutes);

  const clusters = [];
  let currentCluster = [];
  let clusterEndM = 0;

  parsed.forEach(item => {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEndM = Math.max(item.endM, item.visualEndM);
    } else if (item.startM < clusterEndM) {
      currentCluster.push(item);
      clusterEndM = Math.max(clusterEndM, item.endM, item.visualEndM);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEndM = Math.max(item.endM, item.visualEndM);
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const result = [];
  clusters.forEach(cluster => {
    const columns = [];
    cluster.forEach(item => {
      let colIndex = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i] <= item.startM) {
          colIndex = i;
          columns[i] = Math.max(item.endM, item.visualEndM);
          break;
        }
      }
      if (colIndex === -1) {
        colIndex = columns.length;
        columns.push(Math.max(item.endM, item.visualEndM));
      }
      item.col = colIndex;
    });

    const totalCols = columns.length;
    cluster.forEach(item => {
      const widthPercent = 100 / totalCols;
      const leftPercent = item.col * widthPercent;

      result.push({
        id: item.task.id,
        startM: item.startM,
        endM: item.endM,
        col: item.col,
        totalCols,
        leftPercent,
        widthPercent
      });
    });
  });

  return result;
}

const tasks = [
  { id: '101', startTime: '09:00', endTime: '10:00' },
  { id: '102', startTime: '09:00', endTime: '10:00' }
];

console.log(computeTaskLayout(tasks));
