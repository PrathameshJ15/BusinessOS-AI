import { prisma } from '../prisma';

export async function getDashboardStats(organizationId: string, userId: string) {
  try {
    const [
      customersCount,
      bookings,
      tasks,
      leads,
      invoices,
      aiUsage,
      recentActivities,
    ] = await Promise.all([
      prisma.customer.count({ where: { organizationId } }),
      prisma.booking.findMany({
        where: { organizationId },
        orderBy: { startTime: 'asc' },
      }),
      prisma.task.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { organizationId },
      }),
      prisma.invoice.findMany({
        where: { organizationId },
      }),
      prisma.aiUsage.findUnique({
        where: { userId },
      }),
      prisma.aiMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { conversation: { select: { title: true, userId: true } } },
      }),
    ]);

    const revenueThisMonth = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((acc, i) => acc + i.total, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const revenueToday = invoices
      .filter((i) => i.status === 'PAID' && i.createdAt.toISOString().startsWith(todayStr))
      .reduce((acc, i) => acc + i.total, 0);

    const pendingTasksCount = tasks.filter((t) => t.status !== 'DONE').length;
    const todayAppointments = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
    const totalPipelineValue = leads.reduce((acc, l) => acc + l.estimatedValue, 0);

    return {
      totalCustomers: customersCount,
      activeProjects: tasks.length,
      pendingTasksCount,
      todayAppointmentsCount: todayAppointments.length,
      upcomingAppointmentsCount: bookings.length,
      revenueThisMonth,
      revenueToday,
      totalPipelineValue,
      aiRequestsToday: aiUsage?.dailyRequests || 0,
      monthlyAiRequests: aiUsage?.monthlyRequests || 0,
      tokensUsed: aiUsage?.tokensUsed || 0,
      tasks,
      recentActivities: recentActivities.map((act) => ({
        id: act.id,
        title: act.role === 'user' ? 'User AI Query' : 'Saarthi AI Response',
        description: act.content.slice(0, 80) + (act.content.length > 80 ? '...' : ''),
        time: new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: act.role,
      })),
    };
  } catch (error) {
    console.error('[getDashboardStats] Error querying Prisma database:', error);
    return {
      totalCustomers: 0,
      activeProjects: 0,
      pendingTasksCount: 0,
      todayAppointmentsCount: 0,
      upcomingAppointmentsCount: 0,
      revenueThisMonth: 0,
      revenueToday: 0,
      totalPipelineValue: 0,
      aiRequestsToday: 0,
      monthlyAiRequests: 0,
      tokensUsed: 0,
      tasks: [],
      recentActivities: [],
    };
  }
}
