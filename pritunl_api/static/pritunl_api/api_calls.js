const createSettings = (method, data = null) => {
    const settings = {type: method, contentType: 'application/json'};
    data ? settings.data = JSON.stringify(data) : '';
    return settings;
}

function apiCall({path, settings = {type: 'GET'}, doneCallback = [], passDoneData = true, failCallback = [], alwaysCallback = []}) {
    return $.ajax(urlBase + path, settings)
    .done((data) => {
        if (doneCallback.length) {
            const callback = doneCallback.shift();
            (passDoneData) ? callback(data, ...doneCallback) : callback(...doneCallback);
        }
        return data;
    })
    .fail((jqXHR) => {
        alert(jqXHR.responseJSON.message);
        if (failCallback.length) {
            const callback = failCallback.shift();
            callback(jqXHR, ...failCallback);
        }
    })
    .always(() => {
        if (alwaysCallback.length) {
            const callback = alwaysCallback.shift();
            callback(...alwaysCallback);
        }
    })
}

function fetchOrgs(doneCallback = []) {
    return apiCall({path: 'organizations/', doneCallback: doneCallback});
}

function createOrg(data) {
    return apiCall(
        {path: 'organizations/create/', settings: createSettings('POST', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function updateOrg(orgID, data) {
    return apiCall(
        {path: `organizations/${orgID}/update/`, settings: createSettings('PUT', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function fetchUsersByOrgID(orgID, doneCallback = []) {
    return apiCall({path: `organizations/${orgID}/users/`, doneCallback: doneCallback});
}

function fetchUserLinks(orgID, userID, doneCallback = []) {
    return apiCall({path: `organizations/${orgID}/users/${userID}/links/`, doneCallback: doneCallback});
}

function createUser(orgID, data) {
    return apiCall(
        {path: `organizations/${orgID}/users/create/`, settings: createSettings('POST', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function bulkCreateUsers(orgID, data) {
    return apiCall(
        {path: `organizations/${orgID}/users/bulk-create/`, settings: createSettings('POST', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function updateUser(orgID, userID, data) {
    return apiCall(
        {path: `organizations/${orgID}/users/${userID}/update/`, settings: createSettings('PUT', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function fetchServers(doneCallback = []) {
    return apiCall({path: 'servers/', doneCallback: doneCallback});
}

function fetchAttachedOrgsByServerID(serverID, doneCallback = []) {
    return apiCall({path: `servers/${serverID}/organizations/`, doneCallback: doneCallback});
}

function createServer(data) {
    return apiCall(
        {path: 'servers/create/', settings: createSettings('POST', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function updateServer(serverID, data) {
    return apiCall(
        {path: `servers/${serverID}/update/`, settings: createSettings('PUT', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function controlServer(serverID, action, alwaysCallback = []) {
    return apiCall(
        {path: `servers/${serverID}/${action}/`, settings: createSettings('PUT'), alwaysCallback: alwaysCallback}
    );
}

function attachOrg(serverID, orgID) {
    return apiCall(
        {path: `servers/${serverID}/organizations/${orgID}/attach/`, settings: createSettings('PUT'), doneCallback: [() => $("#modal").modal("hide")]}
    );
}

function fetchRoutesByServerID(serverID, doneCallback = []) {
    return apiCall({path: `servers/${serverID}/routes/`, doneCallback: doneCallback});
}

function createRoute(serverID, data) {
    return apiCall(
        {path: `servers/${serverID}/routes/create/`, settings: createSettings('POST', data), doneCallback: [() => $("#modal").modal("hide")]}
    );
}