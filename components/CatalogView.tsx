
import React, { useState, useMemo } from 'react';
import type { Point } from '../types';
import { PointCard } from './PointCard';
import { SearchIcon, XMarkIcon } from './icons';

interface CatalogViewProps {
  points: Point[];
  onSelectPoint: (point: Point) => void;
}

// Função auxiliar para extrair o estado da string de cidade "Cidade, UF"
const getStateFromCity = (cityStr: string) => {
  const parts = cityStr.split(',');
  return parts.length > 1 ? parts[1].trim() : '';
};

const getCityOnly = (cityStr: string) => {
    const parts = cityStr.split(',');
    return parts[0].trim();
}

export const CatalogView: React.FC<CatalogViewProps> = ({ points, onSelectPoint }) => {
  // Filtros de Localização (Cascata)
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');

  // Filtros de Característica (Multi-select)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- Lógica de Dados Disponíveis (Cascata) ---

  // 1. Estados: Sempre baseados em todos os pontos
  const availableStates = useMemo(() => {
      const states = points.map(p => getStateFromCity(p.city));
      return [...new Set(states)].filter(Boolean).sort();
  }, [points]);

  // 2. Cidades: Baseadas no Estado selecionado
  const availableCities = useMemo(() => {
      if (!selectedState) return [];
      const filteredPoints = points.filter(p => getStateFromCity(p.city) === selectedState);
      const cities = filteredPoints.map(p => getCityOnly(p.city));
      return [...new Set(cities)].sort();
  }, [points, selectedState]);

  // 3. Bairros: Baseados na Cidade selecionada
  const availableNeighborhoods = useMemo(() => {
      if (!selectedCity) return [];
      // Precisamos filtrar por estado também para evitar cidades com mesmo nome em estados diferentes
      const filteredPoints = points.filter(p => 
          getStateFromCity(p.city) === selectedState && 
          getCityOnly(p.city) === selectedCity
      );
      const neighborhoods = filteredPoints.map(p => p.neighborhood);
      return [...new Set(neighborhoods)].sort();
  }, [points, selectedState, selectedCity]);

  const uniqueCategories = useMemo(() => [...new Set(points.map(p => p.category))].sort(), [points]);

  // Handlers
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedState(e.target.value);
      setSelectedCity('');         // Reseta cidade
      setSelectedNeighborhood(''); // Reseta bairro
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCity(e.target.value);
      setSelectedNeighborhood(''); // Reseta bairro
  };

  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedNeighborhood(e.target.value);
  };

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[], value: string) => {
    if (current.includes(value)) {
        setter(current.filter(item => item !== value));
    } else {
        setter([...current, value]);
    }
  };

  const clearFilters = () => {
      setSelectedState('');
      setSelectedCity('');
      setSelectedNeighborhood('');
      setSelectedCategories([]);
  };

  // Filtragem Final
  const filteredPoints = useMemo(() => {
    return points.filter(point => {
      const pointState = getStateFromCity(point.city);
      const pointCity = getCityOnly(point.city);

      const matchesState = !selectedState || pointState === selectedState;
      const matchesCity = !selectedCity || pointCity === selectedCity;
      const matchesNeighborhood = !selectedNeighborhood || point.neighborhood === selectedNeighborhood;
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(point.category);

      return matchesState && matchesCity && matchesNeighborhood && matchesCategory;
    });
  }, [points, selectedState, selectedCity, selectedNeighborhood, selectedCategories]);

  const CheckboxGroup = ({ title, options, selected, setSelected }: { title: string, options: string[], selected: string[], setSelected: any }) => (
      <div className="mb-6">
          <h4 className="font-bold text-green-900 mb-3 text-sm uppercase tracking-wide border-b border-gray-200 pb-1">{title}</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {options.map(option => (
                  <label key={option} className="flex items-center cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors ${selected.includes(option) ? 'bg-green-600 border-green-600' : 'border-gray-300 group-hover:border-green-500 bg-white'}`}>
                          {selected.includes(option) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input 
                          type="checkbox" 
                          className="hidden"
                          checked={selected.includes(option)}
                          onChange={() => toggleFilter(setSelected, selected, option)}
                      />
                      <span className={`text-sm ${selected.includes(option) ? 'text-green-900 font-medium' : 'text-gray-600'}`}>{option}</span>
                  </label>
              ))}
          </div>
      </div>
  );

  return (
    <main className="bg-gray-50 min-h-screen py-8 animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
                <button 
                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                    className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg shadow-sm flex justify-between items-center"
                >
                    <span>Filtrar Resultados</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                </button>
            </div>

            {/* Sidebar Filters */}
            <aside className={`lg:w-1/4 flex-shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-gray-800">Filtros</h3>
                        {(selectedState || selectedCategories.length > 0) && (
                            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium">
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    {/* Filtros de Localização em Cascata */}
                    <div className="mb-8 space-y-4">
                        <h4 className="font-bold text-green-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-1">Localização</h4>
                        
                        {/* Estado */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Estado (UF)</label>
                            <select 
                                value={selectedState} 
                                onChange={handleStateChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                            >
                                <option value="">Selecione o Estado</option>
                                {availableStates.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        {/* Cidade */}
                        <div>
                            <label className={`block text-xs font-semibold mb-1 ${!selectedState ? 'text-gray-400' : 'text-gray-600'}`}>Cidade</label>
                            <select 
                                value={selectedCity} 
                                onChange={handleCityChange}
                                disabled={!selectedState}
                                className={`w-full p-2.5 border text-sm rounded-lg outline-none ${!selectedState ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500'}`}
                            >
                                <option value="">Selecione a Cidade</option>
                                {availableCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Bairro */}
                        <div>
                            <label className={`block text-xs font-semibold mb-1 ${!selectedCity ? 'text-gray-400' : 'text-gray-600'}`}>Bairro</label>
                            <select 
                                value={selectedNeighborhood} 
                                onChange={handleNeighborhoodChange}
                                disabled={!selectedCity}
                                className={`w-full p-2.5 border text-sm rounded-lg outline-none ${!selectedCity ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500'}`}
                            >
                                <option value="">Todos os Bairros</option>
                                {availableNeighborhoods.map(bairro => (
                                    <option key={bairro} value={bairro}>{bairro}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Outros Filtros */}
                    <CheckboxGroup title="Tipo de Estabelecimento" options={uniqueCategories} selected={selectedCategories} setSelected={setSelectedCategories} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                {/* Results Header */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-end sm:items-center border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-green-900">Pontos Disponíveis</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {selectedCity ? `${selectedCity}, ${selectedState}` : (selectedState ? `Estado: ${selectedState}` : 'Nacional')}
                        </p>
                    </div>
                    <p className="text-gray-600 font-medium mt-2 sm:mt-0 bg-green-100 px-3 py-1 rounded-full text-sm">
                        {filteredPoints.length} {filteredPoints.length === 1 ? 'ponto encontrado' : 'pontos encontrados'}
                    </p>
                </div>

                {/* Grid */}
                {filteredPoints.length > 0 ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPoints.map(point => (
                            <PointCard key={point.id} point={point} onSelectPoint={onSelectPoint} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <SearchIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum ponto encontrado</h3>
                        <p className="text-gray-500 mb-6">Não há pontos disponíveis com os filtros selecionados nesta região.</p>
                        <button onClick={clearFilters} className="text-green-700 font-bold hover:underline">
                            Limpar todos os filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        /* Custom Scrollbar for Sidebar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
      `}</style>
    </main>
  );
};
