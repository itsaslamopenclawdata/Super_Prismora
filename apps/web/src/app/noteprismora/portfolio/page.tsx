'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Grid,
  Badge,
  EmptyState,
} from '@super-prismora/ui';

interface NoteItem {
  id: string;
  name: string;
  type: string;
  confidence: number;
  imageUrl: string;
  details: {
    denomination: string;
    series: string;
    noteType: string;
    estimatedValue: string;
  };
  dateAdded: string;
}

export default function NotePrismoraPortfolio() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'name' | 'value'>('dateAdded');
  const [filter, setFilter] = useState<'all' | 'high' | 'good' | 'medium'>('all');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/noteprismora/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.items || []);
      } else {
        const stored = localStorage.getItem('notePortfolio');
        if (stored) setPortfolio(JSON.parse(stored));
      }
    } catch (error) {
      const stored = localStorage.getItem('notePortfolio');
      if (stored) setPortfolio(JSON.parse(stored));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/noteprismora/portfolio/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) setPortfolio(portfolio.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return <Badge variant="success">High</Badge>;
    if (confidence >= 75) return <Badge variant="primary">Good</Badge>;
    if (confidence >= 50) return <Badge variant="warning">Medium</Badge>;
    return <Badge variant="error">Low</Badge>;
  };

  const parseValue = (valueStr: string): number => {
    const match = valueStr.match(/\$?([\d,]+)/);
    return match ? parseFloat(match[1].replace(',', '')) : 0;
  };

  const sortedAndFilteredPortfolio = portfolio
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'high') return item.confidence >= 90;
      if (filter === 'good') return item.confidence >= 75 && item.confidence < 90;
      if (filter === 'medium') return item.confidence >= 50 && item.confidence < 75;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dateAdded') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortBy === 'name') {
        return a.details.series.localeCompare(b.details.series);
      } else if (sortBy === 'value') {
        return parseValue(b.details.estimatedValue) - parseValue(a.details.estimatedValue);
      }
      return 0;
    });

  const totalValue = portfolio.reduce((sum, item) => sum + parseValue(item.details.estimatedValue), 0);
  const avgConfidence = portfolio.length > 0
    ? portfolio.reduce((sum, item) => sum + item.confidence, 0) / portfolio.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-neutral-900 dark:via-green-900/20 dark:to-teal-900/20 py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-neutral-900 dark:via-green-900/20 dark:to-teal-900/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 mb-4">
            NotePrismora
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Your Banknote Portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">💵</div>
              <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{portfolio.length}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Notes</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Est. Portfolio Value</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{avgConfidence.toFixed(1)}%</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Avg. Confidence</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={() => router.push('/noteprismora/scan')} variant="primary" className="flex-1 min-w-[150px]">Add New Note</Button>
          <Button onClick={() => router.push('/noteprismora/marketplace')} variant="secondary" className="flex-1 min-w-[150px]">Visit Marketplace</Button>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  <option value="dateAdded">Date Added</option>
                  <option value="name">Series</option>
                  <option value="value">Estimated Value</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Filter By Confidence</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  <option value="all">All Notes</option>
                  <option value="high">High Confidence (90%+)</option>
                  <option value="good">Good Confidence (75-90%)</option>
                  <option value="medium">Medium Confidence (50-75%)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {sortedAndFilteredPortfolio.length === 0 ? (
          <EmptyState
            variant="default"
            size="lg"
            title="No Notes in Portfolio"
            description="Start by scanning your first banknote to build your collection"
            action={<Button onClick={() => router.push('/noteprismora/scan')} variant="primary">Scan First Note</Button>}
          />
        ) : (
          <Grid cols={1} mdCols={2} lgCols={3} gap="md">
            {sortedAndFilteredPortfolio.map((item) => (
              <Card key={item.id} className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
                  <div className="absolute top-2 right-2">{getConfidenceBadge(item.confidence)}</div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{item.details.series} {item.details.noteType}</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">{item.details.denomination}</p>
                  <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex justify-between"><span>Type:</span><span className="font-medium">{item.details.noteType}</span></div>
                    <div className="flex justify-between"><span>Est. Value:</span><span className="font-bold text-green-600 dark:text-green-400">{item.details.estimatedValue}</span></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => router.push(`/noteprismora/item/${item.id}`)} variant="secondary" size="sm" className="flex-1">View Details</Button>
                    <Button onClick={() => handleDelete(item.id)} variant="danger" size="sm">Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
}
