export interface Conversation {
  id: number;
  type: number;
  members: string[];
  unread: number;
}

export interface Message {
  id: number;
  conversation: number;
  sender: string;
  content: string;
  timestamp: string;
  read: string[];
  unread: string[];
  reply_to: number;
  reply_by: string[];
}

export interface ConversationMessage {
  id: number;
  messages: Message[];
}

export interface Friend {
  username: string;
  email: string;
  tag: string;
}

export interface FriendRequest {
  username: string;
  nickname: string;
  email: string;
  status: "Pending" | "Accept" | "Reject";
  role: "receiver" | "sender";
  timestamp: string;
}