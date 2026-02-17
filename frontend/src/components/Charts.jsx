import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const Charts = ({ trend, days = 7 }) => {
  return (
    <div className="grid gap-6 rounded-3xl theme-surface p-6">
      <div>
        <h3 className="text-lg font-semibold text-ink">Stock movement trend</h3>
        <p className="text-sm text-muted">{days}-day inbound and outbound flow</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                borderRadius: 12,
                border: '1px solid var(--border)'
              }}
              labelStyle={{ color: 'var(--text)' }}
            />
            <Legend />
            <Bar dataKey="in" fill="var(--primary)" name="Stock In" radius={[8, 8, 0, 0]} />
            <Bar dataKey="out" fill="var(--accent)" name="Stock Out" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Charts
