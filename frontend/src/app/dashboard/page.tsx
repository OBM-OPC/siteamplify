'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Analysis {
  id: string;
  url: string;
  domain: string;
  status: string;
  seo_score: number;
  ki_score: number;
  created_at: string;
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production: fetch from API
    // Mock data for now
    setTimeout(() => {
      setAnalyses([
        {
          id: '1',
          url: 'https://oberbeck-marketing.de',
          domain: 'oberbeck-marketing.de',
          status: 'completed',
          seo_score: 72,
          ki_score: 58,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          url: 'https://example.com',
          domain: 'example.com',
          status: 'completed',
          seo_score: 45,
          ki_score: 32,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            <span className="font-bold text-lg">SiteAmplify</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Free Plan</Badge>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Neue Analyse
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Übersicht deiner Website-Analysen und Content-Vorschläge.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">Analysen laden...</div>
        ) : analyses.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Noch keine Analysen</h3>
              <p className="text-muted-foreground mb-6">
                Starte deine erste Website-Analyse und entdecke Content-Lücken.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Erste Analyse starten
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{analysis.domain}</h3>
                        <Badge variant={analysis.status === 'completed' ? 'success' : 'secondary'}>
                          {analysis.status === 'completed' ? 'Fertig' : analysis.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{analysis.url}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analysis.seo_score}</div>
                        <div className="text-xs text-muted-foreground">SEO Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{analysis.ki_score}</div>
                        <div className="text-xs text-muted-foreground">KI Score</div>
                      </div>
                      <Link href={`/analysis/${analysis.id}`}>
                        <Button variant="ghost" size="sm">
                          Details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
