const urlBase = "/pritunl/api/";
const serverTemplate = (serverData) =>
    `<div id=server-${serverData.id} class='card my-3 server-wrapper'>
        <div class='card-header server-header'>
            <input class="form-check-input server-check" type="checkbox" name="checkbox" value="${serverData.id}" aria-label="Select checkbox">
            <span class="server-data-name">${serverData.name}</span>
            <button type="button" disabled class="btn btn-success server-start-btn ms-3">Start Server</button>
            <button type="button" class="btn btn-primary server-restart-btn ms-3">Restart Server</button>
            <button type="button" class="btn btn-warning server-stop-btn">Stop Server</button>
        </div>
        <ul class="list-group">
            <li class="list-group-item">Status: <span class="server-data-status">${serverData.status}</span></li>
            <li class="list-group-item">Uptime: <span class="server-uptime">-</span></li>
            <li class="list-group-item">
                Users: <span class="server-data-users_online">${serverData.users_online}</span> /
                <span class="server-data-user_count">${serverData.user_count}</span> users online
            </li>
            <li class="list-group-item">Devices Online: <span class="server-data-devices_online">${serverData.devices_online}</span></li>
            <li class="list-group-item">User Count: <span class="server-data-user_count">${serverData.user_count}</span></li>
            <li class="list-group-item">Network: <span class="server-data-network">${serverData.network}</span></li>
            <li class="list-group-item">
                Port: <span class="server-data-port">${serverData.port}</span> /
                <span class="server-data-protocol">${serverData.protocol}</span>
            </li>
        </ul>
        <ul class='list-group list-group-flush d-flex route-list'></ul>
        <ul class='list-group list-group-flush d-flex org-list'></ul>
    </div>`;
const routeTemplate = (routeData) => 
    `<li id="route-${routeData.id}" class="list-group-item route-item">
        <input class="form-check-input route-check" type="checkbox" name="checkbox" value="${routeData.server},${routeData.id}" aria-label="Select checkbox">
        <span class="route-data-network">${routeData.network}</span>
    </li>`;
const orgTemplate = (orgData) => 
    `<li id="org-${orgData.id}" class="list-group-item org-item">
        <input class="form-check-input org-check" type="checkbox" name="checkbox" value="${orgData.server},${orgData.id}" aria-label="Select checkbox">
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

function stopServerAndRepeat(err, serverID, repeatCallback) {
    const errors = ['server_not_offline', 'server_route_online']
    if (errors.includes(err.code))
        controlServer(serverID, 'stop', repeatCallback);
}

function submitAttachOrg() {
    const data = parseFormData();
    attachOrg(data.server, data.organization, [],
        [stopServerAndRepeat, data.server, // failCallback of attachOrg
            [attachOrg, data.server, data.organization, // repeatCallback of stopServerAndRepeat
                [controlServer, data.server, 'start']]]); // doneCallback of attachOrg
}

function submitAddRoute() {
    const data = parseFormData();
    createRoute(data.server, data);
}

function submitAddServer() {
    const data = parseFormData();
    if ('groups' in data)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    createServer(data);
}

function submitEditServer() {
    const data = parseFormData();
    if ('groups' in data)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    updateServer(data.id, data);
}

function rebuildAttachedOrgsByServerID(serverID) {
    fetchAttachedOrgsByServerID(serverID, [(data) => {
        const startBtn = $(`#server-${serverID} .server-start-btn`);
        data.length ? startBtn.prop('disabled', false) : startBtn.prop('disabled', true);
        rebuildElements(data, 'org', `#server-${serverID} .org-list`, orgTemplate, [checkForCheckBoxes]);
    }]);
}

function delCheckboxForVirtualNetwork(routeData) {
    routeData.forEach(route => {
        if (route.virtual_network)
            $(`#server-${route.server} #route-${route.id} .route-check`).remove();
    });
} 

function rebuildRoutesByServerID(serverID) {
    fetchRoutesByServerID(
        serverID, 
        [rebuildElements, 'route', `#server-${serverID} .route-list`, routeTemplate, 
            [delCheckboxForVirtualNetwork, checkForCheckBoxes]]);
}

function configureServerBtns(serverID, action, button) {
    const actions = ['start', 'restart', 'stop'];
    if (!actions.includes(action)) {
        console.error('Invalid action: ' + action);
        return;
    }
    $(button).prop('disabled', true);
    controlServer(serverID, action, [], [(btn) => $(btn).prop('disabled', false), button]);
}

function refreshAttachOrgModal() {
    // Refresh org list inside of attach org modal
    const serverData = $('#servers-container').data('serverData');
    fetchOrgs(
        [(orgData, serverData) => $('#btn-attach-org').prop('disabled', false).off('click').on('click', () => showAttachOrgModal(serverData, orgData)),
        serverData]);
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
    $('#servers-container').data('serverData', serverData);
    
    refreshAttachOrgModal();

    serverData.forEach(server => {
        const startBtn = $(`#server-${server.id} .server-start-btn`).off('click').on('click', ev => configureServerBtns(server.id, 'start', ev.target));
        const restartBtn = $(`#server-${server.id} .server-restart-btn`).off('click').on('click', ev => configureServerBtns(server.id, 'restart', ev.target));
        const stopBtn = $(`#server-${server.id} .server-stop-btn`).off('click').on('click', ev => configureServerBtns(server.id, 'stop', ev.target));

        if (server.status == "online") {
            startTimer(`#server-${server.id} .server-uptime`, server.uptime);
            startBtn.hide();
            restartBtn.show();
            stopBtn.show();
        }
        else {
            stopTimer(`#server-${server.id} .server-uptime`);
            startBtn.show();
            restartBtn.hide();
            stopBtn.hide();
        }
    });
}

function rebuildServers() {
    return fetchServers(
        [rebuildElements, 'server', '#servers-container', serverTemplate, 
            [toggleBtns, [insertEditModal, 'server', showAddEditServerModal], checkForCheckBoxes]]);
}

function fetchAllData() {
    $.when(rebuildServers()).then(function (serverData) {
        serverData.forEach(server => {
            rebuildRoutesByServerID(server.id);
            rebuildAttachedOrgsByServerID(server.id);
        });
    })
}

$("#btn-add-server").on("click", () => showAddEditServerModal('add'));
$("#btn-del-select").on("click", showDeleteServersModal);

$(document).on("change", ".server-check", function() {
    $(this).parent().siblings(".org-list, .route-list").find("input[name='checkbox']").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='checkbox']", checkForCheckBoxes);

$(function() {
    fetchAllData();
    listenForEvents();
});
