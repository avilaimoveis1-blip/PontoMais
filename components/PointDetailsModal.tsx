
import React, { useState } from 'react';
import type { Point } from '../types';
import { LocationPinIcon, XMarkIcon, CheckIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};

export const PointDetailsModal: React.FC<{ point: Point; onClose: () => void; onReserve: (point: Point) => void; }> = ({ point, onClose, onReserve }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = point.images && point.images.length > 0 
        ? point.images 
        : ['https://via.placeholder.com/800x600?text=Sem+Imagem'];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative my-8 animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full p-2 z-20 transition-colors shadow-sm">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="max-h-[90vh] overflow-y-auto">
                    
                    {/* Image Gallery Carousel */}
                    <div className="relative w-full h-64 md:h-80 bg-gray-100 group">
                        <img 
                            src={images[currentImageIndex]} 
                            alt={`${point.title} - Imagem ${currentImageIndex + 1}`} 
                            className="w-full h-full object-cover transition-opacity duration-300" 
                        />
                        
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage} 
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeftIcon className="h-6 w-6" />
                                </button>
                                <button 
                                    onClick={nextImage} 
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRightIcon className="h-6 w-6" />
                                </button>
                                
                                {/* Dots Indicator */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {images.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-green-900">{point.title}</h2>
                        <div className="mt-2 flex items-center text-gray-600">
                            <LocationPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span>{point.location}, {point.neighborhood}, {point.city}</span>
                        </div>
                        
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-xl font-semibold text-green-800 mb-4">Detalhes do Ponto</h3>
                            <p className="text-gray-700 leading-relaxed">{point.description}</p>
                            
                            <div className="mt-6">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">Características</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {point.features.map(feature => (
                                            <div key={feature} className="flex items-center text-gray-600">
                                                <CheckIcon className="h-5 w-5 mr-2 text-green-600"/>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-xl font-semibold text-green-800 mb-4">Planos de Aluguel</h3>
                            <div className="space-y-3">
                                {point.rentalOptions.map(opt => (
                                    <div key={opt.period} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center">
                                            <CalendarIcon className="h-5 w-5 mr-3 text-green-700"/>
                                            <span className="font-medium text-gray-800">{opt.period}</span>
                                        </div>
                                        <span className="font-semibold text-lg text-green-900">{formatPrice(opt.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => onReserve(point)}
                                className="w-full max-w-xs bg-yellow-400 text-green-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition duration-300 text-lg">
                                Agendar sua Reserva
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
