import {
  reducer,
  init,
  NotificationActions,
  NotificationType
} from "../reducers/notifications";

// REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION",
//   ADD_NOTIFICATION = "ADD_NOTIFICATION",
//   SORT_NOTIFICATIONS = "SORT_NOTIFICATIONS"

const defaultState = init([]);

describe("Notifications", () => {
  it("has default state", () => {
    expect(defaultState.notifications).toHaveLength(0);
  });

  it("adds notification", () => {
    const state = reducer(defaultState, {
      type: NotificationActions.ADD_NOTIFICATION,
      payload: {
        text: "New Notification",
        dismissable: false,
        type: NotificationType.DEFAULT
      }
    });

    const newState = reducer(state, {
      type: NotificationActions.ADD_NOTIFICATION,
      payload: {
        text: "New Notification",
        dismissable: false,
        type: NotificationType.ERROR
      }
    });

    expect(state.notifications).toHaveLength(1);
    expect(newState.notifications).toHaveLength(2);
  });

  it("removes notification", () => {
    const state = reducer(defaultState, {
      type: NotificationActions.ADD_NOTIFICATION,
      payload: {
        text: "New Notification",
        dismissable: false,
        type: NotificationType.DEFAULT
      }
    });

    const newState = reducer(state, {
      type: NotificationActions.REMOVE_NOTIFICATION,
      payload: state.notifications[0]
    });

    expect(state.notifications).toHaveLength(1);
    expect(newState.notifications).toHaveLength(0);
  });
});
