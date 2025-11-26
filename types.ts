
export interface RentalOption {
  period: 'Quinzenal' | 'Mensal' | 'Trimestral';
  price: number;
}

export interface Point {
  id: number;
  title: string;
  location: string;
  neighborhood: string;
  city: string;
  images: string[]; // Alterado para array de strings para suportar galeria
  footTraffic: 'Baixo' | 'Médio' | 'Alto';
  description: string;
  category: string;
  features: string[];
  rentalOptions: RentalOption[];
  isHidden?: boolean; // Propriedade para controle de visibilidade (Soft Delete)
}

export interface Booking {
  id: string;
  point: Point;
  startDate: Date;
  endDate: Date;
  plan: RentalOption;
  status: 'active' | 'upcoming' | 'completed';
  purchaseDate: Date;
  userEmail?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileType?: 'imobiliaria' | 'construtora' | 'corretor_autonomo' | 'estabelecimento' | 'admin';
  joinDate: Date;
}

export interface PartnerRequest {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  establishmentName: string;
  cnpj: string;
  address: string;
  city: string;
  description: string;
  features: string[];
  images: string[]; // Adicionado array de imagens
  prices: {
    quinzenal: number;
    mensal: number;
    trimestral: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
}