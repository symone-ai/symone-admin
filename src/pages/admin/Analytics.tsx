import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Server,
  DollarSign,
  Activity,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const userGrowthData = [
  { date: 'Jan', users: 8200, active: 6100 },
  { date: 'Feb', users: 8900, active: 6800 },
  { date: 'Mar', users: 9800, active: 7500 },
  { date: 'Apr', users: 10500, active: 8200 },
  { date: 'May', users: 11400, active: 9000 },
  { date: 'Jun', users: 12847, active: 10200 },
];

const revenueData = [
  { date: 'Jan', mrr: 185000, arr: 2220000 },
  { date: 'Feb', mrr: 198000, arr: 2376000 },
  { date: 'Mar', mrr: 215000, arr: 2580000 },
  { date: 'Apr', mrr: 228000, arr: 2736000 },
  { date: 'May', mrr: 256000, arr: 3072000 },
  { date: 'Jun', mrr: 284500, arr: 3414000 },
];

const apiCallsData = [
  { hour: '00:00', calls: 120000 },
  { hour: '04:00', calls: 85000 },
  { hour: '08:00', calls: 280000 },
  { hour: '12:00', calls: 420000 },
  { hour: '16:00', calls: 380000 },
  { hour: '20:00', calls: 290000 },
];

const mcpUsageData = [
  { name: 'OpenAI', value: 35, color: 'hsl(var(--primary))' },
  { name: 'PostgreSQL', value: 25, color: 'hsl(210, 100%, 50%)' },
  { name: 'Slack', value: 18, color: 'hsl(280, 100%, 60%)' },
  { name: 'GitHub', value: 12, color: 'hsl(150, 100%, 40%)' },
  { name: 'Others', value: 10, color: 'hsl(var(--muted))' },
];

const regionData = [
  { region: 'North America', users: 5200, percentage: 40 },
  { region: 'Europe', users: 3800, percentage: 30 },
  { region: 'Asia Pacific', users: 2500, percentage: 19 },
  { region: 'Latin America', users: 850, percentage: 7 },
  { region: 'Other', users: 497, percentage: 4 },
];

const kpis = [
  { label: 'DAU', value: '4,892', change: '+8%', trend: 'up' },
  { label: 'WAU', value: '8,234', change: '+12%', trend: 'up' },
  { label: 'MAU', value: '10,847', change: '+15%', trend: 'up' },
  { label: 'Churn Rate', value: '2.3%', change: '-0.5%', trend: 'down' },
  { label: 'ARPU', value: '$69.50', change: '+5%', trend: 'up' },
  { label: 'LTV', value: '$1,420', change: '+8%', trend: 'up' },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <span className="text-xs text-green-500">{kpi.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Total and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(150, 100%, 40%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(150, 100%, 40%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="url(#usersGradient)" name="Total Users" />
                      <Area type="monotone" dataKey="active" stroke="hsl(150, 100%, 40%)" fill="url(#activeGradient)" name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Cohort retention analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { cohort: 'Week 1', retention: 100 },
                    { cohort: 'Week 2', retention: 68 },
                    { cohort: 'Week 4', retention: 52 },
                    { cohort: 'Week 8', retention: 41 },
                    { cohort: 'Week 12', retention: 35 },
                  ].map((item) => (
                    <div key={item.cohort} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.cohort}</span>
                        <span className="font-medium">{item.retention}%</span>
                      </div>
                      <Progress value={item.retention} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly and annual recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Bar dataKey="mrr" fill="hsl(var(--primary))" name="MRR" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by plan tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { plan: 'Enterprise', revenue: 103753, percentage: 36 },
                    { plan: 'Business', revenue: 118800, percentage: 42 },
                    { plan: 'Team', revenue: 81200, percentage: 22 },
                  ].map((item) => (
                    <div key={item.plan} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.plan}</span>
                        <span className="font-medium">${item.revenue.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Calls by Hour</CardTitle>
                <CardDescription>Today's API usage pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={apiCallsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'API Calls']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calls" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MCP Usage Distribution</CardTitle>
                <CardDescription>Most popular MCP servers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mcpUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mcpUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {mcpUsageData.map((item) => (
                    <Badge 
                      key={item.name} 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}: {item.value}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users by Region</CardTitle>
              <CardDescription>Geographic distribution of users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionData.map((item) => (
                  <div key={item.region} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{item.region}</div>
                    <div className="flex-1">
                      <Progress value={item.percentage} />
                    </div>
                    <div className="w-24 text-right">
                      <span className="font-medium">{item.users.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm ml-1">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
