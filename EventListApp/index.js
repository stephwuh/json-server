const eventListContainer = document.querySelector(
  ".event-list__entry-container"
);

const getEventList = (async () => {
  let response = await axios.get("http://localhost:3000/events");

  let tmp = "";

  const convertDate = (unixDate) => {
    const date = new Date(+unixDate);

    return date.toISOString().split("").splice(0, 10).join("");
  };

  response.data.forEach((event) => {
    const startDate = convertDate(event.startDate);
    const endDate = convertDate(event.endDate);

    tmp += `
        <tr id=${event.id} class="event-list__table-row">
        <form>
          <td><input type="text" value=${event.eventName} disabled></td>
          <td><input type="date" value=${startDate} disabled></td>
          <td><input type="date" value=${endDate} disabled></td>
          <td><div>
              <button class="event-list__btn_edit">EDIT</button>
              <button disabled>DELETE</button>
          </div></td>
        </form>
        
      </tr>
      `;
  });

  eventListContainer.innerHTML = tmp;
})();

const addEvent = (() => {
  const addBtn = document.querySelector(".event-list__addBtn");

  const tableRow = document.createElement("tr");
  tableRow.className = "event-list__table-row event-list__table-row_add";
  tableRow.innerHTML = `
    <form>
            <td><input class="new-event-name" type="text"></td>
            <td><input class="new-event-start-date" type="date"></td>
            <td><input class="new-event-end-date" type="date"></td>
            <td><div>
                <button class="event-list__btn_save">SAVE</button>
                <button class="event-list__btn_close">CLOSE</button>
            </div></td>
          </form>
    `;

  addBtn.addEventListener("click", () => {
    eventListContainer.appendChild(tableRow);
  });
})();

const closeEvent = (() => {
  eventListContainer.addEventListener("click", (event) => {
    if (event.target.classList[0] === "event-list__btn_close") {
      eventListContainer.removeChild(eventListContainer.lastChild);
    }
  });
})();

class Event {
  constructor(eventName, startDate, endDate) {
    this.eventName = eventName;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

const saveEvent = (() => {
  eventListContainer.addEventListener("click", async (event) => {
    if (event.target.classList[0] === "event-list__btn_save") {
      const eventName = document.querySelector(".new-event-name").value;

      let startDate = new Date(
        document.querySelector(".new-event-start-date").value
      )
        .getTime()
        .toString();

      let endDate = new Date(
        document.querySelector(".new-event-end-date").value
      )
        .getTime()
        .toString();

      const event = new Event(eventName, startDate, endDate);

      await axios.post("http://localhost:3000/events", event);
    }
  });
})();

const editEvent = (() => {
  eventListContainer.addEventListener("click", async (event) => {
    if (event.target.classList[0] === "event-list__btn_edit") {
      event.target.nextElementSibling.removeAttribute("disabled");

      console.log(event.target.parentNode);
    }
  });
})();
