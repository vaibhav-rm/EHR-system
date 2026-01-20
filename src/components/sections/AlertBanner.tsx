import React from 'react';
import { AlertCircle } from 'lucide-react';

const AlertBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full px-0">
      <div 
        className="flex items-start md:items-center justify-between gap-4 p-4 md:px-6 md:py-4 rounded-3xl bg-[#fff7ed] border-none"
        style={{
          backgroundColor: '#fff7ed', // Tailwind Orange-50 equivalent from design specs
        }}
      >
        <div className="flex items-start md:items-center gap-4 flex-1">
          <div className="shrink-0 mt-1 md:mt-0">
            <div className="p-2 rounded-full bg-orange-100/50">
              <AlertCircle 
                className="w-5 h-5 text-[#9a3412]" 
                strokeWidth={2.5}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <h4 className="text-sm font-bold text-[#9a3412] whitespace-nowrap">
              Attention Needed
            </h4>
            <p className="text-sm leading-relaxed text-[#9a3412]/90 font-medium">
              Lipid Panel: Your cholesterol is slightly high. Consider dietary changes - reduce saturated fats and increase fiber intake. Follow-up recommended in 3 months.
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start md:self-center">
          <a 
            href="#" 
            className="text-sm font-semibold text-[#9a3412] hover:underline whitespace-nowrap transition-all"
          >
            View Report
          </a>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;