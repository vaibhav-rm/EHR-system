'use server';

import { auth } from '@/auth';
import { fhirStore } from '@/lib/fhir-store';
import { Communication, Notification } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createNotification(
    recipientId: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string
) {
    try {
        const session = await auth();
        // Allow system notifications even if not logged in? Or enforce sender?
        // For now, allow creation.

        const notification: Communication = {
            resourceType: 'Communication',
            id: crypto.randomUUID(),
            status: 'completed',
            sent: new Date().toISOString(),
            recipient: [{ reference: recipientId }],
            category: [{
                coding: [{
                    system: 'http://medsense.health/notification-type',
                    code: type,
                    display: type
                }]
            }],
            payload: [
                { contentString: message }
            ]
        };

        if (link) {
            notification.payload?.push({
                contentAttachment: {
                    url: link,
                    title: 'Action Link'
                }
            });
        }

        await fhirStore.create(notification);
        // We don't verify success strictly for fire-and-forget notifications, but logging is good
        console.log(`Notification created for ${recipientId}: ${message}`);

        // Improve: Revalidate paths if we knew where they are displayed.
        // revalidatePath('/notifications'); 
        // revalidatePath('/doctor/notifications');

        return { success: true };
    } catch (error) {
        console.error('Failed to create notification:', error);
        return { success: false, error };
    }
}

export async function getUserNotifications(): Promise<Notification[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        // Search for Communications where recipient matches user ID
        // Note: fhirStore.search is generic, we need to filter locally or improve the generic search if possible.
        // For now, using client-side filter capability of fhirStore.search helper if it supports it, 
        // OR fetching recent ones.

        // CRITICAL: fhirStore.search(type, predicate) performs fetching ALL of that type then filtering.
        // This is inefficient but standard for the current fhir-store.ts implementation.
        // We'll proceed with it for this MVP.
        const resources = await fhirStore.search('Communication', (res: any) => {
            // Check if recipient array contains a reference to the user
            return res.recipient?.some((r: any) => r.reference === userId || r.reference === `Patient/${userId}` || r.reference === `Practitioner/${userId}`);
        });

        // Map generic FHIR Communication to our Notification ID
        const notifications: Notification[] = resources.map((comm: any) => ({
            id: comm.id,
            recipientId: userId,
            message: comm.payload?.find((p: any) => p.contentString)?.contentString || "No message",
            type: (comm.category?.[0]?.coding?.[0]?.code as any) || 'info',
            status: 'unread' as const,
            timestamp: comm.sent,
            link: comm.payload?.find((p: any) => p.contentAttachment)?.contentAttachment?.url,
        })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return notifications;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
}
