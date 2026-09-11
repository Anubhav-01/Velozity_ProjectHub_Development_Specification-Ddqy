import { clientRepository } from '../repositories/client.repository';
import { ApiError } from '../utils/ApiError';
import { CreateClientInput, UpdateClientInput } from '../validators/schemas';

export const clientService = {
  async findAll() {
    return clientRepository.findAll();
  },

  async findById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) throw ApiError.notFound('Client');
    return client;
  },

  async create(input: CreateClientInput) {
    const existing = await clientRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(`A client with email ${input.email} already exists`);
    }
    return clientRepository.create(input);
  },

  async update(id: string, input: UpdateClientInput) {
    const existing = await clientRepository.findById(id);
    if (!existing) throw ApiError.notFound('Client');

    if (input.email && input.email !== existing.email) {
      const emailTaken = await clientRepository.findByEmail(input.email);
      if (emailTaken) throw ApiError.conflict(`Email ${input.email} is already in use`);
    }

    return clientRepository.update(id, input);
  },

  async delete(id: string) {
    const existing = await clientRepository.findById(id);
    if (!existing) throw ApiError.notFound('Client');
    await clientRepository.delete(id);
  },
};
