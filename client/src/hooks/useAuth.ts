import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '../socket/socket.client';

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.clear();
      navigate('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role?: string }) =>
      authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.clear();
      navigate('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      disconnectSocket();
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
