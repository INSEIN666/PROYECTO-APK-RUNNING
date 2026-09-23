export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export const PRODUCTS_DATA: Product[] = [
  {
    id: '1',
    name: 'Bapesta Low Pink Camo',
    category: 'Calzado',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60',
    description: 'Edición icónica con estampado clásico ABC Camo en tonos rosados.'
  },
  {
    id: '2',
    name: 'Shark Full Zip Hoodie',
    category: 'Ropa',
    price: 620000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    description: 'Sudadera con capucha y el clásico diseño de tiburón urbano.'
  },
  {
    id: '3',
    name: 'Bape Sta White/Black',
    category: 'Calzado',
    price: 790000,
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop&q=60',
    description: 'Estilo minimalista de alto impacto con estrella contrastada.'
  },
  {
    id: '4',
    name: 'Ape Head Camo Tee',
    category: 'Ropa',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    description: 'Camiseta de algodón premium con estampado frontal de la marca.'
  }
];