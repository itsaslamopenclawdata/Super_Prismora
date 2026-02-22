import { NextResponse } from 'next/server';

const mockListings = [
  {
    id: '1',
    title: '1986-87 Fleer Michael Jordan #57 PSA 8',
    description: 'Iconic rookie card in excellent condition. Slabbed and graded.',
    imageUrl: '/placeholder-card-1.jpg',
    price: 1500.00,
    condition: 'PSA 8',
    seller: { id: 'seller1', name: 'CardGraderPro', rating: 4.9 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '2',
    title: '1952 Topps Mickey Mantle #311',
    description: 'Historic card, VG condition. Centering issue but great for collector.',
    imageUrl: '/placeholder-card-2.jpg',
    price: 15000.00,
    condition: 'VG 3',
    seller: { id: 'seller2', name: 'VintageCards', rating: 4.8 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '3',
    title: '2018 Panini Prizm Luka Doncic #280',
    description: 'Rookie card in Near Mint condition. Great investment piece.',
    imageUrl: '/placeholder-card-3.jpg',
    price: 350.00,
    condition: 'Near Mint',
    seller: { id: 'seller3', name: 'NBAFan', rating: 4.7 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '4',
    title: '1989 Upper Deck Ken Griffey Jr. #1',
    description: 'The iconic Griffey Jr. rookie card. Excellent condition.',
    imageUrl: '/placeholder-card-4.jpg',
    price: 250.00,
    condition: 'Excellent',
    seller: { id: 'seller4', name: 'BaseballKing', rating: 4.8 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '5',
    title: '2003-04 Upper Deck Exquisite LeBron James #78',
    description: 'True rookie auto patch. BGS 9.5. Investment grade card.',
    imageUrl: '/placeholder-card-5.jpg',
    price: 12000.00,
    condition: 'BGS 9.5',
    seller: { id: 'seller5', name: 'HighEndCards', rating: 4.9 },
    listedDate: new Date().toISOString(),
  },
  {
    id: '6',
    title: '2004-05 UD Exquisite Collection #83',
    description: 'Limited print numbered card. Great collection piece.',
    imageUrl: '/placeholder-card-6.jpg',
    price: 85.00,
    condition: 'Near Mint',
    seller: { id: 'seller6', name: 'CardCollector', rating: 4.6 },
    listedDate: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    listings: mockListings,
  });
}
