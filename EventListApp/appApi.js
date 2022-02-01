export const appApi = (() => {
  const getEvents = async () => {
    let response = await axios.get("http://localhost:3000/events");

    return response.data;
  };

  const saveEvent = async (event) => {
    await axios.post("http://localhost:3000/events", event);
  };

  const deleteEvent = async (id) => {
    await axios.delete(`http://localhost:3000/events/${id}`);
  };

  return {
    getEvents,
    saveEvent,
    deleteEvent,
  };
})();
