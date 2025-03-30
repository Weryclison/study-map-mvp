
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStudy, StudyMethod } from "@/contexts/StudyContext";

interface ChartProps {
  timeframe: "daily" | "weekly" | "monthly";
}

const methodColors: Record<StudyMethod, string> = {
  pomodoro: "#3B82F6",
  anki: "#10B981",
  rsvp: "#F59E0B",
  challenge: "#EC4899",
  null: "#cbd5e1",
};

const ProgressChart: React.FC<ChartProps> = ({ timeframe }) => {
  const { studySessions } = useStudy();

  const formatData = () => {
    const today = new Date();
    let startDate = new Date();
    let labelFormat: Intl.DateTimeFormatOptions;

    if (timeframe === "daily") {
      startDate.setDate(today.getDate() - 6); // Last 7 days
      labelFormat = { weekday: "short" };
    } else if (timeframe === "weekly") {
      startDate.setDate(today.getDate() - 28); // Last 4 weeks
      labelFormat = { month: "short", day: "numeric" };
    } else {
      startDate.setMonth(today.getMonth() - 5); // Last 6 months
      labelFormat = { month: "short" };
    }

    const data: Record<string, any>[] = [];
    const current = new Date(startDate);

    while (current <= today) {
      const label = new Intl.DateTimeFormat("pt-BR", labelFormat).format(current);
      const dayData: Record<string, any> = { name: label };

      // Initialize with 0 minutes for all methods
      dayData.pomodoro = 0;
      dayData.anki = 0;
      dayData.rsvp = 0;
      dayData.challenge = 0;

      // Filter sessions for this day
      const relevantSessions = studySessions.filter((session) => {
        const sessionDate = new Date(session.date);
        
        if (timeframe === "daily") {
          return sessionDate.toDateString() === current.toDateString();
        } else if (timeframe === "weekly") {
          const weekStart = new Date(current);
          const weekEnd = new Date(current);
          weekEnd.setDate(weekStart.getDate() + 6);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        } else {
          return sessionDate.getMonth() === current.getMonth() && 
                 sessionDate.getFullYear() === current.getFullYear();
        }
      });

      // Sum up the minutes for each method
      relevantSessions.forEach((session) => {
        if (session.method) {
          dayData[session.method] = (dayData[session.method] || 0) + session.duration;
        }
      });

      data.push(dayData);

      // Increment the date based on timeframe
      if (timeframe === "daily") {
        current.setDate(current.getDate() + 1);
      } else if (timeframe === "weekly") {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return data;
  };

  const chartData = formatData();

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: "Minutos", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="pomodoro" name="Pomodoro" stackId="a" fill={methodColors.pomodoro} />
          <Bar dataKey="anki" name="Anki" stackId="a" fill={methodColors.anki} />
          <Bar dataKey="rsvp" name="RSVP" stackId="a" fill={methodColors.rsvp} />
          <Bar dataKey="challenge" name="Desafio" stackId="a" fill={methodColors.challenge} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
