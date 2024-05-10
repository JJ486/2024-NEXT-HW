import { useEffect } from "react";
import Cookies from "js-cookie";

export const useWebsocketListener = (fn: (arg1?: string, args2?: string) => void, type: number) => {
  const jwtToken = Cookies.get("jwt_token");
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`wss://backend-dev-Capybara.app.secoder.net/ws/?jwt=${jwtToken}`);

      ws.onopen = () => {
        console.log("WebSocket Connected");
      };

      ws.onmessage = async (event) => {
        console.log(event.data);
        if (type === 0) {
          if (event.data === "new friend request") fn();
        }
        else if (type === 1) {
          if (event.data.substring(0, 16) === "new friend added"){
            const friendname = event.data.substring(17);
            fn(friendname);
          }
        }
        else if (type === 2) {
          if (event.data.substring(0, 21) === "message has been read"){
            const parts = event.data.split(" ");
            const username = parts[4];
            const conversationid = parts[5];
            fn(username, conversationid);
          }
        }
        else if (type === 3) {
          if (event.data.substring(0, 27) === "new message in conversation") {
            const conversationid = event.data.substring(28);
            fn(conversationid);
          }
        }
        else if (type === 4) {
          if (event.data === "new group request") fn();
        }
        else if (type === 5) {
          if (event.data === "new group invitation") fn();
        }
      };

      ws.onclose = () => {
        console.log("WebSocket Disconnected");
        if (!closed) {
          console.log("Attempting to reconnect...");
          setTimeout(() => {
            connect();
          }, 1000);
        }
      };
    };

    connect();

    return () => {
      if (ws) {
        closed = true;
        ws.close();
      }
    };
  }, [fn]);
};