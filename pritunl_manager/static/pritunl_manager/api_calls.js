const urlBase = "/pritunl/api/";
const csrftoken = getCookie('csrftoken');
const createSettings = (method, data = null) => {
    const settings = {type: method, contentType: 'application/json', headers: {'X-CSRFToken': csrftoken}};
    data ? settings.data = JSON.stringify(data) : '';
    return settings;
}

function apiCall({path, settings = {type: 'GET'}, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    if (beforeSendCallback)
        settings.beforeSend = beforeSendCallback;
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

function createOrgApi({data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: 'organizations/create/', settings: createSettings('POST', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function updateOrgApi({orgID, data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `organizations/${orgID}/update/`, settings: createSettings('PUT', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function deleteOrgApi({orgID}) {
    return apiCall({path: `organizations/${orgID}/delete/`, settings: createSettings('DELETE')});
}

function fetchUsersByOrgIdApi({orgID, doneCallbacks = []}) {
    return apiCall({path: `organizations/${orgID}/users/`, doneCallbacks: doneCallbacks});
}

function fetchUserLinksApi({orgID, userID, doneCallbacks = []}) {
    return apiCall({path: `organizations/${orgID}/users/${userID}/links/`, doneCallbacks: doneCallbacks});
}

function createUserApi({orgID, data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `organizations/${orgID}/users/create/`, settings: createSettings('POST', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function bulkCreateUsersApi({orgID, data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `organizations/${orgID}/users/bulk-create/`, settings: createSettings('POST', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
});
}

function updateUserApi({orgID, userID, data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `organizations/${orgID}/users/${userID}/update/`, settings: createSettings('PUT', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function deleteUserApi({orgID, userID}) {
    return apiCall({
        path: `organizations/${orgID}/users/${userID}/delete/`, settings: createSettings('DELETE')
    });
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

function createServerApi({data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: 'servers/create/', settings: createSettings('POST', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function updateServerApi({serverID, data, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `servers/${serverID}/update/`, settings: createSettings('PUT', data), doneCallbacks: doneCallbacks,
        failCallbacks: failCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function deleteServerApi({serverID}) {
    return apiCall({path: `servers/${serverID}/delete/`, settings: createSettings('DELETE')});
}

function controlServerApi({serverID, action, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `servers/${serverID}/${action}/`, settings: createSettings('PUT'), doneCallbacks: doneCallbacks,
        failCallbacks: failCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function deleteRoutesAndOrgsApi({serverID, data}) {
    return apiCall({path: `servers/${serverID}/entities/delete/`, settings: createSettings('DELETE', data)});
}

function attachOrgApi({serverID, orgID, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `servers/${serverID}/organizations/${orgID}/attach/`, settings: createSettings('PUT'),
        doneCallbacks: doneCallbacks, failCallbacks: failCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function fetchRoutesByServerIdApi({serverID, doneCallbacks = []}) {
    return apiCall({path: `servers/${serverID}/routes/`, doneCallbacks: doneCallbacks});
}

function createRouteApi({serverID, data, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `servers/${serverID}/routes/create/`, settings: createSettings('POST', data), doneCallbacks: doneCallbacks,
        failCallbacks: failCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function bulkCreateRoutesApi({serverID, data, doneCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `servers/${serverID}/routes/bulk-create/`, settings: createSettings('POST', data),
        doneCallbacks: doneCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

function updateRouteApi({serverID, routeID, data, doneCallbacks = [], failCallbacks = [], alwaysCallbacks = [], beforeSendCallback = null}) {
    return apiCall({
        path: `servers/${serverID}/routes/${routeID}/update/`, settings: createSettings('PUT', data),
        doneCallbacks: doneCallbacks, failCallbacks: failCallbacks, alwaysCallbacks: alwaysCallbacks, beforeSendCallback: beforeSendCallback
    });
}

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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}