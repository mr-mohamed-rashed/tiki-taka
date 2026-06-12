import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdBanners } from '@/hooks/useAdBanners';
import { usePageSections } from '@/hooks/usePageSections';
import { useManualNews } from '@/hooks/useManualNews';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCallback, useEffect, useState } from 'react';

type TestStatus = 'loading' | 'success' | 'error' | 'idle';

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  details?: string;
}

export function TestPanel() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  // Use hooks at component level
  const { banners, loading: adsLoading } = useAdBanners();
  const { sections, loading: sectionsLoading } = usePageSections();
  const { news, loading: newsLoading } = useManualNews();
  const { settings, loading: settingsLoading } = useSiteSettings();

  const runTests = useCallback(async () => {
    setTesting(true);
    setResults([]);

    const tests: TestResult[] = [];

    // Test 1: Ad Banners
    if (adsLoading) {
      tests.push({ name: 'Ad Banners Connection', status: 'loading', message: 'Loading...' });
    } else if (banners.length > 0) {
      tests.push({ name: 'Ad Banners Connection', status: 'success', message: `Found ${banners.length} banners`, details: `${banners.filter(b => b.is_active).length} active` });
    } else {
      tests.push({ name: 'Ad Banners Connection', status: 'error', message: 'No banners found', details: 'Add banners in Ads tab' });
    }

    // Test 2: Page Sections
    if (sectionsLoading) {
      tests.push({ name: 'Page Sections Connection', status: 'loading', message: 'Loading...' });
    } else if (sections.length > 0) {
      tests.push({ name: 'Page Sections Connection', status: 'success', message: `Found ${sections.length} sections`, details: `${sections.filter(s => s.is_visible).length} visible` });
    } else {
      tests.push({ name: 'Page Sections Connection', status: 'error', message: 'No sections found', details: 'Add sections in Page Builder' });
    }

    // Test 3: Manual News
    if (newsLoading) {
      tests.push({ name: 'Manual News Connection', status: 'loading', message: 'Loading...' });
    } else if (news.length > 0) {
      tests.push({ name: 'Manual News Connection', status: 'success', message: `Found ${news.length} articles`, details: `${news.filter(n => n.is_published).length} published` });
    } else {
      tests.push({ name: 'Manual News Connection', status: 'error', message: 'No articles found', details: 'Add articles in News tab' });
    }

    // Test 4: Site Settings
    if (settingsLoading) {
      tests.push({ name: 'Site Settings Connection', status: 'loading', message: 'Loading...' });
    } else if (settings.length > 0) {
      tests.push({ name: 'Site Settings Connection', status: 'success', message: `Found ${settings.length} settings`, details: 'Widget labels configured' });
    } else {
      tests.push({ name: 'Site Settings Connection', status: 'error', message: 'No settings found', details: 'Add labels in Labels tab' });
    }

    setResults(tests);
    setTesting(false);
  }, [adsLoading, banners, news, newsLoading, sections, sectionsLoading, settings, settingsLoading]);

  // Auto-run tests on mount
  useEffect(() => {
    if (!adsLoading && !sectionsLoading && !newsLoading && !settingsLoading) {
      runTests();
    }
  }, [adsLoading, sectionsLoading, newsLoading, settingsLoading, runTests]);

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/40">Pass</Badge>;
      case 'error':
        return <Badge className="bg-red-600/20 text-red-400 border-red-600/40">Fail</Badge>;
      case 'loading':
        return <Badge className="bg-primary/20 text-primary border-primary/40">Testing</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">System Health Check</h3>
          <p className="text-sm text-muted-foreground">Test all dashboard integrations and connections</p>
        </div>
        <Button onClick={runTests} disabled={testing} className="gap-2">
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {testing ? 'Testing...' : 'Run Tests'}
        </Button>
      </div>

      {results.length === 0 && !testing && (
        <Card className="p-12 border-dashed border-2">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No tests run yet</p>
            <p className="text-sm text-muted-foreground">Click "Run Tests" to verify all dashboard integrations</p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {results.map((test, index) => (
          <Card key={index} className="p-4 border-border bg-gradient-card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(test.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{test.name}</h4>
                  {getStatusBadge(test.status)}
                </div>
                <p className="text-sm text-muted-foreground">{test.message}</p>
                {test.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{test.details}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {results.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <p className="text-sm text-primary font-semibold">
              {results.filter(r => r.status === 'success').length} / {results.length} tests passed
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
