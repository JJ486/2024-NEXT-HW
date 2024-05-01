import { useEffect } from "react";
import Cookies from "js-cookie";

export const useFriendListener = (fn: () => void) => {
  const jwtToken = Cookies.get("jwt_token");
  useEffect(() => {
    let ws: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`ws://backend-dev-Capybara.app.secoder.net/ws/?jwt=${jwtToken}`);

      ws.onopen = () => {
        console.log("WebSocket Connected");
      };

      ws.onmessage = async (event) => {
        if (event.data === "new friend request") fn();
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