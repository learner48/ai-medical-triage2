import { supabase } from './supabase';

export type NotificationType = 'sms' | 'email' | 'in_app' | 'hospital_system_alert';

export interface Notification {
  id: string;
  recipient_user_id: string;
  notification_type: NotificationType;
  message_content: string;
  related_entity_type?: string;
  related_entity_id?: string;
  status: 'pending' | 'sent' | 'failed' | 'read' | 'dismissed';
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

class NotificationService {
  private async createNotification(data: Partial<Notification>) {
    const { error } = await supabase
      .from('notifications')
      .insert([data]);
    
    if (error) throw error;
  }

  async sendInAppNotification(userId: string, message: string, entityType?: string, entityId?: string) {
    await this.createNotification({
      recipient_user_id: userId,
      notification_type: 'in_app',
      message_content: message,
      related_entity_type: entityType,
      related_entity_id: entityId,
      status: 'sent',
      sent_at: new Date().toISOString()
    });
  }

  async sendSMSNotification(userId: string, message: string) {
    try {
      // Get user's phone number
      const { data: user } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', userId)
        .single();

      if (!user?.phone_number) {
        throw new Error('User has no phone number');
      }

      // Create notification record
      await this.createNotification({
        recipient_user_id: userId,
        notification_type: 'sms',
        message_content: message,
        status: 'pending'
      });

      // TODO: Integrate with Twilio for actual SMS sending
      // For now, just mark as sent
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('recipient_user_id', userId)
        .eq('notification_type', 'sms')
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(userId: string, message: string) {
    try {
      // Get user's email
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (!user?.email) {
        throw new Error('User has no email');
      }

      // Create notification record
      await this.createNotification({
        recipient_user_id: userId,
        notification_type: 'email',
        message_content: message,
        status: 'pending'
      });

      // TODO: Integrate with SendGrid/Brevo for actual email sending
      // For now, just mark as sent
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('recipient_user_id', userId)
        .eq('notification_type', 'email')
        .eq('status', 'pending');

      if (error) throw error;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async dismissNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'dismissed'
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async getUnreadNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', userId)
      .in('status', ['sent', 'pending'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }
}

export const notificationService = new NotificationService();