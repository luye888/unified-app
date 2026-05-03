'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  pageType: string;
  pageId: string;
}

export default function AnalyticsTracker({ pageType, pageId }: AnalyticsTrackerProps) {
  useEffect(() => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_type: pageType, page_id: pageId }),
    }).catch(() => {
      // Silently ignore analytics errors
    });
  }, [pageType, pageId]);

  return null;
}
