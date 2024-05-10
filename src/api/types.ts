export interface Conversation {
  id: number;
  type: number;
  members: string[];
}

export interface Message {
  id: number;
  conversation: number;
  sender: string;
  content: string;
  timestamp: string;
  read: string[];
  reply_to: number;
  reply_by: number;
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

export interface Group {
  id: number;
  name: string;
  conversation: number;
  master: string;
  manager: string[];
  notice: number[];
}