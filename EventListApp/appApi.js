export const appApi = (() => {

  const getEvents = async () => {
    return await $.get("http://localhost:3000/events");
  };

  const saveEvent = async (event) => {
    await $.post("http://localhost:3000/events", event);
  };

  const deleteEvent = async (id) => {
    await $.ajax({
      url: `http://localhost:3000/events/${id}`,
      type: "DELETE",
    });
    
  };

  const updateEvent = async (event, id) => {

    await $.ajax({
      url: `http://localhost:3000/events/${id}`,
      type: "PUT",
      data: event
    });
  };

  return {
    getEvents,
    saveEvent,
    deleteEvent,
    updateEvent,
  };
})();
