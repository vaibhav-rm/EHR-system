import React from 'react';
import { FileText, ArrowRight, TrendingUp } from 'lucide-react';

const MedicalRecordsAndInsights = () => {
  const records = [
    {
      id: 1,
      title: "Complete Blood Count (CBC)",
      date: "2024-12-15",
      location: "City Medical Lab",
      doctor: "Dr. Michael Chen",
      content: "Your blood test results are normal. All key indicators including red blood cells, white blood cells, and platelets are within healthy ranges.",
      tags: ["Routine", "Blood-Work"],
    },
    {
      id: 2,
      title: "Chest X-Ray",
      date: "2024-12-10",
      location: "Downtown Medical Center",
      doctor: "Dr. Emily Watson",
      content: "Your chest X-ray shows healthy lungs with no signs of infection or abnormalities. Heart appears normal in size.",
      tags: ["Routine", "Imaging"],
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {/* Left Column: Recent Medical Records */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.125rem] font-semibold text-[#09090b]">Recent Medical Records</h2>
          <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            View all
          </button>
        </div>

        <div className="space-y-4">
          {records.map((record) => (
            <div 
              key={record.id}
              className="bg-white rounded-[1.5rem] p-6 soft-shadow border border-[#e4e4e7] transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="p-3 rounded-2xl bg-[#f0fdfa] text-teal-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[1rem] text-[#09090b]">{record.title}</h4>
                    <p className="text-xs text-[#71717a] mt-0.5">
                      {record.location} • {record.doctor}
                    </p>
                  </div>
                </div>
                <span className="text-[0.75rem] font-medium text-[#a1a1aa]">
                  {record.date}
                </span>
              </div>

              <div className="bg-[#fafafa] rounded-2xl p-4 mb-4">
                <p className="text-[0.875rem] leading-[1.5rem] italic text-[#52525b]">
                  &quot;{record.content}&quot;
                </p>
              </div>

              <div className="flex gap-2">
                {record.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-white border border-[#e4e4e7] rounded-full text-xs font-medium text-[#71717a]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: AI Insights */}
      <div className="lg:col-span-1">
        <div 
          className="bg-[#18181b] rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col h-full min-h-[400px]"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex-1">
            <div className="p-3 rounded-2xl bg-white/10 w-fit mb-6">
              <TrendingUp className="h-6 w-6 text-teal-400" />
            </div>
            
            <h3 className="text-[1.875rem] font-bold leading-tight mb-2">AI Insights</h3>
            <p className="text-[0.875rem] text-zinc-400 mb-8">Your health summary for this month</p>

            <div className="space-y-6">
              <p className="text-[0.875rem] leading-[1.6] text-zinc-300">
                You&apos;ve completed <span className="text-white font-bold">92%</span> of your medications this month. 
                Your physical activity is up by <span className="text-teal-400 font-bold">15%</span> compared to November.
              </p>
            </div>
          </div>

          <button 
            className="relative z-10 mt-auto w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
          >
            Get Detailed Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsAndInsights;