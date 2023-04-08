const urlBase = "/pritunl/api/";
const serverTemplate = (id, name) =>
    `<div id=server-${id} class='card my-3 server-wrapper'>
        <div class='card-header server-header'>
            <input class="form-check-input server-check" type="checkbox" name="del-check" value="${id}" aria-label="Select checkbox">
            <span class="server-name">${name}</span>
            <button type="button" class="btn btn-success btn-start-server ms-3">Start Server</button>
            <button type="button" class="btn btn-primary btn-restart-server ms-3">Restart Server</button>
            <button type="button" class="btn btn-warning btn-stop-server">Stop Server</button>
        </div>
        <ul class='list-group list-group-flush d-flex route-list'></ul>
        <ul class='list-group list-group-flush d-flex org-list'></ul>
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

$("#btn-del-select").on("click", function () {
    let servers = $(".server-check:checked");
    let routes = $(".route-check:checked:not(:disabled)");
    let orgs = $(".org-check:checked:not(:disabled)");

    let itemList = $("<ul></ul>");
    if (servers.length) {
        servers.each(function(){
            itemList.append($("<li>" + $(this).siblings(".server-name").text() + "</li>"));
        });
    }
    if (routes.length) {
        routes.each(function(){
            itemList.append($("<li>" + $(this).siblings(".route-network").text() + "</li>"));
        });
    }
    if (orgs.length) {
        orgs.each(function(){
            itemList.append($("<li>" + $(this).siblings(".org-name").text() + "</li>"));
        });
    }

    $("#modal-header").text("Delete Selected");
    $("#modal-body").html(
        `<h2 class="fs-6">Are you sure you want to delete the following items?</h2>
        ${itemList.prop("outerHTML")}`
    )
    $("#modal-footer").html(
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" id="modal-btn-del"class="btn btn-primary">Delete</button>`
    )

    $("#modal-btn-del").off().on("click", function() {
        $.when.apply($, deleteAllSelected(servers, routes, orgs)).then(function() {
            fetchAllData();
            $("#modal").modal("hide");
        });
    });

    $("#modal").modal("show");
});

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
        $.when(fetchAttachedOrgsByServerID(serverID)).then(function () {
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
    let servers = $("#servers-container .server-wrapper").get();
    if (!servers.length) {
        console.error("Failed to sort, no servers found.");
        return;
    }

    servers.sort(function (server1, server2) {
        return $(server1).children(".server-header").text().trim().localeCompare($(server2).children(".server-header").text().trim())
    })

    $("#servers-container").append(servers);
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
            rebuildServerByID(response.id);
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
            if (route.virtual_network) {
                let routeHTML = $(routeTemplate(route.id, route.network, route.server));
                routeHTML.find(".route-check").remove();
                routeList.append(routeHTML);
            }
            else
                routeList.append($(routeTemplate(route.id, route.network, route.server)));
        });
    }
}

function rebuildServerByID(server_id) {
    let server = serverData.filter(server => server.id == server_id).pop();
    if (server === undefined)
        return;

    let wrapper = $(serverTemplate(server.id, server.name));
    if (server.status == "online")
        wrapper.find(".btn-start-server").addClass("d-none");
    else {
        wrapper.find(".btn-restart-server").addClass("d-none");
        wrapper.find(".btn-stop-server").addClass("d-none");
    }
    $("#servers-container").append(wrapper);
}

function rebuildServerContainer() {
    $("#servers-container").empty();

    serverData.forEach(server => {
        rebuildServerByID(server.id);
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

function fetchAttachedOrgsByServerID(serverID) {
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
        ajaxCalls.push(fetchAttachedOrgsByServerID(server.id));
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

$(document).on("click", ".btn-restart-server", function() {
    let restartBtn = $(this);
    restartBtn.prop("disabled", true)
    let serverID = restartBtn.parents(".server-wrapper").attr("id").replace("server-", "");
    ajaxCalls.push(
        $.ajax({
            type: "PUT",
            url: `${urlBase}servers/${serverID}/restart/`
        }).done(function() {
            restartBtn.prop("disabled", false)
        }).fail(function (xhr) {
            alert(xhr.responseText);
        })
    );
})

$(document).on("click", ".btn-stop-server", function() {
    let stopBtn = $(this);
    let serverID = stopBtn.parents(".server-wrapper").attr("id").replace("server-", "");
    ajaxCalls.push(
        $.ajax({
            type: "PUT",
            url: `${urlBase}servers/${serverID}/stop/`
        }).done(function() {
            stopBtn.addClass("d-none");
            stopBtn.siblings(".btn-restart-server").addClass("d-none");
            stopBtn.siblings(".btn-start-server").removeClass("d-none");
        }).fail(function (xhr) {
            alert(xhr.responseText);
        })
    );
})

$(document).on("click", ".btn-start-server", function() {
    let startBtn = $(this);
    startBtn.prop("disabled", true)
    let serverID = startBtn.parents(".server-wrapper").attr("id").replace("server-", "");
    ajaxCalls.push(
        $.ajax({
            type: "PUT",
            url: `${urlBase}servers/${serverID}/start/`
        }).done(function() {
            startBtn.prop("disabled", false)
            startBtn.addClass("d-none");
            startBtn.siblings(".btn-restart-server, .btn-stop-server").removeClass("d-none");
        }).fail(function (xhr) {
            alert(xhr.responseText);
        })
    );
})

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
});

function fetchAttachedOrgsByServerID2(serverID) {
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

function rebuildRoutesByServerID2(serverID, serverData) {
    let routeList = $(`#server-${serverID}`).find('.route-list');

    // Check if the existing route item's ID is in the array of server data, if not remove it
    routeList.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = userData.some(function(obj) {
            return `route-${obj.id}` == childId;
        });
        return !hasId;
      }).remove();

    // Check whether route item exists, if it does update it, if not create new one
    serverData.forEach((route, idx) => {
        let routeItem = $(`#user-${user.id}`);
        if (routeItem.length)
            routeItem.find(".user-name").text(user.name);
        else {
            routeItem = $(userTemplate(user.id, user.name, orgID));
            userList.append(routeItem);
        }
        userItem.css('order', idx);
    });
}

function fetchRoutesByServerID2(serverID) {
    return $.ajax({
        type: "GET",
        url: `${urlBase}servers/${serverID}/routes/`
    }).done(function (data) {
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchAllData2() {
    $.when(fetchServers2()).then(function (serverData) {
        rebuildServers2(serverData);
        serverData.forEach(server => {
            fetchRoutesByServerID2(server.id);
            fetchAttachedOrgsByServerID2(server.id);
        });
    })
}

function fetchServers2() {
    return $.ajax({
        type: "GET",
        url: urlBase + "servers/"
    }).done(function (data) {
        // serverData = data;
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function rebuildServers2(serverData) {
    let serversContainer = $("#servers-container");

    // Check if the existing server card's ID is in the array of server data, if not remove it
    serversContainer.children().filter(function() {
        const childId = $(this).attr('id');
        const hasId = serverData.some(function(obj) {
            return `server-${obj.id}` == childId;
        });
        return !hasId;
      }).remove();

    if (serverData.length == 0) {
        $('#btn-add-route').prop('disabled', true);
        console.log("No servers found, you must add server before you can add route!");
        $('#btn-attach-org').prop('disabled', true);
        console.log("No servers found, you must add server before you can attach organization!");
        return;
    }
    $('#btn-add-route').prop('disabled', false).off('click').on('click', () => showAddUserModal(orgData));
    $('#btn-attach-org').prop('disabled', false).off('click').on('click', () => showAddUserModal(orgData));

    // Check whether server card exists, if it does update it, if not create new one
    serverData.forEach((server, idx) => {
        let serverCard = $(`#server-${server.id}`);
        if (serverCard.length)
            serverCard.find(".server-name").text(server.name);
        else {
            serverCard = $(serverTemplate(server.id, server.name));
            serversContainer.append(serverCard);
        }

        serverCard.css('order', idx);
    });
}
