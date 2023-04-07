function listenForEvents() {
    $.ajax({
        url: urlBase + "events/",
        type: "GET",
        success: function (data) {
            parseEvents(data);
        },
        error: function (xhr, status, error) {
            console.log("An error occurred: " + error);
        },
        complete: function () {
            listenForEvents();
        }
    });
}

function parseEvents(events) {
    events.forEach(event => {
        switch (event.type) {
            case "servers_updated":
            case "organizations_updated":
                fetchOrgs();
                break;

            case "users_updated":
                fetchUsersByOrgID(event.resource_id);
                break;
        
            default:
                console.log("Unknown event type: " + event.type);
                break;
        }
    });
}