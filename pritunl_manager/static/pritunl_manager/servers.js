const serverTemplate = (serverData) =>
    `<div id=server-${serverData.id} class='card my-3 server-wrapper'>
        <div class='card-header row mx-0 px-0 align-items-center'>
            <div class="col-auto">
                <span class="pe-3 me-3 border-end"><input class="form-check-input server-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
                <span class="fw-medium clickable server-data-name">${serverData.name}</span>
            </div>
            <div class="col d-flex column-gap-3 justify-content-end">
                <button type="button" disabled class="btn btn-success server-start-btn">Start Server</button>
                <button type="button" class="btn btn-primary server-restart-btn">Restart Server</button>
                <button type="button" class="btn btn-warning server-stop-btn">Stop Server</button>
            </div>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item">Status: <span class="server-data-status">${serverData.status}</span></li>
            <li class="list-group-item">Uptime: <span class="server-uptime">-</span></li>
            <li class="list-group-item">
                Users: <span class="server-data-users_online">${serverData.users_online}</span> /
                <span class="server-data-user_count">${serverData.user_count}</span> users online
            </li>
            <li class="list-group-item">Devices Online: <span class="server-data-devices_online">${serverData.devices_online}</span></li>
            <li class="list-group-item">Network: <span class="server-data-network">${serverData.network}</span></li>
            <li class="list-group-item">
                Port: <span class="server-data-port">${serverData.port}</span> /
                <span class="server-data-protocol">${serverData.protocol}</span>
            </li>
        </ul>
        <ul class='list-group list-group-flush my-2 route-list'></ul>
        <ul class='list-group list-group-flush org-list'></ul>
    </div>`;
const routeTemplate = (routeData) => 
    `<li id="route-${routeData.id}" class="list-group-item row mx-0 px-0 align-items-center route-item">
        <span class="pe-3 me-3 border-end"><input class="form-check-input route-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
        <span class="px-0 me-1 fw-medium clickable route-data-network">${routeData.network}</span>
        <span class="fst-italic route-data-comment">${routeData.comment ? routeData.comment : ''}</span>
    </li>`;
const orgTemplate = (orgData) => 
    `<li id="org-${orgData.id}" class="list-group-item row mx-0 px-0 align-items-center org-item">
        <span class="pe-3 me-3 border-end"><input class="form-check-input org-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
        <span class="px-0 fw-medium org-data-name">${orgData.name}</span>
    </li>`;

function deleteSelected(servers, routesOrgs) {
    const ajaxCalls = [];
    servers.each((_, server) => ajaxCalls.push(deleteServerApi({serverID: $(server).data('id')})));
    $.each(routesOrgs, (key, value) => ajaxCalls.push(deleteRoutesAndOrgsApi({serverID: key, data: value})));
    $.when.apply($, ajaxCalls).then(function() {
        $("#modal").modal("hide");
    })
}

function attachOrg() {
    const data = parseFormData();
    attachOrgApi({
        serverID: data.server, orgID: data.organization,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function addRoute() {
    const data = parseFormData();
    createRouteApi({
        serverID: data.server, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function bulkAddRoutes() {
    const data = parseFormData();
    const routeList = [];

    const lines = data.route_list.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "")
            continue;
        
        const values = lines[i].split(",");
        const network = values[0].trim();
        const comment = values[1] ? values[1].trim() : "";

        routeList.push({ network: network, comment: comment });
    }
    bulkCreateRoutesApi({
        serverID: data.server, data: {'route_list': routeList},
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function editRoute() {
    const data = parseFormData();
    updateRouteApi({
        serverID: data.server, routeID: data.id, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function addServer() {
    const data = parseFormData();
    if ('groups' in data && data.groups != null)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    createServerApi({
        data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}]
    });
}

function editServer() {
    const data = parseFormData();
    if ('groups' in data && data.groups != null)
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
                    callbacks: [[insertIDsIntoCheckboxes, 'org', 'server'], checkForCheckBoxes]
                }
            }
        ]
    });
}

function disableCheckForVirtualNetwork(routeData) {
    routeData.forEach(route => {
        if (route.virtual_network)
            $(`#server-${route.server} #route-${route.id} .route-check`).attr('name', '')
                .prop('disabled', true).prop('indeterminate', true);
    });
}

function rebuildRoutesByServerID(serverID) {
    fetchRoutesByServerIdApi({
        serverID: serverID,
        doneCallbacks: [{
            func: rebuildElements,
            args: {
                prefix: 'route', contSelector: `#server-${serverID} .route-list`, template: routeTemplate,
                callbacks: [
                    [insertIDsIntoCheckboxes, 'route', 'server'], disableCheckForVirtualNetwork,
                    [insertEditModal, 'route', 'network', showAddEditRouteModal, 'server'], checkForCheckBoxes
                ]
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
        doneCallbacks: [{
            func: ({apiData, serverData}) => $('#btn-attach-org').prop('disabled', false).off('click').on('click', () => showAttachOrgModal(apiData, serverData)),
            args: {serverData}
        }]
    });
}

function configureNavbarBtns(serverData) {
    if (serverData.length == 0) {
        $('#btn-add-route').prop('disabled', true);
        $('#btn-bulk-add-routes').prop('disabled', true);
        console.log("No servers found, you must add server before you can add route!");
        $('#btn-attach-org').prop('disabled', true);
        console.log("No servers found, you must add server before you can attach organization!");
        return;
    }
    $('#btn-add-route').prop('disabled', false).off('click').on('click', () => showAddEditRouteModal('add', serverData));
    $('#btn-bulk-add-routes').prop('disabled', false).off('click').on('click', () => showBulkAddRoutesModal(serverData));
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
                callbacks: [
                    [insertIDsIntoCheckboxes, 'server'], configureNavbarBtns,
                    [insertEditModal, 'server', 'name', showAddEditServerModal], checkForCheckBoxes
                ]
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
    $(this).closest('.server-wrapper').find('.org-list, .route-list').find("input[name='checkbox']").prop({
        "disabled": $(this).is(":checked"),
        "checked": $(this).is(":checked")
    });
});

$(document).on("change", "input[name='checkbox']", checkForCheckBoxes);

$(function() {
    fetchAllData();
    listenForEvents();
});