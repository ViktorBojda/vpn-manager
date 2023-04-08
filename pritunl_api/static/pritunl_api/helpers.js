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

function rebuildElements(elmData, elmPrefix, containerSelector, elmTemplate, elmProps, callbackFunc = null) {
    let container = $(containerSelector);
    
    // Check if the existing element's ID is in the array of element data, if not remove it
    container.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = elmData.some(function(elm) {
            return `${elmPrefix}-${elm.id}` == childId;
        });
        return !hasId;
    }).remove();
    
    if (callbackFunc) {
        if (callbackFunc.length)
            callbackFunc(elmData);
        else
            callbackFunc();
    }
    
    // Check whether element exists, if it does update it, if not create new one
    elmData.forEach((data, idx) => {
        let elm = container.find(`${elmPrefix}-${data.id}`);
        if (elm.length) {
            elmProps.forEach(prop => {
                elm.find(`.${elmPrefix}-${prop}`).text(data[prop]);
            });
        } else {
            elm = $(elmTemplate(data));
            container.append(elm);
        }

        elm.css('order', idx);
    });
}