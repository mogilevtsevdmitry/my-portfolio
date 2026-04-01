export type FunnelEvent =
  | 'hero_cta_click'
  | 'project_view'
  | 'project_cta_click'
  | 'contact_form_open'
  | 'contact_submit'
  | 'blog_post_view';

export interface CreateAnalyticsEventDto {
  event: FunnelEvent;
  payload?: Record<string, string>;
  sessionId?: string;
}
