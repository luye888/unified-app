'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SummaryPanelProps {
  summary: string;
  onChange: (summary: string) => void;
}

export function SummaryPanel({ summary, onChange }: SummaryPanelProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="summary">摘要</Label>
      <Textarea
        id="summary"
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入笔记摘要..."
        rows={3}
      />
    </div>
  );
}
