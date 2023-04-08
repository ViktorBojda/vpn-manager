const urlBase = "/pritunl/api/";
const serverTemplate = (serverData) =>
    `<div id=server-${serverData.id} class='card my-3 server-wrapper'>
        <div class='card-header server-header'>
            <input class="form-check-input server-check" type="checkbox" name="del-check" value="${serverData.id}" aria-label="Select checkbox">
            <span class="server-data-name">${serverData.name}</span>
            <button type="button" class="btn btn-success server-start-btn ms-3">Start Server</button>
            <button type="button" class="btn btn-primary server-restart-btn ms-3">Restart Server</button>
            <button type="button" class="btn btn-warning server-stop-btn">Stop Server</button>
        </div>
        <ul class="list-group">
            <li class="list-group-item">Status: <span class="server-data-status">${serverData.status}</span></li>
            <li class="list-group-item">Uptime: <span class="server-data-uptime">${serverData.uptime}</span></li>
            <li class="list-group-item">Users Online: <span class="server-data-users_online">${serverData.users_online}</span></li>
            <li class="list-group-item">Devices Online: <span class="server-data-devices_online">${serverData.devices_online}</span></li>
            <li class="list-group-item">User Count: <span class="server-data-user_count">${serverData.user_count}</span></li>
            <li class="list-group-item">Network: <span class="server-data-network">${serverData.network}</span></li>
            <li class="list-group-item">Port: <span class="server-data-port">${serverData.port}</span></li>
            <li class="list-group-item">Protocol: <span class="server-data-protocol">${serverData.protocol}</span></li>
        </ul>
        <ul class='list-group list-group-flush d-flex route-list'></ul>
        <ul class='list-group list-group-flush d-flex org-list'></ul>
    </div>`;
const routeTemplate = (routeData) => 
    `<li id="route-${routeData.id}" class="list-group-item route-item">
        <input class="form-check-input route-check" type="checkbox" name="del-check" value="${routeData.server},${routeData.id}" aria-label="Select checkbox">
        <span class="route-data-network">${routeData.network}</span>
    </li>`;
const orgTemplate = (orgData) => 
    `<li id="org-${orgData.id}" class="list-group-item org-item">
        <input class="form-check-input org-check" type="checkbox" name="del-check" value="${orgData.server},${orgData.id}" aria-label="Select checkbox">
        <span class="org-data-name">${orgData.name}</span>
    </li>`;


function deleteSelected(selected, url) {
    let ajaxCalls = []
    selected.each(function() {
        let destUrl = url;
        $(this).val().split(",").forEach(ID => destUrl = destUrl.replace("%s", ID))
        ajaxCalls.push(
            $.ajax({
                type: "DELETE",
                url: urlBase + destUrl
            }).fail(function (xhr) {
                alert(xhr.responseText);
            })
        );
    });
    return ajaxCalls;
}

function deleteAllSelected(servers, routes, orgs) {
    let ajaxCalls = [];
    if (servers.length)
        ajaxCalls = ajaxCalls.concat(deleteSelected(servers, "servers/%s/delete/"));
    if (routes.length)
        ajaxCalls = ajaxCalls.concat(deleteSelected(routes, "servers/%s/routes/%s/delete/"));
    if (orgs.length)
        ajaxCalls = ajaxCalls.concat(deleteSelected(orgs, "servers/%s/organizations/%s/detach/"));
    return ajaxCalls;
}

function submitAttachOrg() {
    let formData = $("form").serializeArray();
    let data = {};

    formData.forEach(function (item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            data[item.name] = item.value;
    });
    let serverID = data.server;
    let orgID = data.organization;

    $.ajax({
        method: "PUT",
        url: `${urlBase}servers/${serverID}/organizations/${orgID}/attach/`
    }).done(function() {
        $("#modal").modal("hide");
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

function submitAddRoute() {
    let formData = $("form").serializeArray();
    let route = {};

    formData.forEach(function (item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            route[item.name] = item.value;
    });
    let serverID = route.server;
    delete route.server;

    $.ajax({
        method: "POST",
        url: `${urlBase}servers/${serverID}/routes/create/`,
        data: route
    }).done(function() {
        $("#modal").modal("hide");
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

function submitAddServer() {
    let formData = $("form").serializeArray();
    let server = {};

    formData.forEach(function (item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            server[item.name] = Number(item.value) ? Number(item.value) : item.value;
    });

    $.ajax({
        method: "POST",
        url: urlBase + "servers/create/",
        data: server
    }).done(function() {
        $("#modal").modal("hide");
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

function fetchOrgs() {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/"
    }).done(function (data) {
        let serverData = $('#btn-attach-org').data('serverData');
        if (serverData.length)
            $('#btn-attach-org').prop('disabled', false).off('click').on('click', () => showAttachOrgModal(serverData, data));
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchAttachedOrgsByServerID(serverID) {
    return $.ajax({
        type: "GET",
        url: `${urlBase}servers/${serverID}/organizations/`
    }).done(function (data) {
        rebuildElements(data, 'org', `#server-${serverID} .org-list`, orgTemplate, ['name']);
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function removeDeleteForVirtualNetwork(routeData) {
    routeData.forEach(route => {
        if (route.virtual_network)
            $(`#server-${route.server} #route-${route.id} .route-check`).remove();
    });
} 

function fetchRoutesByServerID(serverID) {
    return $.ajax({
        type: "GET",
        url: `${urlBase}servers/${serverID}/routes/`
    }).done(function (data) {
        rebuildElements(data, 'route', `#server-${serverID} .route-list`, routeTemplate, ['network'], [removeDeleteForVirtualNetwork]);
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function serverControl(serverID, action) {
    const actions = ['start', 'restart', 'stop'];
    if (!actions.includes(action)) {
        console.error('Invalid action: ' + action);
        return;
    }

    $.ajax({
        type: "PUT",
        url: `${urlBase}servers/${serverID}/${action}/`
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function toggleBtns(serverData) {
    if (serverData.length == 0) {
        $('#btn-add-route').prop('disabled', true);
        console.log("No servers found, you must add server before you can add route!");
        $('#btn-attach-org').prop('disabled', true);
        console.log("No servers found, you must add server before you can attach organization!");
        return;
    }
    $('#btn-add-route').prop('disabled', false).off('click').on('click', () => showAddRouteModal(serverData));
    $('#btn-attach-org').data('serverData', serverData);

    fetchOrgs();

    serverData.forEach(server => {
        let startBtn = $(`#server-${server.id} .server-start-btn`).off('click').on('click', () => serverControl(server.id, 'start'));
        let restartBtn = $(`#server-${server.id} .server-restart-btn`).off('click').on('click', () => serverControl(server.id, 'restart'));
        let stopBtn = $(`#server-${server.id} .server-stop-btn`).off('click').on('click', () => serverControl(server.id, 'stop'));

        if (server.status == "online") {
            startBtn.hide();
            restartBtn.show();
            stopBtn.show();
        }
        else {
            startBtn.show();
            restartBtn.hide();
            stopBtn.hide();
        }
    });
}

function fetchServers() {
    return $.ajax({
        type: "GET",
        url: urlBase + "servers/"
    }).done(function (data) {
        rebuildElements(data, 'server', '#servers-container', serverTemplate, ['name'], [toggleBtns]);
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchAllData() {
    $.when(fetchServers()).then(function (serverData) {
        serverData.forEach(server => {
            fetchRoutesByServerID(server.id);
            fetchAttachedOrgsByServerID(server.id);
        });
    })
}

$("#btn-add-server").on("click", showAddServerModal);
$("#btn-del-select").on("click", showDeleteServersModal);

$(document).on("change", ".server-check", function() {
    $(this).parent().siblings(".org-list, .route-list").find("input[name='del-check']").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='del-check']", function() {
    $("#btn-del-select").prop('disabled', !$("input[name='del-check']:checked").length);
});

$(function() {
    fetchAllData();
    listenForEvents();
});
