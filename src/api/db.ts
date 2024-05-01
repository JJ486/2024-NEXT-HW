import Dexie from "dexie";
import { Friend, FriendRequest } from "./types";
import { getFriends, getFriendRequests } from "./friend";

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

export const friendsDB = new CachedFriends();