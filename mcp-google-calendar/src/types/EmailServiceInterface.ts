export interface IEmailService {
  sendMeetingReminder(params: {
    recipientEmail: string;
    recipientName: string;
    meetingTitle: string;
    meetingDate: Date;
    meetingLocation?: string;
    reminderType: '1_hour' | '3_hours' | '24_hours';
    professionalName?: string;
    meetingDescription?: string;
  }): Promise<{ success: boolean; error?: string }>;
}
