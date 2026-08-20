import { prisma } from '../prisma';

export async function getUserAIUsage(userId: string) {
  try {
    const usage = await prisma.aiUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      return {
        dailyRequests: 0,
        monthlyRequests: 0,
        tokensUsed: 0,
        lastRequestAt: null,
      };
    }

    return {
      dailyRequests: usage.dailyRequests,
      monthlyRequests: usage.monthlyRequests,
      tokensUsed: usage.tokensUsed,
      lastRequestAt: usage.lastRequestAt?.toISOString() || null,
    };
  } catch (error) {
    console.error('[getUserAIUsage] Error fetching usage from Prisma:', error);
    return {
      dailyRequests: 0,
      monthlyRequests: 0,
      tokensUsed: 0,
      lastRequestAt: null,
    };
  }
}
