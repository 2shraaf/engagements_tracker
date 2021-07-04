export enum IConversationType {
  POST = 'post',
}
export enum IConversationSource {
  FACEBOOK = 'facebook',
}
export interface IConversation {
  id: string;
  type: IConversationType;
  source: IConversationSource;
  link: string;
  username: string;
  engagements: { [Key: string]: number };
}

export interface ITrackedConversation {
  id: string;
  type: IConversationType;
  source: IConversationSource;
  link: string;
  username: string;
  engagements: { [Key: string]: number };
  total_engagements: number;
}
