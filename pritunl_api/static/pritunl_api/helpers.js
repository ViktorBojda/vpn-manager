function listenForEvents(id = '') {
    $.ajax({
        url: urlBase + "events/",
        type: "GET",
        data: `id=${id}`
    })
    .done(function (data) {
        const lastEventID = parseEvents(data);
        if (lastEventID)
            id = lastEventID;
    })
    .fail(function (xhr, status, error) {
        console.log("error: " + error);
    })
    .always(function () {
        listenForEvents(id);
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
    let lastEventID = null;
    events.forEach(event => {
        lastEventID = event.id;
        console.log(event);
        switch (event.type) {
            case "servers_updated": // server => [create, update, delete, start, stop, restart], org => [attach, detach, delete], user => [create]
                ifExistsCall('fetchAllData');
                break;

            case "organizations_updated": // org => [create, update, delete], user => [create, delete]
                ifExistsCall('rebuildOrgs');
                ifExistsCall('refreshAttachOrgModal');
                break;

            case "server_routes_updated": // route => [create, update, delete], server => [update], org => [attach, detach]
                ifExistsCall('fetchRoutesByServerID', event.resource_id);
                break;

            case "server_organizations_updated": // org => [attach, detach, delete]
                ifExistsCall('fetchAttachedOrgsByServerID', event.resource_id);
                ifExistsCall('fetchOrgs');
                break;

            case "users_updated": // user => [create, update, delete], org => [attach, detach], server => [update, start, restart, stop]
                ifExistsCall('rebuildUsersByOrgID', event.resource_id);
                break;
            
            // TODO: server_hosts_updated, server_links_updated, system_log_updated, log_updated, server_output_updated

            default:
                console.log("Unknown event type: " + event.type);
                break;
        }

    });
    return lastEventID;
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
        // If obj is Array, take first element as function and assign the rest of array as it's parameters
        if (Array.isArray(func)) {
            const callback = func.shift();
            callback(elmData, ...func)
        }
        else {
            // Check whether function needs parameters
            if (func.length)
                func(elmData);
            else 
                func();
        }
    });
}

function insertEditModal(elmData, elmPrefix, editModal) {
    elmData.forEach((data, _) => {
        let $elmName = $(`#${elmPrefix}-${data.id} .${elmPrefix}-data-name`);
        if ($elmName.length)
            $elmName.off('click').on('click', () => editModal('edit', data));
    });
}

function startTimer(selector, elapsedSeconds) {
    let elm = $(selector);
    if (!elm.length)
        return;

    if (elm.data('timer') !== undefined)
        clearInterval(elm.data('timer'));

    elm.data('timer', setInterval(function() {
        ++elapsedSeconds;
        let seconds = elapsedSeconds;
        let days = Math.floor(seconds / 86400);
        seconds = seconds % 86400;
        let hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        elm.text(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000));
}

function stopTimer(selector) {
    let elm = $(selector);
    if (!elm.length || elm.data('timer') === undefined)
        return;

    clearInterval(elm.data('timer'));
    elm.removeData('timer');
    elm.text('-');    
}