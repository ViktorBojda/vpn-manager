let urlBase = "/pritunl/api/";
let orgData = [];
let userData = {};

$("#btn-add-org").on("click", function () {
    $("#modal-header").text("Add Group");
    $("#modal-body").html(
        `<div class="mb-3">
            <label for="form-input-name" class="form-label">Name</label>
            <input type="text" class="form-control" id="form-input-name" required>
        </div>`
    )

    $("#modal").modal("show");
});

function submitAddUser() {
    let formData = $("form").serializeArray();
    let orgID;
    let user = {};
    
    formData.forEach(function(item, idx, object) {
        if (item.value.trim().length === 0)
            object.splice(idx, 1);
        else
            user[item.name] = item.value; 
    });
    orgID = user.organization;
    delete user.organization;

    $.ajax({
        method: "POST",
        url: urlBase + "organizations/" + orgID + "/users/create/",
        data: user
    }).done(function() {
        $("#modal").modal("hide");
        $.when(reloadUsersByOrgID(orgID)).then(function() {
            rebuildOrgByID(orgID);
        });
    }).fail(function(xhr) {
        alert(xhr.responseText);
    })
}

$("#btn-add-user").on("click", function () {
    if (!orgData.length) {
        console.error("No organizations found, you must add organization before you can add user!");
        return;
    }
    let orgSelect = $(
        `<select id='form-input-org' name='organization' class='form-select' required>
            <option value="" selected disabled>Select organization</option>
        </select>`
    );

    $.each(orgData, function (key, val) {
        orgSelect.append($(`<option value=${val.id}>${val.name}</option>`));
    });

    $("#modal-header").text("Add User");
    $("#modal-body").html(
        `<div class="mb-3">
            <label for="form-input-name" class="form-label">Name</label>
            <input type="text" class="form-control" id="form-input-name" name="name" required>
        </div>
        <div class="mb-3">
            <label for="form-input-org" class="form-label">Organization</label>
            ${orgSelect.prop("outerHTML")}
        </div>
        <div class="mb-3">
            <label for="form-input-group" class="form-label">Groups</label>
            <input type="text" class="form-control" id="form-input-group" name="groups">
        </div>
        <div class="mb-3">
            <label for="form-input-email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="form-input-email" name="email">
        </div>`
    )
    $("form").off().on("submit", function(event) {
        event.preventDefault();
        submitAddUser();
    });

    $("#modal").modal("show");
});

function rebuildOrgByID(orgID) {
    let userList = $("#org-" + orgID + " ul");
    userList.empty();
    if (orgID in userData) {
        userData[orgID].forEach(user => {
            userList.append($("<li class='list-group-item'>" + user.name + "</li>"));
        });
    }
}

function rebuildOrgContainer() {
    let orgContainer = $("#org-container");
    orgContainer.empty();

    orgData.forEach(org => {
        let card = $("<div id=org-" + org.id + " class='card my-3'></div>");
        orgContainer.append(card);

        card.append($("<div class='card-header'>" + org.name + "</div>"));
        let userList = $("<ul class='list-group list-group-flush'>");
        card.append(userList);

        if (org.id in userData) {
            userData[org.id].forEach(user => {
                userList.append($("<li class='list-group-item'>" + user.name + "</li>"));
            });
        }
    });
}

function reloadUsersByOrgID(orgID) {
    return $.ajax({
        type: "GET",
        url: urlBase + "organizations/" + orgID + "/users/"
    }).done(function (data) {
        if (data.length == 0)
            delete userData[orgID];
        else
            userData[orgID] = data;
    });
}

function reloadAllUsers() {
    ajaxCalls = [];
    orgData.forEach(org => {
        ajaxCalls.push(reloadUsersByOrgID(org.id));
    });
    return ajaxCalls;
}

function reloadAllData() {
    $.when($.ajax({
        type: "GET",
        url: urlBase + "organizations/"
    })).done(function (data) {
        orgData = data;
        userData = {};
        $.when.apply($, reloadAllUsers()).then(function () {
            rebuildOrgContainer()
        });
    });
}

$(window).on('load', function () {
    reloadAllData();
});