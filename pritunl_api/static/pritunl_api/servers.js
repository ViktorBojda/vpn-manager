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

function stopServerAndRepeat({err, serverID, repeatCallbacks}) {
    const errors = ['server_not_offline', 'server_route_online']
    if (errors.includes(err.code))
        controlServerApi({
            serverID: serverID, action: 'stop',
            doneCallbacks: repeatCallbacks
        });
}

function attachOrg({startServer = false}) {
    const data = parseFormData();
    attachOrgApi({
        serverID: data.server, orgID: data.organization,
        doneCallbacks: [
            {func: () => $("#modal").modal("hide")},
            startServer ? {func: controlServer, args: {serverID: data.server, action: 'start'}} : {}
        ],
        failCallbacks: [{
            func: stopServerAndRepeat,
            args: {
                serverID: data.server,
                repeatCallbacks: [{
                    func: attachOrg,
                    args: {startServer: true}
                }]
            }
        }]
    });
}

function addRoute() {
    const data = parseFormData();
    createRouteApi({
        serverID: data.server, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function addServer() {
    const data = parseFormData();
    if ('groups' in data)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    createServerApi({
        data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function editServer() {
    const data = parseFormData();
    if ('groups' in data)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    updateServerApi({
        serverID: data.id, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function rebuildAttachedOrgsByServerID(serverID) {
    fetchAttachedOrgsByServerIdApi({
        serverID: serverID,
        doneCallbacks: [
            {
                func: ({apiData}) => {
                    const startBtn = $(`#server-${serverID} .server-start-btn`);
                    apiData.length ? startBtn.prop('disabled', false) : startBtn.prop('disabled', true);
                }
            },
            {
                func: rebuildElements,
                args: {
                    prefix: 'org', contSelector: `#server-${serverID} .org-list`, template: orgTemplate,
                    callbacks: [checkForCheckBoxes]
                }
            }
        ]
    });
}

function delCheckboxForVirtualNetwork(routeData) {
    routeData.forEach(route => {
        if (route.virtual_network)
            $(`#server-${route.server} #route-${route.id} .route-check`).remove();
    });
} 

function rebuildRoutesByServerID(serverID) {
    fetchRoutesByServerIdApi({
        serverID: serverID,
        doneCallbacks: [{
            func: rebuildElements,
            args: {
                prefix: 'route', contSelector: `#server-${serverID} .route-list`, template: routeTemplate,
                callbacks: [delCheckboxForVirtualNetwork, checkForCheckBoxes]
            }
        }]
    });
}

function controlServer({serverID, action}) {
    const actions = ['start', 'restart', 'stop'];
    if (!actions.includes(action)) {
        console.error('Invalid action: ' + action);
        return;
    }
    const btn = $(`#server-${serverID} .server-${action}-btn`).prop('disabled', true);
    controlServerApi({
        serverID: serverID, action: action,
        alwaysCallbacks: [{
            func: ({btn}) => $(btn).prop('disabled', false),
            args: {btn}
        }]
    });
}

function refreshAttachOrgModal() {
    // Refresh org list inside of attach org modal
    const serverData = $('#servers-container').data('serverData');
    fetchOrgsApi({
        doneCallbacks: [
            {
                func: ({apiData, serverData}) => $('#btn-attach-org').prop('disabled', false).off('click').on('click', () => showAttachOrgModal(apiData, serverData)),
                args: {serverData}
            }
        ]
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
    $('#servers-container').data('serverData', serverData);
    
    refreshAttachOrgModal();

    serverData.forEach(server => {
        const startBtn = $(`#server-${server.id} .server-start-btn`).off('click').on('click', () => controlServer({serverID: server.id, action: 'start'}));
        const restartBtn = $(`#server-${server.id} .server-restart-btn`).off('click').on('click', () => controlServer({serverID: server.id, action: 'restart'}));
        const stopBtn = $(`#server-${server.id} .server-stop-btn`).off('click').on('click', () => controlServer({serverID: server.id, action: 'stop'}));

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
    return fetchServersApi({
        doneCallbacks: [{
            func: rebuildElements,
            args: {
                prefix: 'server', contSelector: '#servers-container', template: serverTemplate,
                callbacks: [toggleBtns, [insertEditModal, 'server', showAddEditServerModal], checkForCheckBoxes]
            }
        }]
    });
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
