import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const fallback = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Apr', total: 2400 },
  { name: 'May', total: 2200 },
  { name: 'Jun', total: 2600 },
]

type OverviewProps = {
  /** When set (e.g. from `/api/bootstrap` `monthlyMetrics`), shows revenue by month label. */
  chartData?: { name: string; total: number }[]
}

export function Overview({ chartData }: OverviewProps) {
  const data =
    chartData && chartData.length > 0 ? chartData : fallback

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            typeof value === 'number' ? `${value.toLocaleString()} Rwf` : String(value)
          }
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
