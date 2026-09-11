import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Role } from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User | null;
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('DEVELOPER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setRole(user.role);
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setRole('DEVELOPER');
      }
      setError('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Name is required');
    if (!email.trim()) return setError('Email is required');
    if (!user && !password) return setError('Password is required for new users');

    setIsLoading(true);
    try {
      const payload: any = { name, email, role };
      if (password) payload.password = password;

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Create New User'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah Connor"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. sarah@velozity.dev"
          required
        />

        <Input
          label={user ? 'New Password (leave blank to keep current)' : 'Password'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={user ? '••••••••' : 'Min 8 chars, 1 uppercase, 1 number'}
          required={!user}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="DEVELOPER">DEVELOPER</option>
            <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
