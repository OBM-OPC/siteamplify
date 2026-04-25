'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, FileText, TrendingUp, Check, ArrowRight } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    
    // Simulate progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => router.push('/dashboard'), 500);
      }
      setProgress(Math.min(p, 100));
    }, 500);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            Beta — Jetzt kostenlos testen
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            SEO + KI Visibility
            <br />
            <span className="text-primary">Booster</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Gib eine URL ein. In weniger als 2 Minuten weißt du exakt, 
            welche Unterseiten fehlen — mit fertigen Content-Briefs 
            generiert von KI.
          </p>
          
          {/* URL Input */}
          <div className="mx-auto max-w-xl">
            {!isAnalyzing ? (
              <div className="flex gap-2">
                <Input
                  placeholder="https://deine-website.de"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 text-lg"
                />
                <Button size="lg" onClick={handleAnalyze} className="px-8">
                  <Search className="w-4 h-4 mr-2" />
                  Analysieren
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analysiere {url}...</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
                <div className="flex gap-2 justify-center text-sm text-muted-foreground">
                  <span className={progress > 20 ? 'text-green-600' : ''}>Crawling</span>
                  <span>→</span>
                  <span className={progress > 50 ? 'text-green-600' : ''}>SEO-Analyse</span>
                  <span>→</span>
                  <span className={progress > 80 ? 'text-green-600' : ''}>Vorschläge</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            In 3 Schritten zum besseren Ranking
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Search className="w-10 h-10 text-primary mb-4" />
                <CardTitle>1. Analysieren</CardTitle>
                <CardDescription>
                  Crawle & audit deine URL. Prüfe On-Page SEO, 
                  Content-Qualität und KI-Readiness.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <CardTitle>2. Vergleichen</CardTitle>
                <CardDescription>
                  Identifiziere Content-Lücken vs. Top-Konkurrenten. 
                  Sieh, welche Themen du verpasst.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-4" />
                <CardTitle>3. Generieren</CardTitle>
                <CardDescription>
                  Erstelle passende Unterseiten-Ideen + Content-Briefs. 
                  Generiere Texte mit einem Klick.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Preise</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Free', price: '0€', desc: 'Zum Ausprobieren', features: ['1 Analyse/Monat', '3 Vorschläge', 'Keine Generierung'] },
              { name: 'Pro', price: '29€/Monat', desc: 'Für Freelancer', features: ['20 Analysen/Monat', 'Unbegrenzte Vorschläge', '10 Content-Briefs', 'Export'], popular: true },
              { name: 'Agency', price: '99€/Monat', desc: 'Für Agenturen', features: ['100 Analysen', 'Unbegrenzte Briefs', 'API-Zugang', 'White-Label'] },
            ].map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-primary ring-1 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.popular && <Badge variant="success">Beliebt</Badge>}
                  </div>
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
