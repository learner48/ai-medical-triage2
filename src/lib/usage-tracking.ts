import { supabase } from './supabase';

export type MetricType = 
  | 'triage_count'
  | 'video_minutes'
  | 'sms_sent'
  | 'email_sent'
  | 'ehr_api_calls'
  | 'elevenlabs_char_stt'
  | 'elevenlabs_char_tts';

export async function trackUsage(
  organizationId: string,
  metricType: MetricType,
  value: number
) {
  try {
    const { error } = await supabase
      .from('usage_metrics')
      .insert([
        {
          organization_id: organizationId,
          metric_type: metricType,
          value: value,
          date_recorded: new Date().toISOString().split('T')[0]
        }
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking usage:', error);
    throw error;
  }
}

export async function getUsageMetrics(
  organizationId: string,
  startDate: string,
  endDate: string
) {
  try {
    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date_recorded', startDate)
      .lte('date_recorded', endDate);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    throw error;
  }
}