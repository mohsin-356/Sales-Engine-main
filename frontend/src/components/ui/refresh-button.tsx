import { Button } from './button';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onRefresh: () => Promise<void> | void;
  children?: React.ReactNode;
};

export function RefreshButton({ onRefresh, children }: Props) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    try { setLoading(true); await onRefresh(); } finally { setLoading(false); }
  };
  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading}>
      <RotateCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {children ?? (loading ? 'Refreshing...' : 'Refresh')}
    </Button>
  );
}
