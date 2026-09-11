import React from 'react';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ActivityPage() {
  const { data: activities, isLoading, refetch, isRefetching } = useActivityFeed();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Feed</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time audit log of team actions, task progressions, and assignments
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <CardTitle>Recent Team Events</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          <ActivityFeed activities={activities} isLoading={isLoading} />
        </CardBody>
      </Card>
    </div>
  );
}
