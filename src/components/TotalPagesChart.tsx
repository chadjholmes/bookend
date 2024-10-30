// src/components/TotalPagesChart.tsx

import React from 'react';
import { VictoryChart, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer, VictoryLine } from 'victory';
import { View, Dimensions } from 'react-native';
import { ReadingSession } from '../models/ReadingSession';
import { getWeekNumber } from '../utils/dateUtils';

interface TotalPagesChartProps {
  sessions: ReadingSession[];
}

interface ChartDataPoint {
  x: string;
  y: number;
}

const TotalPagesChart: React.FC<TotalPagesChartProps> = ({ sessions }) => {
  // Aggregate pages read per day
  const aggregatedData: ChartDataPoint[] = sessions.reduce((acc: ChartDataPoint[], session) => {
    const date = new Date(session.date).toLocaleDateString();
    const existing = acc.find(item => item.x === date);
    if (existing) {
      existing.y += session.pagesRead;
    } else {
      acc.push({ x: date, y: session.pagesRead });
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
            labels={({ datum }) => `${datum.x}\n${datum.y} pages`}
            labelComponent={<VictoryTooltip constrainToVisibleArea />}
          />
        }
      >
        <VictoryAxis
          tickFormat={(t) => `${t.slice(0, 5)}`}
          tickCount={6}
          style={{
            tickLabels: { angle: -45, fontSize: 10, padding: 15 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(x) => `${x}`}
        />
        <VictoryLine
          data={aggregatedData}
          style={{
            data: { stroke: "#c43a31" },
          }}
        />
      </VictoryChart>
    </View>
  );
};

export default TotalPagesChart;