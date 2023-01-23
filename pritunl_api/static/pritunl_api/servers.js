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


function rebuildServerContainer() {
    let serverContainer = $("#server-container");
    serverContainer.empty();

    serverData.forEach(server => {
        let card = $(serverTemplate(server.id, server.name));
        serverContainer.append(card);

        if (server.id in routeData) {
            let routeList = card.children(".route-list");
            routeData[server.id].forEach(route => {
                routeList.append($(routeTemplate(route.id, route.network, route.server)));
            });
        }

        if (server.id in orgData) {
            let orgList = card.children(".org-list");
            orgData[server.id].forEach(org => {
                orgList.append($(orgTemplate(org.id, org.name, org.server)));
            });
        }
    });
}

function reloadOrgsByServerID(serverID) {
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

function reloadRoutesByServerID(serverID) {
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

function reloadRoutesAndOrgs() {
    ajaxCalls = [];
    serverData.forEach(server => {
        ajaxCalls.push(reloadRoutesByServerID(server.id));
        ajaxCalls.push(reloadOrgsByServerID(server.id));
    });
    return ajaxCalls;
}

function reloadServers() {
    return $.ajax({
        type: "GET",
        url: urlBase + "servers/"
    }).done(function (data) {
        serverData = data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function reloadAllData() {
    $.when(reloadServers()).then(function () {
        orgData = {};
        routeData = {};
        $.when.apply($, reloadRoutesAndOrgs()).then(function () {
            rebuildServerContainer();
        });
    })
}

$(function() {
    reloadAllData();
});
