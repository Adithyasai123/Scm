'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { dealerApi } from '@/api/dealer.api';
import { planApi } from '@/api/plan.api';
import { commissionApi } from '@/api/commission.api';
import { franchiseApi } from '@/api/franchise.api';
import { StatusBadge } from '@/components/tables/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Store,
  Coins,
  Radio,
  Clock,
  MapPin,
  Activity,
  Layers,
  Building2,
  Percent,
  Smartphone,
  AlertCircle,
  ShieldCheck,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   COMPACT STAT CARD COMPONENT
   ───────────────────────────────────────────────────────────── */
function BaseStatCard({
  title,
  microLabel,
  value,
  subtitle,
  trend,
  icon: Icon,
  badgeIcon: BadgeIcon,
  accentColor,
  href,
  urgent = false,
}: any) {
  return (
    <Link
      href={href}
      className={`atlas-card group relative px-3 py-2.5 flex flex-col justify-between overflow-hidden hover:border-accent/40 transition-all duration-150 rounded-lg ${
        urgent ? 'border-amber-500/50 bg-amber-500/5 hover:border-amber-500' : ''
      }`}
    >
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-center justify-between mb-1 pl-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-fg truncate">
          {microLabel}
        </span>
        <div
          className="rounded-md p-1"
          style={{
            backgroundColor: `${accentColor}18`,
            color: accentColor,
          }}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
      </div>
      <div className="pl-2 text-left">
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="font-bold text-heading text-xl tabular-nums tracking-tight">
            {value}
          </div>
          <div className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-fg bg-surface-alt px-1.5 py-0.5 rounded border border-border shrink-0">
            <BadgeIcon className="w-2.5 h-2.5 text-muted-fg" strokeWidth={2} />
            <span>{trend}</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-heading mt-0.5 truncate">{title}</div>
        <div className="text-[10px] font-normal text-muted-fg truncate leading-tight">
          {subtitle}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="atlas-card animate-pulse flex flex-col justify-between p-2.5 min-h-[76px] rounded-lg">
      <div className="flex justify-between items-center mb-1.5">
        <div className="h-2.5 bg-border rounded w-16"></div>
        <div className="h-4 w-4 bg-border rounded"></div>
      </div>
      <div>
        <div className="bg-border rounded mb-1 h-5 w-12"></div>
        <div className="h-2.5 bg-border rounded w-20"></div>
      </div>
    </div>
  );
}

function ErrorCard({ title }: { title: string }) {
  return (
    <div className="atlas-card bg-danger-bg border-danger-red/20 flex flex-col justify-between p-2.5 rounded-lg">
      <div className="text-danger-red font-bold text-xs mb-1">{title}</div>
      <div className="text-[10px] text-danger-red/70">Failed to load data.</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INDIVIDUAL DATA CARDS
   ───────────────────────────────────────────────────────────── */

function PendingApprovalsCard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const perm1 = usePermission('franchiseAddBalance');
  const perm2 = usePermission('reportsPermissions');
  const hasPerm = perm1 || perm2;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['franchise-transactions'],
    queryFn: () => franchiseApi.getTransactions(),
    enabled: hasPerm && mounted,
  });

  if (!mounted) return <SkeletonCard />;
  if (!hasPerm) return null;
  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorCard title="Pending Approvals" />;

  const txnList = Array.isArray(data) ? data : [];
  const pending = txnList.filter((t: any) => t.status === 'PENDING').length;

  return (
    <BaseStatCard
      urgent={pending > 0}
      href="/reports"
      title="Pending Approvals"
      microLabel="MUTATION QUEUE"
      value={pending}
      subtitle={pending > 0 ? 'Requires Action' : 'All Cleared'}
      trend={pending > 0 ? 'Urgent' : 'Cleared'}
      icon={Clock}
      badgeIcon={AlertCircle}
      accentColor={pending > 0 ? '#FF6B6B' : '#38BDF8'}
    />
  );
}

function ActiveDealersCard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasPerm = usePermission('dealerPermissions');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dealers-count'],
    queryFn: () => dealerApi.getDealerList(),
    enabled: hasPerm && mounted,
  });

  if (!mounted) return <SkeletonCard />;
  if (!hasPerm) return null;
  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorCard title="Active Dealers" />;

  const list = Array.isArray(data) ? data : [];
  const total = list.length;
  const active = list.filter((d: any) => d.status === 'ACTIVE').length;

  return (
    <BaseStatCard
      href="/dealers"
      title="Active Dealers"
      microLabel="RETAIL NETWORK"
      value={active}
      subtitle={`Out of ${total} outlets`}
      trend="Verified"
      icon={Store}
      badgeIcon={Building2}
      accentColor="#38BDF8"
    />
  );
}

function TotalOperatorsCard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasPerm = usePermission('userPermissions');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => userApi.getUsersList(),
    enabled: hasPerm && mounted,
  });

  if (!mounted) return <SkeletonCard />;
  if (!hasPerm) return null;
  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorCard title="Total Operators" />;

  const list = Array.isArray(data) ? data : [];
  const total = list.length;
  const active = list.filter((u: any) => u.status === 1).length;

  return (
    <BaseStatCard
      href="/users"
      title="Total Operators"
      microLabel="USERS & ROLES"
      value={total}
      subtitle={`${active} Active Ops`}
      trend="Secured"
      icon={Users}
      badgeIcon={ShieldCheck}
      accentColor="#38BDF8"
    />
  );
}

function CommissionRulesCard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasPerm = usePermission('commissionPermissions');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['commissions-count'],
    queryFn: () => commissionApi.fetchPrepaidFrcCommission({}),
    enabled: hasPerm && mounted,
  });

  if (!mounted) return <SkeletonCard />;
  if (!hasPerm) return null;
  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorCard title="Commission Rules" />;

  const list = Array.isArray(data) ? data : [];

  return (
    <BaseStatCard
      href="/commissions"
      title="Commission Rules"
      microLabel="POLICY ENGINE"
      value={list.length}
      subtitle="FRC, OTF & Postpaid"
      trend="Active"
      icon={Coins}
      badgeIcon={Percent}
      accentColor="#A78BFA"
    />
  );
}

function TariffCatalogCard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasPerm = usePermission('plansNumberpermissions');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['plans-count'],
    queryFn: () => planApi.getPlans(),
    enabled: hasPerm && mounted,
  });

  if (!mounted) return <SkeletonCard />;
  if (!hasPerm) return null;
  if (isLoading) return <SkeletonCard />;
  if (isError) return <ErrorCard title="Tariff Catalog" />;

  const list = Array.isArray(data) ? data : [];

  return (
    <BaseStatCard
      href="/plans"
      title="Tariff Catalog"
      microLabel="ACTIVE PLANS"
      value={list.length}
      subtitle="BSNL Packs"
      trend="Live"
      icon={Radio}
      badgeIcon={Smartphone}
      accentColor="#F59E0B"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   CHART 1: ADVANCED LINE GRAPH (Revenue & Payout Velocity)
   ───────────────────────────────────────────────────────────── */
function AdvancedTrendChart() {
  const [timeframe, setTimeframe] = React.useState<'7D' | '30D' | '90D'>('7D');

  const data7D = [
    { period: 'Mon', gmv: 4.2, payout: 38, count: 1820 },
    { period: 'Tue', gmv: 5.8, payout: 52, count: 2450 },
    { period: 'Wed', gmv: 5.1, payout: 46, count: 2190 },
    { period: 'Thu', gmv: 6.9, payout: 64, count: 2980 },
    { period: 'Fri', gmv: 8.4, payout: 79, count: 3620 },
    { period: 'Sat', gmv: 9.6, payout: 88, count: 4120 },
    { period: 'Sun', gmv: 8.6, payout: 77, count: 3740 },
  ];

  const data30D = [
    { period: 'W1', gmv: 28.5, payout: 260, count: 12400 },
    { period: 'W2', gmv: 34.2, payout: 310, count: 14800 },
    { period: 'W3', gmv: 39.0, payout: 355, count: 17100 },
    { period: 'W4', gmv: 46.8, payout: 420, count: 20200 },
  ];

  const data90D = [
    { period: 'Jul', gmv: 124, payout: 1120, count: 54000 },
    { period: 'Aug', gmv: 148, payout: 1340, count: 65000 },
    { period: 'Sep', gmv: 172, payout: 1560, count: 76000 },
  ];

  const currentData = timeframe === '7D' ? data7D : timeframe === '30D' ? data30D : data90D;

  return (
    <div className="bg-surface rounded-lg border border-border shadow-xs p-3.5 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="section-title text-xs font-bold text-heading">Revenue & Incentive Velocity</h3>
            <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.2 rounded font-mono font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-[11px] text-muted-fg mt-0.5">Recharge GMV (₹ Lakhs) vs incentive payout (₹ Thousands)</p>
        </div>

        {/* Timeframe pill toggles */}
        <div className="flex items-center gap-1 bg-surface-alt p-0.5 rounded border border-border shrink-0 self-start sm:self-auto">
          {(['7D', '30D', '90D'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                timeframe === t
                  ? 'bg-accent text-[#051B11] shadow-xs'
                  : 'text-muted-fg hover:text-heading hover:bg-surface'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="flex items-center gap-3 py-1.5 text-xs border-b border-border/50 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          <span className="text-muted-fg">Recharge GMV:</span>
          <span className="font-bold text-heading font-mono">₹{timeframe === '7D' ? '48.6L' : timeframe === '30D' ? '148.5L' : '444L'}</span>
          <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1 rounded">+14.2%</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
          <span className="text-muted-fg">Payouts:</span>
          <span className="font-bold text-heading font-mono">₹{timeframe === '7D' ? '4.44L' : timeframe === '30D' ? '13.45L' : '40.2L'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-auto text-[10px] text-muted-fg">
          <Activity className="w-3 h-3 text-accent" />
          <span>SLA: <strong className="text-heading">99.8%</strong></span>
        </div>
      </div>

      {/* Graph */}
      <div className="h-[155px] w-full mt-1.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#8B98A5' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#8B98A5' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0E151E', borderRadius: '8px', color: '#FFFFFF', fontSize: '11px', border: '1px solid #1E2A38' }}
              formatter={(val: any, name: any) => [
                name === 'gmv' ? `₹${val} Lakhs` : `₹${val}K`,
                name === 'gmv' ? 'Recharge GMV' : 'Commission Payout'
              ]}
            />
            <Area type="monotone" dataKey="gmv" name="gmv" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorGmv)" />
            <Area type="monotone" dataKey="payout" name="payout" stroke="#0284C7" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPayout)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHART 2: GEOGRAPHIC TELEMETRY (Bar Chart)
   ───────────────────────────────────────────────────────────── */
function DealerZoneChart() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasPerm = usePermission('dealerPermissions');
  
  const { data: dealers, isLoading, isError } = useQuery({
    queryKey: ['dealers-chart-data'],
    queryFn: () => dealerApi.getDealerList(),
    enabled: hasPerm && mounted,
  });

  if (!mounted || !hasPerm) return null;

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border shadow-xs p-3.5 flex items-center justify-center h-[235px]">
        <div className="animate-pulse space-y-2 w-full">
          <div className="h-3 bg-border rounded w-28"></div>
          <div className="flex gap-2 items-end h-36 mt-2">
            <div className="w-1/4 bg-border rounded h-3/4"></div>
            <div className="w-1/4 bg-border rounded h-1/2"></div>
            <div className="w-1/4 bg-border rounded h-full"></div>
            <div className="w-1/4 bg-border rounded h-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) return null;

  const list = Array.isArray(dealers) ? dealers : [];
  const zoneMap: Record<string, { dealers: number, circles: Set<string> }> = {};
  
  list.forEach((d: any) => {
    if (d.status === 'ACTIVE') {
      const zone = d.zoneCode || (d.circleId <= 2 ? 'North' : d.circleId <= 4 ? 'South' : d.circleId === 5 ? 'East' : 'West');
      const circle = d.circleCode || `C-${d.circleId}`;
      if (!zoneMap[zone]) {
        zoneMap[zone] = { dealers: 0, circles: new Set() };
      }
      zoneMap[zone].dealers += 1;
      zoneMap[zone].circles.add(circle);
    }
  });

  const zoneChartData = Object.entries(zoneMap).map(([zone, data]) => ({
    zone,
    dealers: data.dealers,
    circles: data.circles.size,
  }));

  return (
    <div className="bg-surface rounded-lg border border-border shadow-xs p-3.5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-1.5 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="section-title text-xs font-bold text-heading">Geographic Telemetry</h3>
            <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.2 rounded font-mono font-bold">
              4 ZONES
            </span>
          </div>
          <p className="text-[10px] text-muted-fg">Outlets & circle coverage</p>
        </div>
        <div className="p-1 bg-accent/10 text-accent rounded">
          <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-fg py-1 shrink-0">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded bg-accent" />
          <span className="font-medium text-heading text-[10px]">Outlets</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded bg-[#38BDF8]" />
          <span className="font-medium text-heading text-[10px]">Circles</span>
        </div>
      </div>

      <div className="h-[155px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zoneChartData} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
            <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#8B98A5' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#8B98A5' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0E151E', borderRadius: '8px', color: '#FFFFFF', fontSize: '11px', border: '1px solid #1E2A38' }}
            />
            <Bar dataKey="dealers" name="Active Dealers" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="circles" name="Circles" fill="#38BDF8" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHART 3: COMMISSION ALLOCATION (Donut Chart)
   ───────────────────────────────────────────────────────────── */
function CommissionPieChart() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasPerm = usePermission('commissionPermissions');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['commissions-distribution-all'],
    queryFn: async () => {
      const [frc, otf, post, land] = await Promise.all([
        commissionApi.fetchPrepaidFrcCommission({}).catch(() => []),
        commissionApi.fetchPrepaidOtfCommission({}).catch(() => []),
        commissionApi.fetchPostpaidCommission({}).catch(() => []),
        commissionApi.fetchLandlineCommission({}).catch(() => [])
      ]);
      return {
        frc: Array.isArray(frc) ? frc.length : 1,
        otf: Array.isArray(otf) ? otf.length : 1,
        post: Array.isArray(post) ? post.length : 1,
        land: Array.isArray(land) ? land.length : 1
      };
    },
    enabled: hasPerm && mounted,
  });

  if (!mounted || !hasPerm) return null;
  
  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border shadow-xs p-3.5 flex items-center justify-center h-[235px]">
        <div className="w-28 h-28 rounded-full border-[10px] border-border animate-pulse" />
      </div>
    );
  }
  
  if (isError) return null;

  const chartData = [
    { name: 'Prepaid FRC', value: data?.frc || 1, color: '#38BDF8' },
    { name: 'Prepaid OTF', value: data?.otf || 1, color: '#0284C7' },
    { name: 'Postpaid', value: data?.post || 1, color: '#FFC010' },
    { name: 'Landline/Fiber', value: data?.land || 1, color: '#F43F5E' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-surface rounded-lg border border-border shadow-xs p-3.5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-1.5 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="section-title text-xs font-bold text-heading">Commission Allocation</h3>
            <span className="text-[9px] text-[#0498EC] bg-[#0498EC]/10 px-1.5 py-0.2 rounded font-mono font-bold">
              ACTIVE
            </span>
          </div>
          <p className="text-[10px] text-muted-fg">Incentive distribution by channel</p>
        </div>
        <div className="p-1 bg-[#0498EC]/10 text-[#0498EC] rounded">
          <Coins className="w-3.5 h-3.5" strokeWidth={2} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-fg py-1 shrink-0">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1 truncate">
            <span style={{ backgroundColor: item.color }} className="w-1.5 h-1.5 rounded-full shrink-0" />
            <span className="font-medium text-heading truncate">{item.name}</span>
            <span className="font-mono text-muted-fg font-semibold">({item.value})</span>
          </div>
        ))}
      </div>

      <div className="h-[155px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [`${val} rules`, name]}
              contentStyle={{ backgroundColor: '#0E151E', borderRadius: '8px', color: '#FFFFFF', fontSize: '11px', border: '1px solid #1E2A38' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RECENT ACTIVITY FEED
   ───────────────────────────────────────────────────────────── */
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval >= 2) return Math.floor(interval) + 'd ago';
  if (interval >= 1) return 'Yesterday';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'Just now';
}

function RecentActivityFeed() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const perm1 = usePermission('franchiseAddBalance');
  const perm2 = usePermission('reportsPermissions');
  const hasPerm = perm1 || perm2;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['franchise-transactions-feed'],
    queryFn: () => franchiseApi.getTransactions(),
    enabled: hasPerm && mounted,
  });

  if (!mounted || !hasPerm) return null;

  return (
    <div className="lg:col-span-2 bg-surface rounded-lg border border-border shadow-xs p-3.5 flex flex-col">
      <div className="flex items-center justify-between pb-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-surface-alt text-muted-fg rounded-lg">
            <Activity className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="section-title text-xs font-bold text-heading">Live Franchise Requests</h3>
            <p className="text-[10px] text-muted-fg">Wallet credit top-up requests from partners</p>
          </div>
        </div>
        <Link
          href="/reports"
          className="text-xs font-bold text-accent hover:text-accent-hover transition-colors flex items-center gap-1 bg-surface-alt hover:bg-accent/10 px-2.5 py-1 rounded"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 mt-1">
        {isLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-border"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-border rounded w-1/3"></div>
                  <div className="h-2 bg-border rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-xs text-danger-red">Failed to load recent activity.</div>
        ) : !data || data.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-fg/70">No recent transactions recorded.</div>
        ) : (
          <div className="divide-y divide-border">
            {data.slice(0, 4).map((txn: any) => {
              const relativeTime = timeAgo(txn.requestDate);

              return (
                <div
                  key={txn.id || txn.transactionId}
                  className="py-2.5 flex items-center justify-between hover:bg-surface-alt/40 px-1.5 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs border border-accent/20">
                      {txn.requestedBy ? txn.requestedBy[0].toUpperCase() : 'F'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-heading">
                        {txn.requestedBy || 'Franchise Partner'} requested top-up
                      </div>
                      <div className="text-[10px] text-muted-fg">
                        {relativeTime} · TXN: {txn.transactionId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-heading tabular-nums">
                      {formatCurrency(txn.amount)}
                    </span>
                    <StatusBadge status={txn.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="space-y-3 max-w-[1400px]">
      {/* HEADER: Button moved to top right, SCM-PROD-CLUSTER removed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
        <div className="text-left">
          <h1 className="page-title text-2xl font-bold tracking-tight text-heading">
            SCM Overview
          </h1>
          <p className="page-subtitle text-xs text-muted-fg mt-0.5">
            National telecom cockpit: Hierarchical onboarding, multi-tier commission engines, and pan-India tariff distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
          <Link
            href="/dealers"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Onboard Dealer</span>
          </Link>
        </div>
      </div>

      {/* COMPACT KPI CARDS: 5 in a single row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <PendingApprovalsCard />
        <ActiveDealersCard />
        <TotalOperatorsCard />
        <CommissionRulesCard />
        <TariffCatalogCard />
      </div>

      {/* CHARTS ROW: Advanced Line Graph + Bar + Donut, fits cleanly in viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Advanced Revenue & Incentive Velocity (Area/Line Graph) */}
        <div className="lg:col-span-6">
          <AdvancedTrendChart />
        </div>
        {/* Geographic Telemetry Bar Chart */}
        <div className="lg:col-span-3">
          <DealerZoneChart />
        </div>
        {/* Commission Allocation Donut Chart */}
        <div className="lg:col-span-3">
          <CommissionPieChart />
        </div>
      </div>

      {/* BOTTOM SECTION: Live Franchise Requests & Quick Console Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <RecentActivityFeed />

        {/* Quick Operations Console */}
        <div className="bg-surface rounded-lg border border-border shadow-xs p-3.5 space-y-2.5 flex flex-col">
          <div className="flex items-center gap-2 pb-2 border-b border-border shrink-0">
            <div className="p-1 bg-accent/10 text-accent rounded">
              <Layers className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="section-title text-xs font-bold text-heading">Console Toolbar</h3>
              <p className="text-[10px] text-muted-fg">Administrative shortcuts</p>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <Link href="/dealers" className="flex items-center justify-between p-2 rounded-lg bg-surface-alt hover:bg-accent/10 border border-border hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                <div>
                  <div className="text-xs font-semibold text-heading">Dealer Management</div>
                  <div className="text-[9px] text-muted-fg">Register & verify retail outlets</div>
                </div>
              </div>
              <ArrowUpRight className="w-3 h-3 text-muted-fg group-hover:text-accent transition-colors" />
            </Link>

            <Link href="/users" className="flex items-center justify-between p-2 rounded-lg bg-surface-alt hover:bg-accent/10 border border-border hover:border-accent/30 transition-all group">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                <div>
                  <div className="text-xs font-semibold text-heading">User Administration</div>
                  <div className="text-[9px] text-muted-fg">RBAC permissions matrix</div>
                </div>
              </div>
              <ArrowUpRight className="w-3 h-3 text-muted-fg group-hover:text-accent transition-colors" />
            </Link>

            <Link href="/commissions" className="flex items-center justify-between p-2 rounded-lg bg-surface-alt hover:bg-amber-500/10 border border-border hover:border-amber-500/30 transition-all group">
              <div className="flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                <div>
                  <div className="text-xs font-semibold text-heading">Commission Engine</div>
                  <div className="text-[9px] text-muted-fg">FRC, OTF & postpaid slabs</div>
                </div>
              </div>
              <ArrowUpRight className="w-3 h-3 text-muted-fg group-hover:text-amber-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
