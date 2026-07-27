"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsSnapshot } from "@/types/domain";

const STATUS_COLORS: Record<string, string> = {
  pending: "#79B5EC",
  scheduled: "#24AE7C",
  completed: "#24AE7C",
  cancelled: "#F37877",
  no_show: "#F24E43",
  rescheduled: "#ABB8C4",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AnalyticsChartsProps = {
  data: AnalyticsSnapshot;
};

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const doctorData = data.byDoctor.slice(0, 8).map((d) => ({
    name: d.doctor.replace(/^Dr\.\s*/i, ""),
    total: d.count,
    scheduled: d.scheduled,
  }));

  const dayData = data.byDay.map((d) => ({
    date: d.date.slice(5),
    appointments: d.count,
    cancelled: d.cancelled,
  }));

  const statusData = data.byStatus.map((s) => ({
    name: s.status.replace("_", " "),
    value: s.count,
    status: s.status,
  }));

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: data.totals.appointments },
          { label: "Scheduled", value: data.totals.scheduled },
          { label: "Pending", value: data.totals.pending },
          { label: "Cancelled", value: data.totals.cancelled },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-32-bold text-green-500">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid w-full gap-4 text-14-regular text-dark-700 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Completion rate</CardDescription>
            <CardTitle>
              {(data.completionRate * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cancellation rate</CardDescription>
            <CardTitle>
              {(data.cancellationRate * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg lead time</CardDescription>
            <CardTitle>
              {data.averageLeadTimeHours.toFixed(1)} hrs
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Peak day / hour</CardDescription>
            <CardTitle>
              {DAY_NAMES[data.peakDayOfWeek] ?? "—"} / {data.busiestHour}:00
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid w-full gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointments by day</CardTitle>
            <CardDescription>
              Last {data.rangeDays} days · generated{" "}
              {new Date(data.generatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {dayData.length === 0 ? (
              <p className="text-14-regular text-dark-600">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dayData}>
                  <CartesianGrid stroke="#363A3D" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#76828D" fontSize={12} />
                  <YAxis stroke="#76828D" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1D21",
                      border: "1px solid #363A3D",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#24AE7C"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#F37877"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By doctor</CardTitle>
            <CardDescription>Volume and scheduled count</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {doctorData.length === 0 ? (
              <p className="text-14-regular text-dark-600">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid stroke="#363A3D" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#76828D" fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#76828D"
                    fontSize={11}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1D21",
                      border: "1px solid #363A3D",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#79B5EC" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="scheduled" fill="#24AE7C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>Share of appointments by status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {statusData.length === 0 ? (
              <p className="text-14-regular text-dark-600">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? "#ABB8C4"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1A1D21",
                      border: "1px solid #363A3D",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
