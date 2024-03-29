const serverTemplate = (serverData) =>
    `<div id=server-${serverData.id} class='card my-3 server-wrapper'>
        <div class='card-header row mx-0 px-0 align-items-center'>
            <div class="col-auto">
                <span class="pe-3 me-3 border-end"><input class="form-check-input server-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
                <span class="fw-medium clickable server-data-name">${serverData.name}</span>
            </div>
            <div class="col d-flex column-gap-3 justify-content-end">
                <span class="spinner-border ms-auto d-none" role="status" aria-hidden="true"></span>
                <button type="button" disabled class="btn btn-success server-start-btn" onclick="controlServer('${serverData.id}', 'start')">Start Server</button>
                <button type="button" class="btn btn-primary server-restart-btn" onclick="controlServer('${serverData.id}', 'restart')">Restart Server</button>
                <button type="button" class="btn btn-warning server-stop-btn" onclick="controlServer('${serverData.id}', 'stop')">Stop Server</button>
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
        <ul class='list-group list-group-flush org-list'>
            <li class="list-group-item border-top border-bottom row mx-0 px-0 align-items-center text-center d-none no-attached-orgs-info dont-destroy">
                There are no organizations attached to this server.
            </li>
        </ul>
    </div>`;
const routeTemplate = (routeData) => 
    `<li id="route-${routeData.id}" class="list-group-item border-top border-bottom row mx-0 px-0 align-items-center route-item">
        <span class="pe-3 me-3 border-end"><input class="form-check-input route-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
        <span class="px-0 me-1 fw-medium clickable route-data-network">${routeData.network}</span>
        <span class="fst-italic route-data-comment">${routeData.comment ? routeData.comment : ''}</span>
    </li>`;
const orgTemplate = (orgData) => 
    `<li id="org-${orgData.id}" class="list-group-item border-top border-bottom row mx-0 px-0 align-items-center org-item">
        <span class="pe-3 me-3 border-end"><input class="form-check-input org-check" type="checkbox" name="checkbox" aria-label="Select checkbox"></span>
        <span class="px-0 fw-medium org-data-name">${orgData.name}</span>
    </li>`;
let isReadOnly = true;

function makePageReadOnly() {
    $("#main-container :checkbox, #main-container :button").prop("disabled", true);
    $("#main-container .clickable").off();
}

function deleteSelected(servers, routesOrgs) {
    showFormSpinner()
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
        doneCallbacks: [{func: () => $("#modal").modal("hide")}],
        alwaysCallbacks: [{func: () => hideFormSpinner()}],
        beforeSendCallback: () => showFormSpinner()
    });
}

function addRoute() {
    const data = parseFormData();
    createRouteApi({
        serverID: data.server, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}],
        alwaysCallbacks: [{func: () => hideFormSpinner()}],
        beforeSendCallback: () => showFormSpinner()
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
        const comment = values[1] ? values[1].trim() : null;

        routeList.push({ network: network, comment: comment });
    }
    bulkCreateRoutesApi({
        serverID: data.server, data: {'route_list': routeList},
        doneCallbacks: [{func: () => $("#modal").modal("hide")}],
        alwaysCallbacks: [{func: () => hideFormSpinner()}],
        beforeSendCallback: () => showFormSpinner()
    });
}

function editRoute() {
    const data = parseFormData();
    updateRouteApi({
        serverID: data.server, routeID: data.id, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}],
        alwaysCallbacks: [{func: () => hideFormSpinner()}],
        beforeSendCallback: () => showFormSpinner()
    });
}

function addServer() {
    const data = parseFormData();
    if ('groups' in data && data.groups != null)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    createServerApi({
        data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}],
        alwaysCallbacks: [{func: () => hideFormSpinner()}],
        beforeSendCallback: () => showFormSpinner()
    });
}

function editServer() {
    const data = parseFormData();
    if ('groups' in data && data.groups != null)
        data.groups = data.groups.split(/[ ,]+/).map(item => item.trim());
    updateServerApi({
        serverID: data.id, data: data,
        doneCallbacks: [{func: () => $("#modal").modal("hide")}],
        alwaysCallbacks: [{func: () => hideFormSpinner()}],
        beforeSendCallback: () => showFormSpinner()
    });
}

function rebuildAttachedOrgsByServerID(serverID) {
    fetchAttachedOrgsByServerIdApi({
        serverID: serverID,
        doneCallbacks: [
            {
                func: ({apiData}) => {
                    const serverWrapper = $(`#server-${serverID}`);
                    serverWrapper.data('org-count', apiData.length);
                    const startBtn = serverWrapper.find('.server-start-btn');
                    if (apiData.length) {
                        serverWrapper.find('.no-attached-orgs-info').addClass('d-none');
                        isReadOnly ? startBtn.prop('disabled', true) : startBtn.prop('disabled', false);
                    }
                    else {
                        serverWrapper.find('.no-attached-orgs-info').removeClass('d-none');
                        startBtn.prop('disabled', true)
                    }
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

function controlServer(serverID, action) {
    const actions = ['start', 'restart', 'stop'];
    if (!actions.includes(action)) {
        console.error('Invalid action: ' + action);
        return;
    }
    const serverWrapper = $(`#server-${serverID}`);
    serverWrapper.find(`.server-${action}-btn`).prop('disabled', true);
    controlServerApi({
        serverID: serverID, action: action,
        beforeSendCallback: () => serverWrapper.find('.spinner-border').removeClass('d-none'),
        failCallbacks: [{func: () => serverWrapper.find(`.server-${action}-btn`).prop('disabled', false)}],
        alwaysCallbacks: [{func: () => serverWrapper.find('.spinner-border').addClass('d-none')}],
    });
}

function refreshAttachOrgModal(onlyServers = false) {
    // Refresh org list inside of attach org modal
    const serverData = $('#servers-container').data('server-data');

    if (onlyServers) {
        const orgData = $('#servers-container').data('org-data');
        $('#btn-attach-org').off('click').on('click', () => showAttachOrgModal(orgData, serverData));
        return;
    }
    fetchOrgsApi({
        doneCallbacks: [{
            func: ({apiData, serverData}) => {
                const btnAttachOrg = $('#btn-attach-org');
                (apiData && serverData && !isReadOnly) ?  
                btnAttachOrg.prop('disabled', false).off('click').on('click', () => showAttachOrgModal(apiData, serverData)) :
                btnAttachOrg.prop('disabled', true)
                $('#servers-container').data('org-data', apiData);
            },
            args: {serverData}
        }]
    });
}

function configureMenuBtns(serverData) {
    if (serverData.length == 0) {
        $('#btn-add-route').prop('disabled', true);
        $('#btn-bulk-add-routes').prop('disabled', true);
        $('#no-servers-info').removeClass('d-none');
        $('#btn-attach-org').prop('disabled', true).data('refresh-orgs', true);
        return;
    }
    $('#no-servers-info').addClass('d-none');
    $('#btn-add-route').prop('disabled', false).off('click').on('click', () => showAddEditRouteModal('add', serverData));
    $('#btn-bulk-add-routes').prop('disabled', false).off('click').on('click', () => showBulkAddRoutesModal(serverData));
    $('#servers-container').data('server-data', serverData);

    if ($('#btn-attach-org').data('refresh-orgs')) {
        $('#btn-attach-org').data('refresh-orgs', false);
        refreshAttachOrgModal();
        return;
    }

    refreshAttachOrgModal(true);
}

function configureServerControlBtns(serverData) {
    serverData.forEach(server => {
        const serverWrapper = $(`#server-${server.id}`);
        const startBtn = serverWrapper.find('.server-start-btn')
        const restartBtn = serverWrapper.find('.server-restart-btn')
        const stopBtn = serverWrapper.find('.server-stop-btn')

        if (server.status == "online") {
            startTimer(serverWrapper.find('.server-uptime'), server.uptime);
            startBtn.hide();
            restartBtn.show().prop('disabled', false);
            stopBtn.show().prop('disabled', false);
        }
        else {
            stopTimer(serverWrapper.find('.server-uptime'));
            startBtn.show();
            serverWrapper.data('org-count') ? startBtn.prop('disabled', false) : startBtn.prop('disabled', true)
            if (serverWrapper.data('org-count')) {
                startBtn.prop('disabled', false);
                serverWrapper.find('.no-attached-orgs-info').addClass('d-none');
            }
            else {
                startBtn.prop('disabled', true);
                serverWrapper.find('.no-attached-orgs-info').removeClass('d-none');
            }
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
                onCreateCallback: (elm) => $(elm).data('org-count', 0),
                callbacks: [
                    [insertIDsIntoCheckboxes, 'server'], configureMenuBtns, configureServerControlBtns,
                    [insertEditModal, 'server', 'name', showAddEditServerModal], checkForCheckBoxes
                ]
            }
        }]
    });
}

function rebuildAllData() {
    $.when(rebuildServers()).then(function (serverData) {
        refreshAttachOrgModal();
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
    isReadOnly = JSON.parse(document.getElementById('is-readonly').textContent);
    isReadOnly ? '' : $("#btn-add-server").prop('disabled', false);
    rebuildAllData();
    listenForEvents();
});
