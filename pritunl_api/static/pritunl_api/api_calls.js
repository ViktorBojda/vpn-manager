const createSettings = (method, data = null) => {
    const settings = {type: method, contentType: 'application/json'};
    data ? settings.data = JSON.stringify(data) : '';
    return settings;
}

function apiCall({path, settings = {type: 'GET'}, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = []}) {
    return $.ajax(urlBase + path, settings)
    .done((apiData) => {
        $.each(doneCallbacks, (_, callback) => {
            if (!('func' in callback)) return;
            'args' in callback ? '' : callback.args = {};
            callback.args.apiData = apiData;
            callback.func(callback.args);
        });
        return apiData;
    })
    .fail((jqXHR) => {
        let err;
        $.each(jqXHR.responseJSON, (_, value) => {
            Array.isArray(value) ? err = value[0] : err = jqXHR.responseJSON;
            return false;
        });
        alert(err.message);
        $.each(failCallbacks, (_, callback) => {
            'args' in callback ? '' : callback.args = {};
            callback.args.err = err;
            callback.func(callback.args);
        });
    })
    .always(() => {
        $.each(alwaysCallbacks, (_, callback) => {
            'args' in callback ? '' : callback.args = {};
            callback.func(callback.args);
        });
    })
}

function fetchOrgsApi({doneCallbacks = []}) {
    return apiCall({path: 'organizations/', doneCallbacks: doneCallbacks});
}

function createOrgApi({data, doneCallbacks = []}) {
    return apiCall(
        {path: 'organizations/create/', settings: createSettings('POST', data), doneCallbacks: doneCallbacks}
    );
}

function updateOrgApi({orgID, data, doneCallbacks = []}) {
    return apiCall(
        {path: `organizations/${orgID}/update/`, settings: createSettings('PUT', data), doneCallbacks: doneCallbacks}
    );
}

function deleteOrgApi({orgID}) {
    return apiCall(
        {path: `organizations/${orgID}/delete/`, settings: createSettings('DELETE')}
    );
}

function fetchUsersByOrgIdApi({orgID, doneCallbacks = []}) {
    return apiCall({path: `organizations/${orgID}/users/`, doneCallbacks: doneCallbacks});
}

function fetchUserLinksApi({orgID, userID, doneCallbacks = []}) {
    return apiCall({path: `organizations/${orgID}/users/${userID}/links/`, doneCallbacks: doneCallbacks});
}

function createUserApi({orgID, data, doneCallbacks = []}) {
    return apiCall(
        {path: `organizations/${orgID}/users/create/`, settings: createSettings('POST', data), doneCallbacks: doneCallbacks}
    );
}

function bulkCreateUsersApi({orgID, data, doneCallbacks = []}) {
    return apiCall(
        {path: `organizations/${orgID}/users/bulk-create/`, settings: createSettings('POST', data), doneCallbacks: doneCallbacks}
    );
}

function updateUserApi({orgID, userID, data, doneCallbacks = []}) {
    return apiCall(
        {path: `organizations/${orgID}/users/${userID}/update/`, settings: createSettings('PUT', data), doneCallbacks: doneCallbacks}
    );
}

function deleteUserApi({orgID, userID}) {
    return apiCall(
        {path: `organizations/${orgID}/users/${userID}/delete/`, settings: createSettings('DELETE')}
    );
}

function fetchServersApi({doneCallbacks = []}) {
    return apiCall({path: 'servers/', doneCallbacks: doneCallbacks});
}

function fetchServerApi({serverID, doneCallbacks = []}) {
    return apiCall({path: `servers/${serverID}/`, doneCallbacks: doneCallbacks});
}

function fetchAttachedOrgsByServerIdApi({serverID, doneCallbacks = []}) {
    return apiCall({path: `servers/${serverID}/organizations/`, doneCallbacks: doneCallbacks});
}

function createServerApi({data, doneCallbacks = []}) {
    return apiCall(
        {path: 'servers/create/', settings: createSettings('POST', data), doneCallbacks: doneCallbacks}
    );
}

function updateServerApi({serverID, data, doneCallbacks = [], failCallbacks = []}) {
    return apiCall(
        {path: `servers/${serverID}/update/`, settings: createSettings('PUT', data), doneCallbacks: doneCallbacks, failCallbacks: failCallbacks}
    );
}

function deleteServerApi({serverID}) {
    return apiCall(
        {path: `servers/${serverID}/delete/`, settings: createSettings('DELETE')}
    );
}

function controlServerApi({serverID, action, doneCallbacks = [], alwaysCallbacks = []}) {
    return apiCall(
        {path: `servers/${serverID}/${action}/`, settings: createSettings('PUT'), doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks}
    );
}

function deleteRoutesAndOrgsApi({serverID, data}) {
    return apiCall(
        {path: `servers/${serverID}/entities/delete/`, settings: createSettings('DELETE', data)}
    );
}

function attachOrgApi({serverID, orgID, doneCallbacks = [], failCallbacks = []}) {
    return apiCall(
        {path: `servers/${serverID}/organizations/${orgID}/attach/`, settings: createSettings('PUT'),
        doneCallbacks: doneCallbacks, failCallbacks: failCallbacks}
    );
}

function fetchRoutesByServerIdApi({serverID, doneCallbacks = []}) {
    return apiCall({path: `servers/${serverID}/routes/`, doneCallbacks: doneCallbacks});
}

function createRouteApi({serverID, data, doneCallbacks = [], failCallbacks = []}) {
    return apiCall(
        {path: `servers/${serverID}/routes/create/`, settings: createSettings('POST', data), doneCallbacks: doneCallbacks, failCallbacks: failCallbacks}
    );
}

function bulkCreateRoutesApi({serverID, data, doneCallbacks = []}) {
    return apiCall(
        {path: `servers/${serverID}/routes/bulk-create/`, settings: createSettings('POST', data), doneCallbacks: doneCallbacks}
    );
}

function updateRouteApi({serverID, routeID, data, doneCallbacks = [], failCallbacks = []}) {
    return apiCall(
        {path: `servers/${serverID}/routes/${routeID}/update/`, settings: createSettings('PUT', data), doneCallbacks: doneCallbacks, failCallbacks: failCallbacks}
    );
}