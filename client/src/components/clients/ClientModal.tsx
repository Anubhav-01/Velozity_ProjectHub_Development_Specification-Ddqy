import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Client } from '../../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  client?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSubmit, client }: ClientModalProps) {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setName(client.name);
        setCompanyName(client.companyName);
        setEmail(client.email);
        setPhone(client.phone || '');
      } else {
        setName('');
        setCompanyName('');
        setEmail('');
        setPhone('');
      }
      setError('');
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Contact name is required');
    if (!companyName.trim()) return setError('Company name is required');
    if (!email.trim()) return setError('Email is required');

    setIsLoading(true);
    try {
      await onSubmit({ name, companyName, email, phone: phone || undefined });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to save client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Edit Client' : 'Add New Client'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Acme Innovations"
          required
        />

        <Input
          label="Primary Contact Person"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          required
        />

        <Input
          label="Contact Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. contact@acme.com"
          required
        />

        <Input
          label="Phone Number (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +1-555-0199"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {client ? 'Save Changes' : 'Add Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
