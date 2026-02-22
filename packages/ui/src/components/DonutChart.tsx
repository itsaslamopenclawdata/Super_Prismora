import React from 'react';
import { cn } from '../utils/cn';

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: ChartData[];
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
  showPercentage?: boolean;
  centerText?: string;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 20,
  showLabels = false,
  showPercentage = false,
  centerText,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentOffset = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const segmentLength = (percentage / 100) * circumference;
    const segment = {
      ...item,
      segmentLength,
      offset: currentOffset,
      percentage,
    };
    currentOffset += segmentLength;
    return segment;
  });

  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.segmentLength}
              strokeDashoffset={-segment.offset}
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </svg>

        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-neutral-700">
              {centerText}
            </span>
          </div>
        )}
      </div>

      {showLabels && (
        <div className="ml-4 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-neutral-700">{segment.label}</span>
              {showPercentage && (
                <span className="text-sm text-neutral-500">
                  ({segment.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
