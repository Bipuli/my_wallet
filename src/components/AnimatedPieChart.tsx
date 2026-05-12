// import React from "react";
// import { Pie } from "react-chartjs-2";
// import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
// import { colors } from "@/lib/colors";

// Chart.register(ArcElement, Tooltip, Legend);

// const data = {
//   labels: ["Food", "Salary", "Bills", "Other"],
//   datasets: [
//     {
//       label: "Spending",
//       data: [12, 19, 3, 5],
//       backgroundColor: [
//         colors.primary,
//         colors.accent,
//         colors.secondary,
//         "#fbbf24",
//       ],
//       borderColor: ["#fff"],
//       borderWidth: 2,
//       hoverOffset: 16,
//     },
//   ],
// };

// const options = {
//   responsive: true,
//   plugins: {
//     legend: {
//       display: true,
//       position: "bottom" as const,
//       labels: {
//         color: colors.primary,
//         font: { size: 16, weight: "bold" },
//       },
//     },
//     tooltip: {
//       enabled: true,
//       backgroundColor: colors.primary,
//       titleColor: colors.accent,
//       bodyColor: colors.background,
//       borderColor: colors.accent,
//       borderWidth: 1,
//       padding: 12,
//       caretSize: 8,
//       displayColors: false,
//       animation: true,
//     },
//   },
//   animation: {
//     animateRotate: true,
//     animateScale: true,
//     duration: 1200,
//     easing: "easeInOutQuart",
//   },
// };

// export default function AnimatedPieChart() {
//   return (
//     <div className="w-full flex flex-col items-center justify-center">
//       <Pie data={data} options={options} />
//     </div>
//   );
// }
