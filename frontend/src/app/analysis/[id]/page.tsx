'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, Sparkles, Download, Check } from 'lucide-react';
import Link from 'next/link';

interface AnalysisDetail {
  id: string;
  url: string;
  domain: string;
  status: string;
  page_title: string;
  meta_description: string;
  word_count: number;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  image_count: number;
  internal_links: number;
  external_links: number;
  has_schema: boolean;
  seo_score: number;
  ki_score: number;
  content_score: number;
  technical_score: number;
  suggestions: any[];
}

export default function AnalysisDetail() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setAnalysis({
        id: params.id as string,
        url: 'https://oberbeck-marketing.de',
        domain: 'oberbeck-marketing.de',
        status: 'completed',
        page_title: 'Oberbeck Marketing - Digitale Marketing Agentur',
        meta_description: 'Ihre Marketing Agentur für digitale Lösungen.',
        word_count: 1240,
        h1_count: 1,
        h2_count: 6,
        h3_count: 3,
        image_count: 4,
        internal_links: 12,
        external_links: 2,
        has_schema: false,
        seo_score: 72,
        ki_score: 58,
        content_score: 65,
        technical_score: 70,
        suggestions: [
          {
            id: '1',
            title: 'SEO für kleine Unternehmen: Der ultimative Guide',
            primary_keyword: 'SEO kleine Unternehmen',
            traffic_potential: 450,
            effort_score: 2,
            priority_score: 225,
          },
          {
            id: '2',
            title: 'KI-gestützte Content-Erstellung für Marketing-Agenturen',
            primary_keyword: 'KI Content Marketing',
            traffic_potential: 320,
            effort_score: 3,
            priority_score: 107,
          },
          {
            id: '3',
            title: 'Local SEO für Handwerker: So findest du mehr Kunden',
            primary_keyword: 'Local SEO Handwerker',
            traffic_potential: 280,
            effort_score: 2,
            priority_score: 140,
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) return <div className="text-center py-20">Lade Analyse...</div>;
  if (!analysis) return <div>Analyse nicht gefunden</div>;

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{analysis.domain}</h1>
            <Badge variant="success">{analysis.status}</Badge>
          </div>
          <p className="text-muted-foreground">{analysis.url}</p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'SEO Score', value: analysis.seo_score },
            { label: 'KI Score', value: analysis.ki_score },
            { label: 'Content Score', value: analysis.content_score },
            { label: 'Technical Score', value: analysis.technical_score },
          ].map((score) => (
            <Card key={score.label}>
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${scoreColor(score.value)}`}>
                  {score.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{score.label}</div>
                <Progress value={score.value} className="mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* On-Page Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>On-Page SEO</CardTitle>
              <CardDescription>Übersicht der wichtigsten SEO-Faktoren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seitentitel</span>
                <span className="font-medium">{analysis.page_title ? `${analysis.page_title.substring(0, 40)}...` : 'Nicht gesetzt'} </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meta Description</span>
                <span className="font-medium">{analysis.meta_description ? `${analysis.meta_description.substring(0, 30)}...` : 'Nicht gesetzt'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wortanzahl</span>
                <span className="font-medium">{analysis.word_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H1 / H2 / H3</span>
                <span className="font-medium">{analysis.h1_count} / {analysis.h2_count} / {analysis.h3_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interne / Externe Links</span>
                <span className="font-medium">{analysis.internal_links} / {analysis.external_links}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schema Markup</span>
                <Badge variant={analysis.has_schema ? 'success' : 'destructive'}>
                  {analysis.has_schema ? 'Vorhanden' : 'Fehlt'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Content-Vorschläge
              </CardTitle>
              <CardDescription>
                {analysis.suggestions.length} Unterseiten-Ideen generiert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.suggestions.map((s) => (
                <div key={s.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{s.title}</h4>
                      <Badge variant="secondary" className="mt-1">{s.primary_keyword}</Badge>
                    </div>
                    <Badge variant="success">Priorität: {s.priority_score}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Potenzial: ~{s.traffic_potential}/Monat</span>
                    <span>Aufwand: {s.effort_score}/5</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-1" />
                      Brief erstellen
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
