function ifExistsCall(funcName, param = null) {
    if (typeof window[funcName] === 'function') {
        if (param)
            window[funcName](param);
        else
            window[funcName]();
    }
}

function parseEvents(events) {
    let lastEventID = null;
    events.forEach(event => {
        lastEventID = event.id;
        switch (event.type) {
            case "servers_updated": // server => [create, update, delete, start, stop, restart], org => [attach, detach, delete], user => [create]
                ifExistsCall('rebuildServers');
                break;

            case "organizations_updated": // org => [create, update, delete], user => [create, delete]
                ifExistsCall('rebuildOrgs');
                ifExistsCall('refreshAttachOrgModal');
                break;

            case "server_routes_updated": // route => [create, update, delete], server => [update], org => [attach, detach]
                ifExistsCall('rebuildRoutesByServerID', event.resource_id);
                break;

            case "server_organizations_updated": // org => [attach, detach, delete]
                ifExistsCall('rebuildAttachedOrgsByServerID', event.resource_id);
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
        else
            data[obj.name] = null;
    });
    return data;
}

function rebuildElements({apiData, prefix, contSelector, template, onCreateCallback = null, callbacks = []}) {
    const container = $(contSelector);
    
    // Check if the existing element's ID is in the array of element data and if it has class 'dont-destroy', if not remove it
    container.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = apiData.some(function(data) {
            return `${prefix}-${data.id}` == childId;
        });
        const hasDontDestroy = $(this).hasClass('dont-destroy');
        return !hasId && !hasDontDestroy;
    }).remove();
    
    // Check whether element exists, if it does update it, if not create new one
    apiData.forEach((data, idx) => {
        let elm = container.find(`#${prefix}-${data.id}`);
        if (elm.length)
            $.each(data, (key, value) => elm.find(`.${prefix}-data-${key}`).text(value == null ? '' : value));
        else {
            elm = $(template(data));
            onCreateCallback ? onCreateCallback(elm) : '';
            container.append(elm);
        }

        elm.css('order', idx);
    });

    callbacks.forEach(callback => {
        // If obj is Array, take first element as function and assign the rest of array as it's parameters
        if (Array.isArray(callback)) {
            const func = callback.shift();
            func(apiData, ...callback)
        }
        else {
            // Check whether function needs parameters
            if (callback.length)
                callback(apiData);
            else 
                callback();
        }
    });

    if (isReadOnly)
        makePageReadOnly();
}

function insertEditModal(elmData, prefix, clickSuffix, editModal, parentPrefix = null, parentKey = null) {
    parentKey ? '' : parentKey = parentPrefix;
    elmData.forEach((data, _) => {
        let $elmName;
        if (parentPrefix)
            $elmName = $(`#${parentPrefix}-${data[parentKey]} #${prefix}-${data.id} .${prefix}-data-${clickSuffix}`);
        else
            $elmName = $(`#${prefix}-${data.id} .${prefix}-data-${clickSuffix}`);
        if ($elmName.length)
            $elmName.off('click').on('click', () => editModal('edit', data));
    });
}

function startTimer(elm, elapsedSeconds) {
    elm = $(elm);
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

function stopTimer(elm) {
    elm = $(elm);
    if (!elm.length || elm.data('timer') === undefined)
        return;

    clearInterval(elm.data('timer'));
    elm.removeData('timer');
    elm.text('-');    
}

function insertIDsIntoCheckboxes(elmData, prefix, parentPrefix = null, parentKey = null) {
    parentKey ? '' : parentKey = parentPrefix;
    elmData.forEach(data => {
        if (parentPrefix)
            $(`#${parentPrefix}-${data[parentKey]} #${prefix}-${data.id} .${prefix}-check`)
            .data(`${parentPrefix}-id`, data[parentKey]).data('id', data.id);
        else
            $(`#${prefix}-${data.id} .${prefix}-check`).data('id', data.id)
    });
}

function showFormSpinner() {
    $('#modal-footer .spinner-border').removeClass('d-none');
    $('#modal-footer :button').prop("disabled", true);
}

function hideFormSpinner() {
    $('#modal-footer .spinner-border').addClass('d-none');
    $('#modal-footer :button').prop("disabled", false);
}