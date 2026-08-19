import { Injectable, ForbiddenException } from '@nestjs/common';
import { createAIService, AIProvider } from '@businessos/ai';
import { AuthSession, hasPermission } from '@businessos/auth';

@Injectable()
export class AIService {
  private getAiInstance(provider: AIProvider = 'openai') {
    return createAIService(provider);
  }

  async processUserCommand(session: AuthSession, prompt: string, provider: AIProvider = 'openai') {
    // Check permission to execute AI Commands
    if (!hasPermission(session.role, 'ai:execute')) {
      throw new ForbiddenException(`Role '${session.role}' is not authorized to execute AI commands.`);
    }

    const ai = this.getAiInstance(provider);
    return await ai.processUserCommand(prompt, session);
  }
}
