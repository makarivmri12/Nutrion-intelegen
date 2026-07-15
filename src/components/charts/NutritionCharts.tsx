import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { FoodLogEntry, NutrientTargets } from "../../types";

interface NutritionChartsProps {
  logs: FoodLogEntry[];
  targets: NutrientTargets;
}

// Color coding threshold generator
const getAdequacyColor = (percent: number): string => {
  if (percent >= 90 && percent <= 110) return "#10b981"; // Green (adequate)
  if (percent >= 70 && percent < 90) return "#f59e0b"; // Yellow (mild deficit)
  if (percent > 110 && percent <= 150) return "#f59e0b"; // Yellow (mild surplus)
  return "#ef4444"; // Red (<70% severe deficit or >150% excessive surplus)
};

export default function NutritionCharts({ logs, targets }: NutritionChartsProps) {
  // Aggregate totals
  const totals = useMemo(() => {
    const sum = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, iron: 0, sodium: 0, vitaminC: 0, vitaminA: 0 };
    logs.forEach((log) => {
      sum.calories += log.calories || 0;
      sum.protein += log.protein || 0;
      sum.carbs += log.carbs || 0;
      sum.fat += log.fat || 0;
      sum.fiber += log.fiber || 0;
      sum.calcium += log.calcium || 0;
      sum.iron += log.iron || 0;
      sum.sodium += log.sodium || 0;
      sum.vitaminC += log.vitaminC || 0;
      sum.vitaminA += log.vitaminA || 0;
    });
    return sum;
  }, [logs]);

  // A. % Fulfillment data
  const fulfillmentData = useMemo(() => {
    const nutrients = [
      { name: "Energy", current: totals.calories, target: targets.calories || 2000, unit: "kcal" },
      { name: "Protein", current: totals.protein, target: targets.protein || 60, unit: "g" },
      { name: "Carbs", current: totals.carbs, target: targets.carbs || 250, unit: "g" },
      { name: "Fat", current: totals.fat, target: targets.fat || 65, unit: "g" },
      { name: "Fiber", current: totals.fiber, target: targets.fiber || 25, unit: "g" },
      { name: "Calcium", current: totals.calcium, target: targets.calcium || 1000, unit: "mg" },
      { name: "Iron", current: totals.iron, target: targets.iron || 15, unit: "mg" },
      { name: "Vitamin C", current: totals.vitaminC, target: targets.vitaminC || 90, unit: "mg" },
      { name: "Vitamin A", current: totals.vitaminA, target: targets.vitaminA || 700, unit: "mcg" }
    ];

    return nutrients.map((n) => {
      const percentage = n.target > 0 ? parseFloat(((n.current / n.target) * 100).toFixed(1)) : 0;
      return {
        nutrient: n.name,
        percentage: Math.min(percentage, 180), // cap visually at 180% to keep grid readable
        actualPercentage: percentage,
        currentVal: parseFloat(n.current.toFixed(1)),
        targetVal: n.target,
        unit: n.unit,
        color: getAdequacyColor(percentage)
      };
    });
  }, [totals, targets]);

  // B. Food Group Distribution (Pie Chart based on calories)
  const foodGroupData = useMemo(() => {
    if (logs.length === 0) return [];
    
    const groups: Record<string, number> = {};
    logs.forEach((log) => {
      const cat = log.category || "Unassigned";
      groups[cat] = (groups[cat] || 0) + (log.calories || 0);
    });

    const totalCalories = Object.values(groups).reduce((sum, val) => sum + val, 0);
    
    const palette = ["#00d4ff", "#7c3aed", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#eab308", "#ef4444"];

    return Object.entries(groups)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: totalCalories > 0 ? parseFloat(((value / totalCalories) * 100).toFixed(1)) : 0,
        fill: palette[index % palette.length]
      }))
      .filter(item => item.value > 0);
  }, [logs]);

  // C. Macro Distribution (Radar Chart)
  // To keep radar chart scale balanced, we compare normalized percentages (Intake vs Target)
  const radarData = useMemo(() => {
    const macros = [
      { subject: "Calories", intake: totals.calories, target: targets.calories || 2000 },
      { subject: "Protein", intake: totals.protein * 4, target: (targets.protein || 60) * 4 }, // represented in kcal values
      { subject: "Carbs", intake: totals.carbs * 4, target: (targets.carbs || 250) * 4 },     // represented in kcal values
      { subject: "Fats", intake: totals.fat * 9, target: (targets.fat || 65) * 9 },           // represented in kcal values
      { subject: "Fiber", intake: totals.fiber * 10, target: (targets.fiber || 25) * 10 }     // scaled appropriately
    ];

    return macros.map((m) => {
      const intakeVal = m.target > 0 ? parseFloat(((m.intake / m.target) * 100).toFixed(1)) : 0;
      return {
        subject: m.subject,
        Intake: intakeVal,
        Target: 100 // Target is normalized to 100% boundary
      };
    });
  }, [totals, targets]);

  if (logs.length === 0) {
    return (
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-8 text-center font-mono text-zinc-500 py-16">
        📊 Tidak ada data spreadsheet hari ini. Masukkan makanan di tab **Nutrient Spreadsheet** untuk menampilkan analisis visual komprehensif.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top row: Horizontal Adequacy Bar Chart */}
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-md">
        <h3 className="text-xs font-mono font-semibold tracking-wider text-[#00d4ff] uppercase mb-4 pl-1">
          A. TARGET FULFILLMENT ADEQUACY CHART
        </h3>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={fulfillmentData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" domain={[0, 150]} stroke="#71717a" tickFormatter={(v) => `${v}%`} />
              <YAxis
                dataKey="nutrient"
                type="category"
                stroke="#d4d4d8"
                tickLine={false}
                width={85}
                style={{ fontSize: "11px", fontFamily: "monospace" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#121212", border: "1px solid #27272a", borderRadius: "6px" }}
                labelClassName="text-white font-bold font-mono text-xs"
                formatter={(value: any, name: any, props: any) => {
                  const entry = props.payload;
                  return [
                    <span className="font-mono text-xs text-zinc-300">
                      {entry.currentVal} / {entry.targetVal} {entry.unit} ({entry.actualPercentage}%)
                    </span>,
                    "Intake"
                  ];
                }}
              />
              <ReferenceLine x={100} stroke="#10b981" strokeDasharray="4 4" label={{ value: "100% Target", fill: "#10b981", position: "top", fontSize: 10 }} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {fulfillmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#10b981] rounded"></span>
            <span className="text-zinc-400">Adequate (90-110%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#f59e0b] rounded"></span>
            <span className="text-zinc-400">Marginal Gap (70-90% / 110-150%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#ef4444] rounded"></span>
            <span className="text-zinc-400">Severe Gap (&lt;70% / &gt;150%)</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Distribution & Radar Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie/Donut Chart */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <h3 className="text-xs font-mono font-semibold tracking-wider text-[#10b981] uppercase mb-4">
            B. CALORIC CONTRIBUTION BY FOOD GROUP
          </h3>

          <div className="h-[280px] w-full flex items-center justify-center">
            {foodGroupData.length === 0 ? (
              <span className="text-xs text-zinc-500 font-mono">No data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={foodGroupData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percentage }) => `${percentage.toFixed(0)}%`}
                  >
                    {foodGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#121212", border: "1px solid #27272a" }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} kcal (${props.payload.percentage}%)`,
                      name
                    ]}
                  />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-md flex flex-col justify-between">
          <h3 className="text-xs font-mono font-semibold tracking-wider text-[#7c3aed] uppercase mb-4">
            C. MACRONUTRIENT BALANCE RADAR
          </h3>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#222" />
                <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                <PolarRadiusAxis angle={30} domain={[0, 120]} stroke="#222" />
                <Radar name="Target Boundaries" dataKey="Target" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} />
                <Radar name="Intake Profile" dataKey="Intake" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: "#121212", border: "1px solid #27272a" }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
