
import React from 'react';
import type { Point } from '../types';
import { LocationPinIcon } from './icons';

interface PointCardProps {
  point: Point;
  onSelectPoint: (point: Point) => void;
}

export const PointCard: React.FC<PointCardProps> = ({ point, onSelectPoint }) => {
  return (
    <div 
      onClick={() => onSelectPoint(point)}
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col cursor-pointer group"
    >
      {/* Display first image or fallback */}
      <img 
        src={point.images && point.images.length > 0 ? point.images[0] : 'https://via.placeholder.com/600x400?text=Sem+Imagem'} 
        alt={point.title} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-green-900 group-hover:text-green-700 transition-colors">{point.title}</h3>
            <div className="mt-2 flex items-center text-gray-600">
                <LocationPinIcon className="h-5 w-5 mr-1 text-gray-400" />
                <span>{point.neighborhood}, {point.city}</span>
            </div>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">{point.description}</p>
        </div>
        <div className="mt-6">
          <h4 className="font-semibold text-green-800">Opções de Aluguel:</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {point.rentalOptions.map(opt => (
              <span key={opt.period} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1.5 rounded-full">
                {opt.period}
              </span>
            ))}
          </div>
          <button 
            className="w-full mt-6 bg-yellow-400 text-green-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-500 transition duration-300 relative z-10">
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
