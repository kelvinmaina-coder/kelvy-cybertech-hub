import { BarChart3, TrendingUp, Users, Shield } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const performanceData = [
  { month: "Jan", security: 85, business: 72, uptime: 99 },
  { month: "Feb", security: 88, business: 78, uptime: 99.5 },
  { month: "Mar", security: 92, business: 82, uptime: 99.8 },
  { month: "Apr", security: 90, business: 88, uptime: 99.2 },
  { month: "May", security: 95, business: 91, uptime: 99.9 },
  { month: "Jun", security: 97, business: 95, uptime: 99.95 },
];

const radarData = [
  { subject: "Security", A: 95 },
  { subject: "Uptime", A: 99 },
  { subject: "Revenue", A: 82 },
  { subject: "Client Sat.", A: 88 },
  { subject: "Response", A: 91 },
  { subject: "AI Usage", A: 76 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">BUSINESS INTELLIGENCE</h1>
        <p className="text-sm text-muted-foreground font-mono">AI-Powered Analytics & Forecasting</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={TrendingUp} title="Growth Rate" value="23%" variant="green" />
        <MetricCard icon={Users} title="NPS Score" value="72" variant="cyan" />
        <MetricCard icon={Shield} title="Security Score" value="97/100" variant="green" />
        <MetricCard icon={BarChart3} title="AI Accuracy" value="94%" variant="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">PERFORMANCE TRENDS</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="security" stroke="hsl(157, 100%, 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="business" stroke="hsl(195, 100%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">SYSTEM HEALTH RADAR</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 30%, 18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Radar dataKey="A" stroke="hsl(157, 100%, 50%)" fill="hsla(157, 100%, 50%, 0.15)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 glow-purple">
        <h3 className="font-display text-sm text-accent mb-2">AI INSIGHT</h3>
        <p className="text-sm text-foreground">Revenue grew 18% month-over-month driven by 3 new client onboardings. Security posture improved to 97/100 after patching 4 medium vulnerabilities. Recommend focusing on reducing average ticket resolution time from 4.2h to under 3h.</p>
      </div>
    </div>
  );
}
