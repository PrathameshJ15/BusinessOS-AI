import { Injectable } from '@nestjs/common';
import { mockTasks } from '@businessos/database';

@Injectable()
export class TasksService {
  private tasks = [...mockTasks];

  async getTasks(organizationId: string) {
    return this.tasks;
  }

  async toggleTaskStatus(taskId: string) {
    this.tasks = this.tasks.map((t) =>
      t.id === taskId ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } : t
    );
    return this.tasks.find((t) => t.id === taskId);
  }
}
