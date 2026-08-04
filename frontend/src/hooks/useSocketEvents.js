import { useEffect } from "react";

function useSocketEvents({
  socket,
  user,
  activeChatTaskId,
  setNotifications,
  updateTaskInState,
  setMessages,
}) {
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join", user.id);

    const handleNotification = (notification) => {
      setNotifications((prev) => [
        notification,
        ...prev,
      ]);

      alert(notification.message);
    };

    const handleRunnerLocation = (task) => {
      updateTaskInState(task);
    };

    const handleTaskUpdated = (task) => {
      updateTaskInState(task);
    };

    const handleNewMessage = (message) => {
      if (message.taskId === activeChatTaskId) {
        setMessages((prev) => [
          ...prev,
          message,
        ]);
      }
    };

    socket.on(
      "notification",
      handleNotification
    );

    socket.on(
      "runnerLocationUpdated",
      handleRunnerLocation
    );

    socket.on(
      "taskUpdated",
      handleTaskUpdated
    );

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {
      socket.off(
        "notification",
        handleNotification
      );

      socket.off(
        "runnerLocationUpdated",
        handleRunnerLocation
      );

      socket.off(
        "taskUpdated",
        handleTaskUpdated
      );

      socket.off(
        "newMessage",
        handleNewMessage
      );
    };
  }, [
    socket,
    user?.id,
    activeChatTaskId,
    setNotifications,
    updateTaskInState,
    setMessages,
  ]);
}

export default useSocketEvents;