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

function ifExistsCall(funcName, param = null) {
    if (typeof window[funcName] === 'function') {
        if (param)
            window[funcName](param);
        else
            window[funcName]();
    }
}

function parseEvents(events) {
    console.log('#####################');
    events.forEach(event => {
        console.log(event);
        switch (event.type) {
            case "servers_updated": // Called on server => (create, update, delete), org => (delete)
                ifExistsCall('fetchAllData');
                break;

            case "organizations_updated": // Called on org => (create, update), user => (create, delete)
                ifExistsCall('rebuildOrgs');
                ifExistsCall('refreshAttachOrgModal');
                break;

            case "server_routes_updated": // Called on route => (create, update, delete), server => (update)
                ifExistsCall('fetchRoutesByServerID', event.resource_id);
                break;

            case "server_organizations_updated":                    
                ifExistsCall('fetchAttachedOrgsByServerID', event.resource_id);
                ifExistsCall('fetchOrgs');
                break;

            case "users_updated": // Called on user => (create, update, delete)
                ifExistsCall('rebuildUsersByOrgID', event.resource_id);
                break;
            
            // TODO: server_hosts_updated, server_links_updated

            default:
                console.log("Unknown event type: " + event.type);
                break;
        }
    });
}

function checkForCheckBoxes() {
    $("#btn-del-select").prop('disabled', !$("input[name='checkbox']:checked").length);
}

function parseFormData() {
    let formData = $("form").serializeArray();
    let data = {};

    formData.forEach((obj) => {
        if (obj.value.trim().length)
            data[obj.name] = obj.value;
    });
    return data;
}

function rebuildElements(elmData, elmPrefix, containerSelector, elmTemplate, callbackFuncs = []) {
    let container = $(containerSelector);
    
    // Check if the existing element's ID is in the array of element data, if not remove it
    container.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = elmData.some(function(data) {
            return `${elmPrefix}-${data.id}` == childId;
        });
        return !hasId;
    }).remove();
    
    // Check whether element exists, if it does update it, if not create new one
    elmData.forEach((data, idx) => {
        let elm = container.find(`#${elmPrefix}-${data.id}`);
        if (elm.length)
            $.each(data, (key, value) => elm.find(`.${elmPrefix}-data-${key}`).text(value));
        else {
            elm = $(elmTemplate(data));
            container.append(elm);
        }

        elm.css('order', idx);
    });

    callbackFuncs.forEach(func => {
        // Check whether function needs parameters
        if (func.length)
            func(elmData);
        else 
            func();
    });
}