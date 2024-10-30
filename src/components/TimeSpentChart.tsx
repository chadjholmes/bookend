// src/components/TimeSpentChart.tsx

import React from 'react';
import { VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryBar } from 'victory';
import { View, Dimensions } from 'react-native';
import { ReadingSession } from '../models/ReadingSession';
import { getWeekNumber } from '../utils/dateUtils';

interface TimeSpentChartProps {
  sessions: ReadingSession[];
}

interface ChartDataPoint {
  x: number;
  y: number;
}

const TimeSpentChart: React.FC<TimeSpentChartProps> = ({ sessions }) => {
  // Aggregate duration per week
  const aggregatedData: ChartDataPoint[] = sessions.reduce((acc: ChartDataPoint[], session) => {
    const week = getWeekNumber(new Date(session.date));
    const existing = acc.find(item => item.x === week);
    if (existing) {
      existing.y += session.duration;
    } else {
      acc.push({ x: week, y: session.duration });
    }
    return acc;
  }, []);

  return (
    <View>
      <VictoryChart
        theme={VictoryTheme.material}
        width={Dimensions.get('window').width - 40}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }: { datum: { x: number, y: number } }) => `Week ${datum.x}\n${datum.y} mins`}
            labelComponent={<VictoryTooltip constrainToVisibleArea />}
          />
        }
      >
        <VictoryAxis
          tickFormat={(t) => `W${t}`}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(x) => `${x} mins`}
        />
        <VictoryBar
          data={aggregatedData}
          style={{ data: { fill: "#4caf50" } }}
        />
      </VictoryChart>
    </View>
  );
};

export default TimeSpentChart;