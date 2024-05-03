import Cookies from "js-cookie";

export async function getWholeConversations() {
  const header = new Headers();
  const jwtToken = Cookies.get("jwt_token");
  if (jwtToken) {
    header.append("authorization", jwtToken);
  }
  const response = fetch(`/api/chat/conversation`, {
    method: "GET",
    headers: header,
  });
  return response;
}

export async function getConversation(id: number) {
  const header = new Headers();
  const jwtToken = Cookies.get("jwt_token");
  if (jwtToken) {
    header.append("authorization", jwtToken);
  }
  const response = fetch(`/api/chat/conversation/${id}`, {
    method: "GET",
    headers: header,
  });
  return response;
}

export async function addConversation(type: number, members: string[]) {
  const header = new Headers();
  const jwtToken = Cookies.get("jwt_token");
  if (jwtToken) {
    header.append("authorization", jwtToken);
  }
  const requestBody = {
    type,
    members,
  };
  const response = fetch(`/api/chat/conversation`, {
    method: "POST",
    headers: header,
    body: JSON.stringify(requestBody),
  });
  return response;
}