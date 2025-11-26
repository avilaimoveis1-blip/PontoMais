import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "h-10" }) => {
  // Logic to adjust text size based on container height
  const isLarge = className.includes('h-14') || className.includes('h-16');
  const isSmall = className.includes('h-8');
  
  const textSize = isLarge ? 'text-3xl' : (isSmall ? 'text-xl' : 'text-2xl');
  
  return (
    <div className="flex items-center gap-2 select-none">
      <div className={`relative aspect-square flex items-center justify-center ${className}`}>
         {/* Green Pin */}
         <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-green-900 drop-shadow-sm">
           <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
         </svg>
         
         {/* Yellow Plus Sign */}
         <div className="absolute -top-1 -right-1.5 w-[55%] h-[55%] bg-white rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" className="w-full h-full text-yellow-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
         </div>
      </div>
      
      <span className={`font-bold text-green-900 ${textSize} tracking-tight`}>
        Ponto+
      </span>
    </div>
  );
};