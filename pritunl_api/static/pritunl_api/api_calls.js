function fetchOrgs(doneCallback = []) {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/"
    }).done(function (data) {
        if (doneCallback.length) {
            const callback = doneCallback.shift();
            callback(data, ...doneCallback);
        }
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function fetchUsersByOrgID(orgID, doneCallback = []) {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/" + orgID + "/users/"
    }).done(function (data) {
        if (doneCallback.length) {
            const callback = doneCallback.shift();
            callback(data, ...doneCallback);
        }
        return data;
    }).fail(function (xhr) {
        alert(xhr.responseText);
    });
}

function createUser(orgID, data) {
    return $.ajax({
        method: "POST",
        url: urlBase + "organizations/" + orgID + "/users/create/",
        data: data
    }).done(function() {
        $("#modal").modal("hide");
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

function updateUser(orgID, userID, data) {
    return $.ajax({
        method: "PUT",
        url: urlBase + `organizations/${orgID}/users/${userID}/update/`,
        data: data
    }).done(function() {
        $("#modal").modal("hide");
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

function createOrg(data) {
    $.ajax({
        method: "POST",
        url: urlBase + "organizations/create/",
        data: data
    }).done(function () {
        $("#modal").modal("hide");
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}

function updateOrg(orgID, data) {
    $.ajax({
        method: "PUT",
        url: urlBase + `organizations/${orgID}/update/`,
        data: data
    }).done(function () {
        $("#modal").modal("hide");
    }).fail(function (xhr) {
        alert(xhr.responseText);
    })
}