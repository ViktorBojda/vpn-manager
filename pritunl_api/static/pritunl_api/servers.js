const urlBase = "/pritunl/api/";
const serverTemplate = (id, name) =>
    `<div id=server-${id} class='card my-3 server-wrapper'>
        <div class='card-header server-header'>
            <input class="form-check-input server-check" type="checkbox" name="del-check" value="${id}" aria-label="Select checkbox">
            <span class="server-name">${name}</span>
        </div>
        <ul class='list-group list-group-flush route-list'></ul>
        <ul class='list-group list-group-flush org-list'></ul>
    </div>`;
const routeTemplate = (id, network, server_id) => 
    `<li id="route-${id}" class="list-group-item route-item">
        <input class="form-check-input route-check" type="checkbox" name="del-check" value="${server_id},${id}" aria-label="Select checkbox">
        <span class="route-network">${network}</span>
    </li>`;
const orgTemplate = (id, name, server_id) => 
    `<li id="org-${id}" class="list-group-item org-item">
        <input class="form-check-input org-check" type="checkbox" name="del-check" value="${server_id},${id}" aria-label="Select checkbox">
        <span class="org-name">${name}</span>
    </li>`;
let serverData = [];
let routeData = {};
let orgData = {};


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
    }).done(function (response) {
        $("#modal").modal("hide");
        $.when(fetchOrgsByServerID(serverID)).then(function () {
            rebuildServerOrgsByID(serverID);
        });
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

$("#btn-attach-org").on("click", function () {
    if (!serverData.length) {
        console.error("No servers found, you must add server before you can attach organization!");
        return;
    }
    $.when(fetchOrgs()).then(function(orgs) {
        if (!orgs.length) {
            console.error("No organizations found, you must add organization before you can attach it to server!");
            return;
        }

        let serverSelect = $(
            `<select id='form-input-server' name='server' class='form-select' required>
                <option value="" selected disabled>Select server</option>
            </select>`
        );
    
        $.each(serverData, function (key, val) {
            serverSelect.append($(`<option value=${val.id}>${val.name}</option>`));
        });

        let orgSelect = $(
            `<select id='form-input-org' name='organization' class='form-select' required>
                <option value="" selected disabled>Select organization</option>
            </select>`
        );
    
        $.each(orgs, function (key, val) {
            orgSelect.append($(`<option value=${val.id}>${val.name}</option>`));
        });
    
        $("#modal-header").text("Attach Organization");
        $("#modal-body").html(
            `<form id="form">
                <div class="mb-3">
                    <label for="form-input-server" class="form-label">Server</label>
                    ${serverSelect.prop("outerHTML")}
                </div>
                <div class="mb-3">
                    <label for="form-input-org" class="form-label">Organization</label>
                    ${orgSelect.prop("outerHTML")}
                </div>
            </form>`
        )
        $("#modal-footer").html(
            `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" form="form" class="btn btn-primary">Attach</button>`
        )
    
        $("#form").off().on("submit", function (event) {
            event.preventDefault();
            submitAttachOrg();
        });
    
        $("#modal").modal("show");
    })
});

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
    }).done(function (response) {
        $("#modal").modal("hide");
        $.when(fetchRoutesByServerID(response.server)).then(function () {
            rebuildServerRoutesByID(response.server);
        });
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

$("#btn-add-route").on("click", function () {
    if (!serverData.length) {
        console.error("No servers found, you must add server before you can add route!");
        return;
    }
    let serverSelect = $(
        `<select id='form-input-server' name='server' class='form-select' required>
            <option value="" selected disabled>Select server</option>
        </select>`
    );

    $.each(serverData, function (key, val) {
        serverSelect.append($(`<option value=${val.id}>${val.name}</option>`));
    });

    $("#modal-header").text("Add Route");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-network" class="form-label">Network</label>
                <input type="text" class="form-control" id="form-input-network" name="network" required>
            </div>
            <div class="mb-3">
                <label for="form-input-server" class="form-label">Server</label>
                ${serverSelect.prop("outerHTML")}
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Add</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddRoute();
    });

    $("#modal").modal("show");
});

function sortServers() {
    let servers = $("#server-container .server-wrapper").get();
    if (!servers.length) {
        console.error("Failed to sort, no servers found.");
        return;
    }

    servers.sort(function (server1, server2) {
        return $(server1).children(".server-header").text().trim().localeCompare($(server2).children(".server-header").text().trim())
    })

    $("#server-container").append(servers);
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
    }).done(function (response) {
        $("#modal").modal("hide");
        $.when(fetchServers(), fetchRoutesByServerID(response.id)).then(function () {
            $("#server-container").append($(serverTemplate(response.id, response.name)));
            rebuildServerRoutesByID(response.id);
            sortServers();
        });
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

$("#btn-add-server").on("click", function () {
    $("#modal-header").text("Add Server");
    $("#modal-body").html(
        `<form id="form">
            <div class="mb-3">
                <label for="form-input-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="form-input-name" name="name" required>
            </div>
            <div class="mb-3">
                <label for="form-input-network" class="form-label">Virtual Network</label>
                <input type="text" class="form-control" id="form-input-network" name="network" required>
            </div>
            <div class="mb-3">
                <div class="row g-3">
                    <div class="col-8">
                        <label for="form-input-port" class="form-label">Port</label>
                        <input type="number" min="1" max="65535" class="form-control" id="form-input-port" name="port" required>
                    </div>
                    <div class="col-4">
                        <label for="form-input-protocol" class="form-label">Protocol</label>
                        <select id='form-input-protocol' name='protocol' class='form-select' required>
                            <option value="tcp" selected>TCP</option>
                            <option value="udp">UDP</option>
                        </select>
                    </div>
                </div>  
            </div>
            <div class="mb-3">
                <div class="row g-3">
                    <div class="col">
                        <label for="form-input-cipher" class="form-label">Encryption Cipher</label>
                        <select id='form-input-cipher' name='cipher' class='form-select' required>
                            <option value="none">None</option>
                            <option value="bf128">Blowfish 128bit</option>
                            <option value="bf256">Blowfish 256bit</option>
                            <option value="aes128" selected>AES 128bit GCM</option>
                            <option value="aes192">AES 192bit GCM</option>
                            <option value="aes256">AES 256bit GCM</option>
                        </select>
                    </div>
                    <div class="col">
                        <label for="form-input-hash" class="form-label">Hash Algorithm</label>
                        <select id='form-input-hash' name='hash' class='form-select' required>
                            <option value="md5">MD5</option>
                            <option value="sha1" selected>SHA-1</option>
                            <option value="sha256">SHA-256</option>
                            <option value="sha512">SHA-512</option>
                        </select>
                    </div>
                </div>  
            </div>
            <div class="mb-3">
                <label for="form-input-network-mode" class="form-label">Network Mode</label>
                <select id='form-input-network-mode' name='network_mode' class='form-select' required>
                    <option value="tunnel" selected>Tunnel</option>
                    <option value="bridge">Bridge</option>
                </select>
            </div>
        </form>`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" form="form" class="btn btn-primary">Submit</button>`
    )

    $("#form").off().on("submit", function (event) {
        event.preventDefault();
        submitAddServer();
    });

    $("#modal").modal("show");
});

function rebuildServerOrgsByID(server_id) {
    if (server_id in orgData) {
        let orgList = $(`#server-${server_id} > .org-list`);
        orgList.empty();
        orgData[server_id].forEach(org => {
            orgList.append($(orgTemplate(org.id, org.name, org.server)));
        });
    }
}

function rebuildServerRoutesByID(server_id) {
    if (server_id in routeData) {
        let routeList = $(`#server-${server_id} > .route-list`);
        routeList.empty();
        routeData[server_id].forEach(route => {
            routeList.append($(routeTemplate(route.id, route.network, route.server)));
        });
    }
}

function rebuildServerContainer() {
    let serverContainer = $("#server-container");
    serverContainer.empty();

    serverData.forEach(server => {
        let card = $(serverTemplate(server.id, server.name));
        serverContainer.append(card);

        rebuildServerRoutesByID(server.id);
        rebuildServerOrgsByID(server.id);
    });
}

function fetchOrgs() {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/"
    }).done(function (data) {
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchOrgsByServerID(serverID) {
    return $.ajax({
        type: "GET",
        url: `${urlBase}servers/${serverID}/organizations/`
    }).done(function (data) {
        if (data.length == 0)
            delete orgData[serverID];
        else
            orgData[serverID] = data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchRoutesByServerID(serverID) {
    return $.ajax({
        type: "GET",
        url: `${urlBase}servers/${serverID}/routes/`
    }).done(function (data) {
        if (data.length == 0)
            delete routeData[serverID];
        else
            routeData[serverID] = data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchRoutesAndOrgs() {
    ajaxCalls = [];
    serverData.forEach(server => {
        ajaxCalls.push(fetchRoutesByServerID(server.id));
        ajaxCalls.push(fetchOrgsByServerID(server.id));
    });
    return ajaxCalls;
}

function fetchServers() {
    return $.ajax({
        type: "GET",
        url: urlBase + "servers/"
    }).done(function (data) {
        serverData = data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchAllData() {
    $.when(fetchServers()).then(function () {
        orgData = {};
        routeData = {};
        $.when.apply($, fetchRoutesAndOrgs()).then(function () {
            rebuildServerContainer();
        });
    })
}

$(function() {
    fetchAllData();
});
