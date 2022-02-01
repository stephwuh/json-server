import { appApi } from "./appApi.js";
import { fromUnixDate, toUnixDate } from "./utils.js";

const eventListContainer = document.querySelector(
  ".event-list__entry-container"
);

const getEventList = (async (appApi, convertDate) => {
  const events = await appApi.getEvents();

  let tmp = "";

  events.forEach((event) => {
    const startDate = convertDate(event.startDate);
    const endDate = convertDate(event.endDate);

    tmp += `
        <tr id=${event.id} class="event-list__table-row">
        <form>
          <td><input type="text" class="event-list__name-${event.id}" value=${event.eventName} disabled></td>
          <td><input type="date" class="event-list__start-date-${event.id}" value=${startDate} disabled></td>
          <td><input type="date" class="event-list__end-date-${event.id}" value=${endDate} disabled></td>
          <td><div>
              <button id=${event.id} class="event-list__btn_edit">EDIT</button>
              <button id=${event.id} class="event-list__btn_delete">DELETE</button>
          </div></td>
        </form>
        
      </tr>
      `;
  });

  eventListContainer.innerHTML = tmp;
})(appApi, fromUnixDate);

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

const saveEvent = ((appApi, convertDate) => {
  eventListContainer.addEventListener("click", async (event) => {
    if (event.target.classList[0] === "event-list__btn_save") {
      const eventName = document.querySelector(".new-event-name").value;

      let startDate = convertDate(
        document.querySelector(".new-event-start-date").value
      );

      let endDate = convertDate(
        document.querySelector(".new-event-end-date").value
      );

      if (!eventName || !startDate || !endDate) {
        alert("Input all of the required fields");
        return;
      }
      const event = new Event(eventName, startDate, endDate);

      await appApi.saveEvent(event);
    }
  });
})(appApi, toUnixDate);

const deleteEvent = ((appApi) => {
  eventListContainer.addEventListener("click", async (event) => {
    if (event.target.classList[0] === "event-list__btn_delete") {
      const buttonId = event.target.getAttribute("id");

      await appApi.deleteEvent(buttonId);
    }
  });
})(appApi);


