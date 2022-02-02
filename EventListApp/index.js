import { appApi } from "./appApi.js";
import { fromUnixDate, toUnixDate } from "./utils.js";

const eventListContainer = document.querySelector(
  ".event-list__entry-container"
);
const paginationContainer = document.querySelector(".event-list__pagination");
const nextPageBtn = document.querySelector(".event-list__next-page-button");
const previousPageBtn = document.querySelector(
  ".event-list__previous-page-button"
);

let pageNumber = 1;
// let lastPageNumber;

const getEventList = async (appApi, convertDate) => {
  //events from JSON server
  const events = await appApi.getEvents();

  let tmpEvent = "";
  let tmpPagination = "";

  let pagesNeeded = Math.ceil(events.length / 4);

  let renderEventArr = [];

  for (let i = 1; i <= pagesNeeded; i++) {
    let startIndex = (i - 1) * 4;

    renderEventArr.push(events.slice(startIndex, startIndex + 4));
  }

  // lastPageNumber = renderEventArr.length;

  renderEventArr[pageNumber - 1].forEach((event) => {
    const startDate = convertDate(event.startDate);
    const endDate = convertDate(event.endDate);

    tmpEvent += `
        <tr id=${event.id} class="event-list__table-row">
        <form>
          <td><input type="text" class="event-list__name-${event.id}" value=${event.eventName} disabled></td>
          <td><input type="date" class="event-list__start-date-${event.id}" value=${startDate} disabled></td>
          <td><input type="date" class="event-list__end-date-${event.id}" value=${endDate} disabled></td>
          <td><div class="button-container-${event.id}"> 
              <button id=${event.id} class="event-list__btn_edit">EDIT</button>
              <button id=${event.id} class="event-list__btn_delete">DELETE</button>
          </div></td>
        </form>
        
      </tr>
      `;
  });

  renderEventArr.forEach((event, index) => {
    tmpPagination += `
    <a class="event-list_pagination-page-number">${index + 1}</a>
    `;
  });

  if (pageNumber === 1) {
    previousPageBtn.setAttribute("disabled", "true");
  } else {
    previousPageBtn.removeAttribute("disabled");
  }

  if (pageNumber === renderEventArr.length) {
    nextPageBtn.setAttribute("disabled", "true");
  } else {
    nextPageBtn.removeAttribute("disabled");
  }

  eventListContainer.innerHTML = tmpEvent;
  paginationContainer.innerHTML = tmpPagination;
};

getEventList(appApi, fromUnixDate);

const pagination = (() => {
  const paginationContainer = document.querySelector(".event-list__pagination");

  paginationContainer.addEventListener("click", (event) => {
    pageNumber = +event.target.innerHTML;
    getEventList(appApi, fromUnixDate);
  });
})();

const nextPage = (() => {
  nextPageBtn.addEventListener("click", () => {
    pageNumber++;
    getEventList(appApi, fromUnixDate);
  });
})();

const previousPage = (() => {
  previousPageBtn.addEventListener("click", () => {
    pageNumber--;

    getEventList(appApi, fromUnixDate);
  });
})();

const addEvent = (() => {
  const addBtn = document.querySelector(".event-list__addBtn");

  //creating a table row for new event
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
      //code for pre-existing event
      if (event.target.getAttribute("id")) {
        window.location.reload();

        // const buttonContainer = (document.querySelector(
        //   `.button-container-${event.target.getAttribute("id")}`
        // ).innerHTML = `
        //       <button id=${event.target.getAttribute(
        //         "id"
        //       )} class="event-list__btn_edit">EDIT</button>
        //       <button id=${event.target.getAttribute(
        //         "id"
        //       )} class="event-list__btn_delete">DELETE</button>
        //         `);

        // const eventName = document
        //   .querySelector(`.event-list__name-${event.target.getAttribute("id")}`)
        //   .setAttribute("disabled", true);

        // const startDate = document
        //   .querySelector(
        //     `.event-list__start-date-${event.target.getAttribute("id")}`
        //   )
        //   .setAttribute("disabled", true);

        // const endDate = document
        //   .querySelector(
        //     `.event-list__end-date-${event.target.getAttribute("id")}`
        //   )
        //   .setAttribute("disabled", true);
      } else {
        //code for new event
        eventListContainer.removeChild(eventListContainer.lastChild);
      }
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
      // code for updating event
      if (event.target.getAttribute("id")) {
        const eventName = document.querySelector(
          `.event-list__name-${event.target.getAttribute("id")}`
        ).value;

        const startDate = convertDate(
          document.querySelector(
            `.event-list__start-date-${event.target.getAttribute("id")}`
          ).value
        );

        const endDate = convertDate(
          document.querySelector(
            `.event-list__end-date-${event.target.getAttribute("id")}`
          ).value
        );

        if (!eventName || !+startDate || !+endDate) {
          alert("Input all of the required fields");
          return;
        }

        const updateEvent = {
          eventName,
          startDate,
          endDate,
          id: event.target.getAttribute("id"),
        };
        appApi.updateEvent(updateEvent);
      } else {
        //code for saving new event
        const eventName = document.querySelector(".new-event-name").value;

        let startDate = convertDate(
          document.querySelector(".new-event-start-date").value
        );

        let endDate = convertDate(
          document.querySelector(".new-event-end-date").value
        );

        if (!eventName || !+startDate || !+endDate) {
          alert("Input all of the required fields");
          return;
        }
        const event = new Event(eventName, startDate, endDate);

        await appApi.saveEvent(event);
      }
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

const editEvent = (() => {
  eventListContainer.addEventListener("click", async (event) => {
    if (event.target.classList[0] === "event-list__btn_edit") {
      const buttonId = event.target.getAttribute("id");

      const eventName = document
        .getElementById(buttonId)
        .querySelector(`.event-list__name-${buttonId}`)
        .removeAttribute("disabled");

      const startDate = document
        .getElementById(buttonId)
        .querySelector(`.event-list__start-date-${buttonId}`)
        .removeAttribute("disabled");

      const endDate = document
        .getElementById(buttonId)
        .querySelector(`.event-list__end-date-${buttonId}`)
        .removeAttribute("disabled");

      const buttonContainer = (document.querySelector(
        `.button-container-${buttonId}`
      ).innerHTML = `
        <button id=${buttonId} class="event-list__btn_save">SAVE</button>
         <button id=${buttonId} class="event-list__btn_close">CLOSE</button>
        `);
    }
  });
})();
