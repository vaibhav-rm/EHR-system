import React from 'react';
import { Calendar, Pill, FileText, CreditCard } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

interface StatItemProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtext: string;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatItemProps> = ({
  icon: Icon,
  title,
  value,
  subtext,
  iconBgColor,
  iconColor,
}) => {
  return (
    <div className="text-card-foreground flex flex-col gap-6 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden py-6">
      <div className="p-4 px-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${iconBgColor} ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-[#09090b] dark:text-white">{value}</h3>
          <p className="text-xs text-zinc-400 mt-2 font-medium">{subtext}</p>
        </div>
      </div>
    </div>
  );
};

const StatsOverview: React.FC = () => {
  const { data: appointmentBundle, isLoading: isLoadingApt } = useSWR('/api/fhir/Appointment', fetcher);
  const { data: medicationBundle, isLoading: isLoadingMeds } = useSWR('/api/fhir/MedicationRequest', fetcher);
  const { data: reportBundle, isLoading: isLoadingReports } = useSWR('/api/fhir/DiagnosticReport', fetcher);
  const { data: invoiceBundle, isLoading: isLoadingInvoice } = useSWR('/api/fhir/Invoice', fetcher);

  const aptCount = appointmentBundle?.total || 0;
  const medsCount = medicationBundle?.total || 0; // In reality we might filter for status=active
  const reportCount = reportBundle?.total || 0;
  const invoiceCount = invoiceBundle?.total || 0;

  const stats = [
    {
      icon: Calendar,
      title: 'Upcoming Appointments',
      value: isLoadingApt ? '...' : aptCount.toString(),
      subtext: 'Next: Check schedule', // Ideally fetch next date
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Pill,
      title: 'Active Medications',
      value: isLoadingMeds ? '...' : medsCount.toString(),
      subtext: 'Adherence: High',
      iconBgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      icon: FileText,
      title: 'Recent Reports',
      value: isLoadingReports ? '...' : reportCount.toString(),
      subtext: 'Check results',
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      icon: CreditCard,
      title: 'Pending Bills',
      value: isLoadingInvoice ? '...' : invoiceCount.toString(), 
      subtext: 'Unpaid items',
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          subtext={stat.subtext}
          iconBgColor={stat.iconBgColor}
          iconColor={stat.iconColor}
        />
      ))}
    </section>
  );
};

export default StatsOverview;
