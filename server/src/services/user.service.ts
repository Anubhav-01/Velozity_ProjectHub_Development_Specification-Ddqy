import { Role } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password';
import { ApiError } from '../utils/ApiError';
import { CreateUserInput, UpdateUserInput } from '../validators/schemas';

export const userService = {
  async findAll(filters?: { role?: Role }) {
    return userRepository.findAll(filters);
  },

  async findById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User');
    return user;
  },

  async create(input: CreateUserInput) {
    // Check for duplicate email
    const existing = await userRepository.existsByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(`A user with email ${input.email} already exists`);
    }

    const passwordHash = await hashPassword(input.password);
    return userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });
  },

  async update(id: string, input: UpdateUserInput) {
    // Ensure user exists
    const existing = await userRepository.findById(id);
    if (!existing) throw ApiError.notFound('User');

    // Check email uniqueness if changing email
    if (input.email && input.email !== existing.email) {
      const emailTaken = await userRepository.existsByEmail(input.email);
      if (emailTaken) {
        throw ApiError.conflict(`Email ${input.email} is already in use`);
      }
    }

    const updateData: Record<string, unknown> = { ...input };

    if (input.password) {
      updateData.passwordHash = await hashPassword(input.password);
      delete updateData.password;
    }

    return userRepository.update(id, updateData);
  },

  async delete(id: string) {
    const existing = await userRepository.findById(id);
    if (!existing) throw ApiError.notFound('User');
    await userRepository.delete(id);
  },

  async findDevelopers() {
    return userRepository.findDevelopers();
  },
};
