import Dexie from "dexie";
import { Friend, FriendRequest, Conversation, ConversationMessage, Message } from "./types";
import { getFriends, getFriendRequests } from "./friend";
import { getWholeConversations, getWholeMessages, getNewMessages, getConversation, readConversation, deleteMessage } from "./chat";

export function updateUnreadFriendRequestsCounts(friendRequests: FriendRequest[]) {
  const newRequests = friendRequests.filter((request) => request.status === "Pending");
  const newRequestsCount = newRequests.length;
  return newRequestsCount;
}

export class CachedFriends extends Dexie {
  friends: Dexie.Table<Friend, number>;
  friendRequests: Dexie.Table<FriendRequest, number>;

  constructor() {
    super("CachedFriends");
    this.version(1).stores({
      friends: "&username, email, tag",
      friendRequests: "&username, nickname, email, status, role, timestamp",
    });
    this.friends = this.table("friends");
    this.friendRequests = this.table("friendRequests");
  }

  async clearCachedData() {
    await this.friends.clear();
    await this.friendRequests.clear();
  }

  async pullFriends() {
    try {
      const res = await getFriends();
      const data = await res.json();
      if (Number(data.code) === 0) {
        this.friends.clear();
        this.friends.bulkPut(data.friends);
      }
      else {
        alert(data.info);
      }
    }
    catch (error: any) {
      alert(error.info);
    }
  }

  async pullFriendRequests() {
    let newRequests: FriendRequest[] = [];
    let unreadCount = 0;
    try {
      const res = await getFriendRequests();
      const data = await res.json();
      if (Number(data.code) === 0) {
        newRequests = data.friends;
        const count = updateUnreadFriendRequestsCounts(newRequests);
        unreadCount = count;
        this.friendRequests.clear();
        this.friendRequests.bulkPut(data.friends);
      }
      else {
        alert(data.info);
      }
    }
    catch (error: any) {
      alert(error.info);
    }
    return unreadCount;
  }

  updateUnreadFriendRequestsCounts(friendRequests: FriendRequest[]) {
    const newRequests = friendRequests.filter((request) => request.status === "Pending");
    const newRequestsCount = newRequests.length;
    return newRequestsCount;
  }

  async getFriendsRequests() {
    const friendRequests = await this.friendRequests.toArray();
    return friendRequests;
  }
}

export class CachedConversations extends Dexie {
  conversations: Dexie.Table<Conversation, number>;
  conversationMessages: Dexie.Table<ConversationMessage, number>;

  constructor() {
    super("CachedConversations");
    this.version(1).stores({
      conversations: "&id, type, members, unread",
      conversationMessages: "&id",
    });
    this.conversations = this.table("conversations");
    this.conversationMessages = this.table("conversationMessages");
  }

  async clearCachedData() {
    await this.conversations.clear();
    await this.conversationMessages.clear();
  }

  async pullWholeConversations() {
    try {
      const res = await getWholeConversations();
      const data = await res.json();
      if (Number(data.code) === 0) {
        this.conversations.clear();
        this.conversations.bulkPut(data.conversations);
        return data.conversations;
      }
      else {
        alert(data.info);
      }
    }
    catch (error: any) {
      alert(error.info);
    }
  }

  async pullWholeConversationMessages() {
    const conversations = await this.pullWholeConversations();
    const conversationUnreadCounts: { [key: number]: number } = {};
    for (const conversation of conversations) {
      try {
        const res = await getWholeMessages(conversation.id);
        const data = await res.json();
        if (Number(data.code) === 0) {
          this.conversationMessages.put({
            id: conversation.id,
            messages: data.messages,
          });
          conversationUnreadCounts[conversation.id] = data.unread;
        }
        else {
          alert(data.info);
        }
      }
      catch (error: any) {
        alert(error.info);
      }
    }
    return conversationUnreadCounts;
  }

  async addNewConversations(conversation: Conversation) {
    await this.conversations.put(conversation);
  }

  async addNewMessage(conversationId: number, message: Message) {
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      conversationMessage.messages.push(message);
      await this.conversationMessages.put(conversationMessage);
      return conversationMessage.messages;
    }
    else {
      const newConversation: ConversationMessage = {
        id: conversationId,
        messages: [message],
      };
      await this.conversationMessages.put(newConversation);
      return [message];
    }
  }

  async pullNewMessages(conversationId: number) {
    const conversationExists = await this.conversations.get(conversationId);
    if (!conversationExists) {
      try {
        const res = await getConversation(conversationId);
        const data = await res.json();
        if (Number(data.code) === 0) {
          await this.conversations.put(data.conversations[0]);
        }
        else {
          alert(data.info);
        }
      }
      catch (error: any) {
        alert(error.info);
      }
    }
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      const lastMessageId = conversationMessage.messages[conversationMessage.messages.length - 1].id;
      try {
        const res = await getNewMessages(conversationId, lastMessageId);
        const data = await res.json();
        if (Number(data.code) === 0) {
          for (const message of data.messages) {
            conversationMessage.messages.push(message);
          }
          await this.conversationMessages.put(conversationMessage);
          return data.unread;
        }
        else {
          alert(data.info);
        }
      }
      catch (error: any) {
        alert(error.info);
      }
    }
    else {
      try {
        const res = await getNewMessages(conversationId, -1);
        const data = await res.json();
        if (Number(data.code) === 0) {
          const newConversation: ConversationMessage = {
            id: conversationId,
            messages: data.messages,
          };
          await this.conversationMessages.put(newConversation);
          return data.unread;
        }
        else {
          alert(data.info);
        }
      }
      catch (error: any) {
        alert(error.info);
      }
    }
  }

  async sendReadConversation(conversationId: number, username: string) {
    const conversationMessage = await this.conversationMessages.get(conversationId);
    try {
      const res = await readConversation(conversationId);
      const data = await res.json();
      if (Number(data.code) === 0) {
        if (conversationMessage) {
          for (const message of conversationMessage.messages) {
            if (message.read.includes(username) === false) {
              message.read.push(username);
            }
          }
          await this.conversationMessages.put(conversationMessage);
          return conversationMessage.messages;
        }
      }
      else {
        alert(data.info);
      }
    }
    catch (error: any) {
      alert(error.info);
    }
  }

  async processReadConversation(conversationId: number, username: string) {
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      for (const message of conversationMessage.messages) {
        if (message.read.includes(username) === false) {
          message.read.push(username);
        }
      }
      await this.conversationMessages.put(conversationMessage);
      return conversationMessage.messages;
    }
  }

  async getMessages(conversationId: number) {
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      return conversationMessage.messages;
    }
    else {
      return [];
    }
  }

  async getMessagesByTime(conversationId: number, time: string) {
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      const targetDate = new Date(time);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const targetDay = targetDate.getDate();
      const filteredMessages = conversationMessage.messages.filter(message => {
        const messageDate  = new Date(message.timestamp);
        const messageYear = messageDate.getFullYear();
        const messageMonth = messageDate.getMonth();
        const messageDay = messageDate.getDate();
        return messageYear === targetYear && messageMonth === targetMonth && messageDay === targetDay;
      });
      return filteredMessages;
    }
    else {
      return [];
    }
}

  async getMessagesByMember(conversationId: number, member: string) {
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      const filteredMessages = conversationMessage.messages.filter(message => message.sender === member);
      return filteredMessages;
    }
    else {
      return [];
    }
  }

  async deleteMessage(conversationId: number, messageId: number) {
    deleteMessage(messageId)
      .then((res) => res.json())
      .then((res) => {
        if (Number(res.code) === 0) {
          alert("You have deleted the message.");
        }
        else {
          alert(res.info);
        }
      })
      .catch((error) => {
        alert(error.info);
      });
    const conversationMessage = await this.conversationMessages.get(conversationId);
    if (conversationMessage) {
      const filteredMessages = conversationMessage.messages.filter(message => message.id !== messageId);
      conversationMessage.messages = filteredMessages;
      await this.conversationMessages.put(conversationMessage);
      return filteredMessages;
    }
  }
}

export const friendsDB = new CachedFriends();
export const conversationsDB = new CachedConversations();