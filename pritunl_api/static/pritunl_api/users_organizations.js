let urlBase = "/pritunl/api/";
let orgData = [];
let userData = {};

$("#bttn-add-org").on("click", function () {
    $("#modal-header").text("Add Group");
    $("#modal-body").html(
        `<div class="mb-3">
            <label for="form-input-name" class="form-label">Name</label>
            <input type="text" class="form-control" id="form-input-name" required>
        </div>`
    )

    $("#modal").modal("show");
});

$("#bttn-add-user").on("click", function () {
    if (!orgData.length) {
        console.error("No organizations found, you must add organization before you can add user!");
        return;
    }
    let orgSelect = $(
        `<select id='form-input-org' class='form-select' required>
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
            <input type="text" class="form-control" id="form-input-name" required>
        </div>
        <div class="mb-3">
            <label for="form-input-org" class="form-label">Organization</label>
            ${orgSelect.prop("outerHTML")}
        </div>
        <div class="mb-3">
            <label for="form-input-email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="form-input-email">
        </div>`
    )

    $("#modal").modal("show");
});

function fillOrgContainer() {
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
            fillOrgContainer()
        });
    });
}

$(window).on('load', function () {
    reloadAllData();
});