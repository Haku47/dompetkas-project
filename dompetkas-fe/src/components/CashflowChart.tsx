"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: Array<{ bulan: number; masuk: number; keluar: number }>;
}

// Formatter abbreviasi: 1.5T, 500M, 25Jt, 500Rb, dll
const formatRupiah = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '')}T`;
  if (abs >= 1_000_000_000)     return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000_000)         return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}Jt`;
  if (abs >= 1_000)             return `${(value / 1_000).toFixed(0)}Rb`;
  return `${value}`;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function CashflowChart({ data }: ChartProps) {
  // Mapping data agar nama bulan keluar rapi
  const formattedData = data.map(item => ({
    name: monthNames[item.bulan - 1] ?? `Bulan ${item.bulan}`,
    Masuk: item.masuk,
    Keluar: item.keluar
  }));

  return (
    // Parent container dengan OLED style premium
    <div className="w-full bg-[#09090b]/40 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
      
      {/* Area pembungkus grafik batang dengan tinggi pasti */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formattedData} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4} // Jarak tipis antar batang Masuk & Keluar biar makin estetik
          >
            {/* Grid tipis abu-abu gelap */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" opacity={0.3} vertical={false} />
            
            <XAxis 
              dataKey="name" 
              stroke="#737373" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              fontFamily="monospace"
            />
            
            <YAxis 
              stroke="#737373" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              fontFamily="monospace"
              tickFormatter={(v) => formatRupiah(v)} // Disingkat biar ga menuhin layar kiri
            />
            
            {/* Tooltip OLED style */}
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
              formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              contentStyle={{ 
                backgroundColor: '#09090b', 
                borderColor: 'rgba(255,255,255,0.05)', 
                color: '#fff', 
                fontSize: '11px', 
                fontFamily: 'monospace',
                borderRadius: '8px'
              }} 
            />

            {/* Legend untuk keterangan warna di bawah grafik */}
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            
            {/* Batang Pemasukan - Emerald Hijau Premium dengan Radius Lengkung di Atas */}
            <Bar 
              dataKey="Masuk" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={32}
            />
            
            {/* Batang Pengeluaran - Rose Merah Premium dengan Radius Lengkung di Atas */}
            <Bar 
              dataKey="Keluar" 
              fill="#f43f5e" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}