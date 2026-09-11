import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services/activity.service';

export function useActivityFeed(params?: { projectId?: string; taskId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['activity', params],
    queryFn: () => {
      if (params?.projectId) {
        return activityService.getProjectActivity(params.projectId, { limit: params.limit });
      }
      if (params?.taskId) {
        return activityService.getTaskActivity(params.taskId, { limit: params.limit });
      }
      return activityService.getActivity({ limit: params?.limit });
    },
  });
}
