import { projectService } from '../services/project.service';
import { projectRepository } from '../repositories/project.repository';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

jest.mock('../repositories/project.repository');

describe('Resource-level Authorization: Project & Task Access', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PM Cross-Project Access Prevention', () => {
    it('should deny PM access to another PM’s project', async () => {
      // Mock project created by PM1
      (projectRepository.findById as jest.Mock).mockResolvedValue({
        id: 'proj-1',
        name: 'Alpha Project',
        createdById: 'pm-1',
      });

      // PM2 attempts to access PM1's project
      const pm2User = { userId: 'pm-2', role: Role.PROJECT_MANAGER };

      await expect(
        projectService.findById('proj-1', pm2User)
      ).rejects.toThrow(ApiError);

      try {
        await projectService.findById('proj-1', pm2User);
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.message).toContain('You do not have access to this project');
      }
    });

    it('should allow PM access to their own project', async () => {
      (projectRepository.findById as jest.Mock).mockResolvedValue({
        id: 'proj-1',
        name: 'Alpha Project',
        createdById: 'pm-1',
      });

      const pm1User = { userId: 'pm-1', role: Role.PROJECT_MANAGER };
      const project = await projectService.findById('proj-1', pm1User);

      expect(project).toBeDefined();
      expect(project.id).toBe('proj-1');
    });

    it('should allow Admin access to any project', async () => {
      (projectRepository.findById as jest.Mock).mockResolvedValue({
        id: 'proj-1',
        name: 'Alpha Project',
        createdById: 'pm-1',
      });

      const adminUser = { userId: 'admin-1', role: Role.ADMIN };
      const project = await projectService.findById('proj-1', adminUser);

      expect(project).toBeDefined();
      expect(project.id).toBe('proj-1');
    });
  });
});
