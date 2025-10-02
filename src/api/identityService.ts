import { Identity, TaskCompletion } from '@/models/types';

// localStorage keys
const STORAGE_KEYS = {
  IDENTITIES: 'identity-evolution-identities',
  TASK_COMPLETIONS: 'identity-evolution-completions',
  CHARACTER: 'identity-evolution-character',
  GAME_STATS: 'identity-evolution-stats',
};

// Types for API responses (future-proofing for backend)
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CreateIdentityRequest {
  name: string;
  description: string;
  dailyTask: string;
  isActive: boolean;
}

export interface UpdateIdentityRequest {
  id: string;
  updates: Partial<Identity>;
}

export interface TaskCompletionRequest {
  identityId: string;
  date: Date;
  xpGained: number;
}

/**
 * Identity Service - Abstracts data persistence
 * Currently uses localStorage but ready for backend integration
 */
export class IdentityService {
  /**
   * Get all identities
   */
  static async getIdentities(): Promise<ApiResponse<Identity[]>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IDENTITIES);
      const identities = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      const parsedIdentities = identities.map((identity: any) => ({
        ...identity,
        createdAt: new Date(identity.createdAt),
        lastCompletedTask: identity.lastCompletedTask ? new Date(identity.lastCompletedTask) : undefined,
      }));

      return {
        data: parsedIdentities,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get identities:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to load identities',
      };
    }
  }

  /**
   * Save a new identity
   */
  static async saveIdentity(request: CreateIdentityRequest): Promise<ApiResponse<Identity>> {
    try {
      const identitiesResponse = await this.getIdentities();
      const existingIdentities = identitiesResponse.data;

      const newIdentity: Identity = {
        id: Date.now().toString(),
        name: request.name,
        description: request.description,
        dailyTask: request.dailyTask,
        isActive: request.isActive,
        level: 1,
        xp: 0,
        xpToNextLevel: 50, // 50 * 1
        evolutionStage: 'novice',
        createdAt: new Date(),
      };

      const updatedIdentities = [...existingIdentities, newIdentity];
      localStorage.setItem(STORAGE_KEYS.IDENTITIES, JSON.stringify(updatedIdentities));

      return {
        data: newIdentity,
        success: true,
        message: 'Identity created successfully',
      };
    } catch (error) {
      console.error('Failed to save identity:', error);
      return {
        data: {} as Identity,
        success: false,
        message: 'Failed to create identity',
      };
    }
  }

  /**
   * Update an existing identity
   */
  static async updateIdentity(request: UpdateIdentityRequest): Promise<ApiResponse<Identity>> {
    try {
      const identitiesResponse = await this.getIdentities();
      const identities = identitiesResponse.data;

      const identityIndex = identities.findIndex(i => i.id === request.id);
      if (identityIndex === -1) {
        return {
          data: {} as Identity,
          success: false,
          message: 'Identity not found',
        };
      }

      const updatedIdentity = {
        ...identities[identityIndex],
        ...request.updates,
      };

      identities[identityIndex] = updatedIdentity;
      localStorage.setItem(STORAGE_KEYS.IDENTITIES, JSON.stringify(identities));

      return {
        data: updatedIdentity,
        success: true,
        message: 'Identity updated successfully',
      };
    } catch (error) {
      console.error('Failed to update identity:', error);
      return {
        data: {} as Identity,
        success: false,
        message: 'Failed to update identity',
      };
    }
  }

  /**
   * Delete an identity
   */
  static async deleteIdentity(id: string): Promise<ApiResponse<boolean>> {
    try {
      const identitiesResponse = await this.getIdentities();
      const identities = identitiesResponse.data;

      const filteredIdentities = identities.filter(i => i.id !== id);
      localStorage.setItem(STORAGE_KEYS.IDENTITIES, JSON.stringify(filteredIdentities));

      // Also remove related task completions
      const completionsResponse = await this.getTaskCompletions();
      const filteredCompletions = completionsResponse.data.filter(c => c.identityId !== id);
      localStorage.setItem(STORAGE_KEYS.TASK_COMPLETIONS, JSON.stringify(filteredCompletions));

      return {
        data: true,
        success: true,
        message: 'Identity deleted successfully',
      };
    } catch (error) {
      console.error('Failed to delete identity:', error);
      return {
        data: false,
        success: false,
        message: 'Failed to delete identity',
      };
    }
  }

  /**
   * Get all task completions
   */
  static async getTaskCompletions(): Promise<ApiResponse<TaskCompletion[]>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASK_COMPLETIONS);
      const completions = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      const parsedCompletions = completions.map((completion: any) => ({
        ...completion,
        date: new Date(completion.date),
      }));

      return {
        data: parsedCompletions,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get task completions:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to load task completions',
      };
    }
  }

  /**
   * Log a task completion
   */
  static async logTaskCompletion(request: TaskCompletionRequest): Promise<ApiResponse<TaskCompletion>> {
    try {
      const completionsResponse = await this.getTaskCompletions();
      const existingCompletions = completionsResponse.data;

      const newCompletion: TaskCompletion = {
        id: Date.now().toString(),
        identityId: request.identityId,
        date: request.date,
        completed: true,
        xpGained: request.xpGained,
      };

      const updatedCompletions = [...existingCompletions, newCompletion];
      localStorage.setItem(STORAGE_KEYS.TASK_COMPLETIONS, JSON.stringify(updatedCompletions));

      return {
        data: newCompletion,
        success: true,
        message: 'Task completion logged',
      };
    } catch (error) {
      console.error('Failed to log task completion:', error);
      return {
        data: {} as TaskCompletion,
        success: false,
        message: 'Failed to log task completion',
      };
    }
  }

  /**
   * Get task completions for a specific identity
   */
  static async getTaskCompletionsForIdentity(identityId: string): Promise<ApiResponse<TaskCompletion[]>> {
    try {
      const completionsResponse = await this.getTaskCompletions();
      const filteredCompletions = completionsResponse.data.filter(c => c.identityId === identityId);

      return {
        data: filteredCompletions,
        success: true,
      };
    } catch (error) {
      console.error('Failed to get task completions for identity:', error);
      return {
        data: [],
        success: false,
        message: 'Failed to load task completions',
      };
    }
  }

  /**
   * Check if task was completed today for an identity
   */
  static async wasTaskCompletedToday(identityId: string): Promise<ApiResponse<boolean>> {
    try {
      const completionsResponse = await this.getTaskCompletionsForIdentity(identityId);
      const today = new Date();
      
      const completedToday = completionsResponse.data.some(completion => {
        const completionDate = new Date(completion.date);
        return (
          completionDate.getDate() === today.getDate() &&
          completionDate.getMonth() === today.getMonth() &&
          completionDate.getFullYear() === today.getFullYear()
        );
      });

      return {
        data: completedToday,
        success: true,
      };
    } catch (error) {
      console.error('Failed to check if task was completed today:', error);
      return {
        data: false,
        success: false,
        message: 'Failed to check task completion',
      };
    }
  }
}
