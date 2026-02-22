import { NextResponse } from 'next/server';

const mockListings = [
  {
    id: '1',
    title: '1935A $1 Silver Certificate Star Note',
    description: 'Rare star note in Fine condition. Great addition to any collection.',
    imageUrl: '/placeholder-note-1.jpg',
    price: 185.00,
    condition: 'Fine',
    seller: { id: 'seller1', name: 'CurrencyExpert', rating: 4.9 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '2',
    title: '1899 $5 Silver Certificate Chief Note',
    description: 'Historic Silver Certificate, VF condition. Features Indian Chief portrait.',
    imageUrl: '/placeholder-note-2.jpg',
    price: 850.00,
    condition: 'Very Fine',
    seller: { id: 'seller2', name: 'VintageNotes', rating: 4.8 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '3',
    title: '1950 $10 Federal Reserve Note',
    description: 'Crisp uncirculated note. Series 1950, great eye appeal.',
    imageUrl: '/placeholder-note-3.jpg',
    price: 45.00,
    condition: 'Uncirculated',
    seller: { id: 'seller3', name: 'PaperMoneyPro', rating: 4.7 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '4',
    title: '1914 $10 Federal Reserve Note Blue Seal',
    description: 'Large size note in Good condition. Great historical significance.',
    imageUrl: '/placeholder-note-4.jpg',
    price: 350.00,
    condition: 'Good',
    seller: { id: 'seller4', name: 'HistoryBuff', rating: 4.8 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '5',
    title: '1934A $500 Federal Reserve Note',
    description: 'High denomination note in VG condition. Rare find.',
    imageUrl: '/placeholder-note-5.jpg',
    price: 2500.00,
    condition: 'Very Good',
    seller: { id: 'seller5', name: 'HighEndCurrency', rating: 4.9 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '6',
    title: '1923 $1 Silver Certificate',
    description: 'Small size note, VF condition. Educational series note.',
    imageUrl: '/placeholder-note-6.jpg',
    price: 75.00,
    condition: 'Very Fine',
    seller: { id: 'seller6', name: 'NoteCollector', rating: 4.6 },
    listedDate: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    listings: mockListings,
  });
}
